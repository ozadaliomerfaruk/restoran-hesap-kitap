/**
 * Kasa İşlemleri Hook
 */

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { BirlesikIslem } from "../types";

export function useKasaIslemleri(kasaId: string | undefined) {
  const { profile, kasalar, fetchKasalar } = useStore();
  const [islemler, setIslemler] = useState<BirlesikIslem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchIslemler = useCallback(async () => {
    if (!kasaId || !profile?.restaurant_id) return;

    // Ana işlemler
    const { data: islemlerData } = await supabase
      .from("islemler")
      .select(`*, cari:cariler(id, name, type), kategori:kategoriler(id, name)`)
      .eq("restaurant_id", profile.restaurant_id)
      .or(`kasa_id.eq.${kasaId},kasa_hedef_id.eq.${kasaId}`)
      .order("date", { ascending: false });

    // Personel işlemleri
    const { data: personelData } = await supabase
      .from("personel_islemler")
      .select(`*, personel:personel(id, name)`)
      .eq("restaurant_id", profile.restaurant_id)
      .eq("kasa_id", kasaId)
      .order("date", { ascending: false });

    // Tüm created_by ID'lerini topla
    const allCreatedByIds = [
      ...(islemlerData || []).map((i) => i.created_by),
      ...(personelData || []).map((i) => i.created_by),
    ].filter(Boolean);

    const uniqueCreatedByIds = [...new Set(allCreatedByIds)];

    // Kullanıcı bilgilerini al
    let profilesMap: Record<
      string,
      { id: string; name?: string; email?: string }
    > = {};

    if (uniqueCreatedByIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", uniqueCreatedByIds);

      if (profiles) {
        profiles.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
    }

    const birlesikListe: BirlesikIslem[] = [];

    (islemlerData || []).forEach((islem) => {
      const isTransferIn =
        islem.type === "transfer" && islem.kasa_hedef_id === kasaId;

      let relatedKasa: { id: string; name: string } | undefined;
      if (islem.type === "transfer") {
        const relatedKasaId = isTransferIn
          ? islem.kasa_id
          : islem.kasa_hedef_id;
        const foundKasa = kasalar.find((k) => k.id === relatedKasaId);
        if (foundKasa) relatedKasa = { id: foundKasa.id, name: foundKasa.name };
      }

      birlesikListe.push({
        id: islem.id,
        type: islem.type,
        amount: islem.amount,
        description: islem.description,
        date: islem.date,
        kasa_id: islem.kasa_id,
        kasa_hedef_id: islem.kasa_hedef_id,
        kategori_id: islem.kategori_id,
        source: "islem",
        cari: islem.cari,
        kategori: islem.kategori,
        target_kasa: relatedKasa,
        isTransferIn,
        created_by_user: islem.created_by
          ? profilesMap[islem.created_by]
          : undefined,
      });
    });

    (personelData || []).forEach((islem) => {
      birlesikListe.push({
        id: islem.id,
        type:
          islem.type === "odeme"
            ? "personel_odeme"
            : islem.type === "tahsilat"
            ? "personel_tahsilat"
            : islem.type,
        amount: islem.amount,
        description: islem.description,
        date: islem.date,
        kasa_id: islem.kasa_id,
        source: "personel",
        personel: islem.personel,
        created_by_user: islem.created_by
          ? profilesMap[islem.created_by]
          : undefined,
      });
    });

    birlesikListe.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setIslemler(birlesikListe);
  }, [kasaId, profile?.restaurant_id, kasalar]);

  const updateIslem = useCallback(
    async (
      islem: BirlesikIslem,
      newDate: Date,
      newAmount: string,
      newDesc: string,
      newKategoriId: string
    ) => {
      if (!newAmount || isNaN(parseFloat(newAmount))) {
        Alert.alert("Hata", "Geçerli bir tutar girin");
        return false;
      }

      setLoading(true);
      try {
        const dateString = newDate.toISOString().split("T")[0];
        const amount = parseFloat(newAmount);
        const amountDiff = amount - islem.amount;

        if (islem.source === "personel") {
          await supabase
            .from("personel_islemler")
            .update({ date: dateString, amount, description: newDesc || null })
            .eq("id", islem.id);

          if (islem.kasa_id && amountDiff !== 0) {
            const balanceChange =
              islem.type === "personel_odeme" ? -amountDiff : amountDiff;
            await supabase.rpc("update_kasa_balance", {
              kasa_id: islem.kasa_id,
              amount: balanceChange,
            });
          }
        } else {
          await supabase
            .from("islemler")
            .update({
              date: dateString,
              amount,
              description: newDesc || null,
              kategori_id: newKategoriId || null,
            })
            .eq("id", islem.id);

          if (islem.kasa_id && amountDiff !== 0) {
            let balanceChange = 0;
            if (["gelir", "tahsilat"].includes(islem.type))
              balanceChange = amountDiff;
            else if (["gider", "odeme"].includes(islem.type))
              balanceChange = -amountDiff;
            if (balanceChange !== 0) {
              await supabase.rpc("update_kasa_balance", {
                kasa_id: islem.kasa_id,
                amount: balanceChange,
              });
            }
          }

          if (islem.cari?.id && amountDiff !== 0) {
            let cariChange = 0;
            if (islem.type === "gider") cariChange = amountDiff;
            else if (islem.type === "gelir") cariChange = -amountDiff;
            else if (islem.type === "odeme") cariChange = -amountDiff;
            else if (islem.type === "tahsilat") cariChange = amountDiff;
            if (cariChange !== 0) {
              await supabase.rpc("update_cari_balance", {
                cari_id: islem.cari.id,
                amount: cariChange,
              });
            }
          }
        }

        await fetchKasalar();
        await fetchIslemler();
        Alert.alert("Başarılı", "İşlem güncellendi");
        return true;
      } catch (error) {
        Alert.alert("Hata", "Güncelleme başarısız");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchKasalar, fetchIslemler]
  );

  const deleteIslem = useCallback(
    async (islem: BirlesikIslem) => {
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          "İşlemi Sil",
          `${islem.amount.toLocaleString(
            "tr-TR"
          )} ₺ tutarındaki işlemi silmek istediğinize emin misiniz?`,
          [
            { text: "İptal", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Sil",
              style: "destructive",
              onPress: async () => {
                setLoading(true);
                try {
                  if (islem.source === "personel") {
                    if (islem.kasa_id) {
                      await supabase.rpc("update_kasa_balance", {
                        kasa_id: islem.kasa_id,
                        amount:
                          islem.type === "personel_odeme"
                            ? islem.amount
                            : -islem.amount,
                      });
                    }
                    await supabase
                      .from("personel_islemler")
                      .delete()
                      .eq("id", islem.id);
                  } else {
                    if (islem.type === "transfer") {
                      if (islem.kasa_id)
                        await supabase.rpc("update_kasa_balance", {
                          kasa_id: islem.kasa_id,
                          amount: islem.amount,
                        });
                      if (islem.kasa_hedef_id)
                        await supabase.rpc("update_kasa_balance", {
                          kasa_id: islem.kasa_hedef_id,
                          amount: -islem.amount,
                        });
                    } else {
                      let kasaChange = 0;
                      if (["gelir", "tahsilat"].includes(islem.type))
                        kasaChange = -islem.amount;
                      else if (["gider", "odeme"].includes(islem.type))
                        kasaChange = islem.amount;
                      if (kasaChange !== 0 && islem.kasa_id) {
                        await supabase.rpc("update_kasa_balance", {
                          kasa_id: islem.kasa_id,
                          amount: kasaChange,
                        });
                      }
                      if (islem.cari?.id) {
                        let cariChange = 0;
                        if (islem.type === "gider") cariChange = -islem.amount;
                        else if (islem.type === "gelir")
                          cariChange = islem.amount;
                        else if (islem.type === "odeme")
                          cariChange = islem.amount;
                        else if (islem.type === "tahsilat")
                          cariChange = -islem.amount;
                        if (cariChange !== 0)
                          await supabase.rpc("update_cari_balance", {
                            cari_id: islem.cari.id,
                            amount: cariChange,
                          });
                      }
                    }
                    await supabase.from("islemler").delete().eq("id", islem.id);
                  }
                  await fetchKasalar();
                  await fetchIslemler();
                  Alert.alert("Başarılı", "İşlem silindi");
                  resolve(true);
                } catch (error) {
                  Alert.alert("Hata", "Silme başarısız");
                  resolve(false);
                } finally {
                  setLoading(false);
                }
              },
            },
          ]
        );
      });
    },
    [fetchKasalar, fetchIslemler]
  );

  return {
    islemler,
    loading,
    fetchIslemler,
    updateIslem,
    deleteIslem,
  };
}
