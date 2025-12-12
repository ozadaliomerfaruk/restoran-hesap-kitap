/**
 * Kasa Detay Hook
 */

import { useEffect, useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

export function useKasaDetay(kasaId: string | undefined) {
  const router = useRouter();
  const {
    kasalar,
    fetchKasalar,
    fetchProfile,
    profile,
    kategoriler,
    fetchKategoriler,
    cariler,
    fetchCariler,
    personeller,
    fetchPersoneller,
  } = useStore();

  const [loading, setLoading] = useState(false);

  const kasa = kasalar.find((k) => k.id === kasaId);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id && kasaId) {
      fetchKategoriler();
      fetchCariler();
      fetchPersoneller();
    }
  }, [profile?.restaurant_id, kasaId]);

  const loadData = async () => {
    await fetchProfile();
    await fetchKasalar();
    await fetchCariler();
    await fetchPersoneller();
  };

  const refreshAll = useCallback(async () => {
    await loadData();
  }, []);

  const updateKasaName = useCallback(
    async (newName: string) => {
      if (!newName.trim()) {
        Alert.alert("Hata", "Hesap adı boş olamaz");
        return false;
      }
      setLoading(true);
      try {
        await supabase
          .from("kasalar")
          .update({ name: newName.trim() })
          .eq("id", kasaId);
        await fetchKasalar();
        Alert.alert("Başarılı", "Hesap adı güncellendi");
        return true;
      } catch (error) {
        Alert.alert("Hata", "Güncelleme başarısız");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [kasaId, fetchKasalar]
  );

  const archiveKasa = useCallback(() => {
    Alert.alert(
      "Arşive Al",
      `"${kasa?.name}" hesabını arşive almak istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşive Al",
          onPress: async () => {
            setLoading(true);
            try {
              await supabase
                .from("kasalar")
                .update({ is_archived: true })
                .eq("id", kasaId);
              await fetchKasalar();
              router.back();
            } catch (error) {
              Alert.alert("Hata", "İşlem başarısız");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [kasaId, kasa?.name, fetchKasalar, router]);

  const deleteKasa = useCallback(() => {
    Alert.alert(
      "Hesabı Sil",
      `"${kasa?.name}" hesabını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve hesaba ait tüm işlemler silinecektir.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await supabase.from("islemler").delete().eq("kasa_id", kasaId);
              await supabase
                .from("personel_islemler")
                .delete()
                .eq("kasa_id", kasaId);
              await supabase.from("kasalar").delete().eq("id", kasaId);
              await fetchKasalar();
              router.back();
            } catch (error) {
              Alert.alert("Hata", "Silme işlemi başarısız");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [kasaId, kasa?.name, fetchKasalar, router]);

  const toggleExcludeFromProfit = useCallback(async () => {
    if (!kasa) return;
    setLoading(true);
    try {
      await supabase
        .from("kasalar")
        .update({ exclude_from_profit: !kasa.exclude_from_profit })
        .eq("id", kasaId);
      await fetchKasalar();
    } catch (error) {
      Alert.alert("Hata", "Güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  }, [kasaId, kasa, fetchKasalar]);

  return {
    kasa,
    kasalar,
    kategoriler,
    cariler,
    personeller,
    profile,
    loading,
    refreshAll,
    updateKasaName,
    archiveKasa,
    deleteKasa,
    toggleExcludeFromProfit,
    fetchKasalar,
  };
}
