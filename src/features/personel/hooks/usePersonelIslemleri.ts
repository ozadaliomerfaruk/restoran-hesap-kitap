// usePersonelIslemleri Hook - İşlem yönetimi

import { useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../lib/supabase";
import { useStore } from "../../../store/useStore";
import { Personel, PersonelIslem, Izin } from "../../../types";
import { GiderKategori, IslemTipi, IzinTipiValue } from "../types";
import { GIDER_KATEGORILERI } from "../constants";

interface IslemFormData {
  date: string;
  kasaId: string | null;
  kategori: GiderKategori;
  description: string;
  amount: string;
}

interface IzinFormData {
  type: IzinTipiValue;
  startDate: string;
  endDate: string;
  days: string;
  description: string;
  tipiEkleDus: "ekle" | "dus";
}

export const usePersonelIslemleri = () => {
  const {
    profile,
    fetchPersoneller,
    fetchPersonelIslemler,
    fetchKasalar,
    fetchIslemler,
    fetchIzinler,
  } = useStore();

  // İşlem kaydet
  const submitIslem = useCallback(
    async (
      personel: Personel,
      islemTipi: IslemTipi,
      formData: IslemFormData
    ): Promise<boolean> => {
      const amount = parseFloat(formData.amount);
      if (!amount || amount <= 0) {
        Alert.alert("Hata", "Geçerli bir tutar girin");
        return false;
      }

      if (
        !formData.kasaId &&
        (islemTipi === "odeme" || islemTipi === "tahsilat")
      ) {
        Alert.alert("Hata", "Lütfen bir kasa seçin");
        return false;
      }

      let description = formData.description.trim();
      let islemType: string;

      switch (islemTipi) {
        case "gider":
          islemType = formData.kategori;
          const kategoriLabel =
            GIDER_KATEGORILERI.find((k) => k.value === formData.kategori)
              ?.label || formData.kategori;
          if (!description) description = `${personel.name} - ${kategoriLabel}`;
          break;
        case "odeme":
          islemType = "odeme";
          if (!description) description = `${personel.name} - Ödeme`;
          break;
        case "tahsilat":
          islemType = "tahsilat";
          if (!description) description = `${personel.name} - Tahsilat`;
          break;
        default:
          return false;
      }

      try {
        // İşlemi kaydet
        const { error: islemError } = await supabase
          .from("personel_islemler")
          .insert({
            type: islemType,
            amount,
            description,
            date: formData.date,
            kasa_id:
              islemTipi === "odeme" || islemTipi === "tahsilat"
                ? formData.kasaId
                : null,
            personel_id: personel.id,
            restaurant_id: profile?.restaurant_id,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (islemError) throw islemError;

        // Bakiye güncellemeleri
        if (islemTipi === "gider") {
          // GİDER: Personel bakiyesi artar (bize borçlandık)
          await supabase.rpc("update_personel_balance", {
            personel_id: personel.id,
            amount: amount,
          });
        } else if (islemTipi === "odeme") {
          // ÖDEME: Kasadan çıkış, personel bakiyesi azalır
          await supabase.rpc("update_kasa_balance", {
            kasa_id: formData.kasaId,
            amount: -amount,
          });
          await supabase.rpc("update_personel_balance", {
            personel_id: personel.id,
            amount: -amount,
          });
        } else if (islemTipi === "tahsilat") {
          // TAHSİLAT: Kasaya giriş, personel bakiyesi azalır
          await supabase.rpc("update_kasa_balance", {
            kasa_id: formData.kasaId,
            amount: amount,
          });
          await supabase.rpc("update_personel_balance", {
            personel_id: personel.id,
            amount: -amount,
          });
        }

        // Verileri yenile
        fetchPersoneller();
        fetchPersonelIslemler();
        fetchKasalar();
        fetchIslemler();

        Alert.alert("Başarılı", "İşlem kaydedildi");
        return true;
      } catch (error) {
        console.error("İşlem hatası:", error);
        Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
        return false;
      }
    },
    [
      profile?.restaurant_id,
      fetchPersoneller,
      fetchPersonelIslemler,
      fetchKasalar,
      fetchIslemler,
    ]
  );

  // İşlem sil
  const deleteIslem = useCallback(
    async (islem: PersonelIslem): Promise<boolean> => {
      return new Promise((resolve) => {
        Alert.alert(
          "İşlemi Sil",
          `${new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
          }).format(
            islem.amount
          )} tutarındaki işlemi silmek istediğinize emin misiniz?`,
          [
            { text: "İptal", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Sil",
              style: "destructive",
              onPress: async () => {
                try {
                  const giderTypes = [
                    "maas",
                    "mesai",
                    "prim",
                    "avans",
                    "diger",
                    "tazminat",
                    "komisyon",
                    "kesinti",
                  ];
                  const isGider = giderTypes.includes(islem.type);

                  if (isGider) {
                    await supabase.rpc("update_personel_balance", {
                      personel_id: islem.personel_id,
                      amount: -islem.amount,
                    });
                  } else if (islem.type === "odeme") {
                    if (islem.kasa_id) {
                      await supabase.rpc("update_kasa_balance", {
                        kasa_id: islem.kasa_id,
                        amount: islem.amount,
                      });
                    }
                    await supabase.rpc("update_personel_balance", {
                      personel_id: islem.personel_id,
                      amount: islem.amount,
                    });
                  } else if (islem.type === "tahsilat") {
                    if (islem.kasa_id) {
                      await supabase.rpc("update_kasa_balance", {
                        kasa_id: islem.kasa_id,
                        amount: -islem.amount,
                      });
                    }
                    await supabase.rpc("update_personel_balance", {
                      personel_id: islem.personel_id,
                      amount: islem.amount,
                    });
                  }

                  await supabase
                    .from("personel_islemler")
                    .delete()
                    .eq("id", islem.id);

                  fetchPersoneller();
                  fetchPersonelIslemler();
                  fetchKasalar();

                  resolve(true);
                } catch (error) {
                  Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    },
    [fetchPersoneller, fetchPersonelIslemler, fetchKasalar]
  );

  // İzin kaydet
  const submitIzin = useCallback(
    async (personel: Personel, formData: IzinFormData): Promise<boolean> => {
      const days = parseInt(formData.days);
      if (isNaN(days) || days <= 0) {
        Alert.alert("Hata", "Geçerli bir gün sayısı girin");
        return false;
      }

      try {
        const { error } = await supabase.from("izinler").insert({
          personel_id: personel.id,
          restaurant_id: profile?.restaurant_id,
          type: formData.type,
          start_date: formData.startDate,
          end_date: formData.startDate,
          days: formData.tipiEkleDus === "ekle" ? days : -days,
          description: formData.description.trim() || null,
        });

        if (error) throw error;

        Alert.alert(
          "Başarılı",
          formData.tipiEkleDus === "ekle"
            ? "İzin hakkı eklendi"
            : "İzin kullanımı kaydedildi"
        );
        fetchIzinler();
        return true;
      } catch (error) {
        console.error("İzin hatası:", error);
        Alert.alert("Hata", "İzin kaydedilirken bir hata oluştu");
        return false;
      }
    },
    [profile?.restaurant_id, fetchIzinler]
  );

  // İzin sil
  const deleteIzin = useCallback(
    async (izin: Izin): Promise<boolean> => {
      return new Promise((resolve) => {
        Alert.alert(
          "İzni Sil",
          `${Math.abs(
            izin.days
          )} günlük izin kaydını silmek istediğinize emin misiniz?`,
          [
            { text: "İptal", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Sil",
              style: "destructive",
              onPress: async () => {
                try {
                  await supabase.from("izinler").delete().eq("id", izin.id);
                  fetchIzinler();
                  resolve(true);
                } catch (error) {
                  Alert.alert("Hata", "İzin silinirken bir hata oluştu");
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    },
    [fetchIzinler]
  );

  // Personel güncelle (isim)
  const updatePersonelName = useCallback(
    async (personelId: string, newName: string): Promise<boolean> => {
      if (!newName.trim()) {
        Alert.alert("Hata", "İsim boş olamaz");
        return false;
      }

      const { error } = await supabase
        .from("personel")
        .update({ name: newName.trim() })
        .eq("id", personelId);

      if (error) {
        Alert.alert("Hata", "İsim güncellenirken bir hata oluştu");
        return false;
      }

      fetchPersoneller();
      return true;
    },
    [fetchPersoneller]
  );

  // Personel arşivle
  const archivePersonel = useCallback(
    async (personel: Personel): Promise<boolean> => {
      return new Promise((resolve) => {
        Alert.alert(
          "Arşive Al",
          `"${personel.name}" personelini arşive almak istediğinize emin misiniz?\n\nArşivdeki personeller listelerde görünmez ama verileri korunur.`,
          [
            { text: "İptal", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Arşive Al",
              onPress: async () => {
                const { error } = await supabase
                  .from("personel")
                  .update({ is_archived: true })
                  .eq("id", personel.id);

                if (error) {
                  Alert.alert("Hata", "Arşive alınırken bir hata oluştu");
                  resolve(false);
                } else {
                  Alert.alert("Başarılı", "Personel arşive alındı");
                  fetchPersoneller();
                  resolve(true);
                }
              },
            },
          ]
        );
      });
    },
    [fetchPersoneller]
  );

  // Personel sil
  const deletePersonel = useCallback(
    async (personel: Personel): Promise<boolean> => {
      return new Promise((resolve) => {
        Alert.alert(
          "Personeli Sil",
          `"${personel.name}" personelini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve tüm işlem geçmişi silinecektir.`,
          [
            { text: "İptal", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Sil",
              style: "destructive",
              onPress: async () => {
                const { error } = await supabase
                  .from("personel")
                  .delete()
                  .eq("id", personel.id);

                if (error) {
                  Alert.alert("Hata", "Personel silinirken bir hata oluştu");
                  resolve(false);
                } else {
                  Alert.alert("Başarılı", "Personel silindi");
                  fetchPersoneller();
                  resolve(true);
                }
              },
            },
          ]
        );
      });
    },
    [fetchPersoneller]
  );

  // Raporlara dahil etme toggle
  const toggleIncludeInReports = useCallback(
    async (personel: Personel): Promise<boolean> => {
      const { error } = await supabase
        .from("personel")
        .update({ include_in_reports: !personel.include_in_reports })
        .eq("id", personel.id);

      if (error) {
        Alert.alert("Hata", "Ayar güncellenirken bir hata oluştu");
        return false;
      }

      fetchPersoneller();
      return true;
    },
    [fetchPersoneller]
  );

  return {
    submitIslem,
    deleteIslem,
    submitIzin,
    deleteIzin,
    updatePersonelName,
    archivePersonel,
    deletePersonel,
    toggleIncludeInReports,
  };
};
