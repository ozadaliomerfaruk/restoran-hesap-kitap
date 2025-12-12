// Ürün Detay İşlemleri Hook

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useStore } from "../../../store/useStore";
import { supabase } from "../../../lib/supabase";
import { SatisKaydi, MenuItem } from "../../../types";

export function useUrunDetayIslemleri(
  urunId: string,
  urun: MenuItem | undefined
) {
  const { updateMenuItem, fetchSatisKayitlari } = useStore();
  const [loading, setLoading] = useState(false);

  // Ad değiştirme (uyarı ile)
  const handleNameChange = useCallback(
    async (newName: string) => {
      if (!newName.trim()) {
        Alert.alert("Hata", "Ürün adı boş olamaz");
        return false;
      }

      if (newName.trim() === urun?.name) {
        return false; // Değişiklik yok
      }

      return new Promise<boolean>((resolve) => {
        Alert.alert(
          "Ürün Adı Değişikliği",
          `"${
            urun?.name
          }" adını "${newName.trim()}" olarak değiştirmek istediğinize emin misiniz?\n\nBu değişiklik tüm geçmiş kayıtlarda da görünecektir.`,
          [
            {
              text: "İptal",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Değiştir",
              onPress: async () => {
                setLoading(true);
                const { error } = await updateMenuItem(urunId, {
                  name: newName.trim(),
                });
                setLoading(false);
                if (error) {
                  Alert.alert("Hata", "Ürün adı güncellenemedi");
                  resolve(false);
                } else {
                  Alert.alert("Başarılı", "Ürün adı güncellendi");
                  resolve(true);
                }
              },
            },
          ]
        );
      });
    },
    [urun, urunId, updateMenuItem]
  );

  // Fiyat değiştirme
  const handlePriceChange = useCallback(
    async (priceStr: string) => {
      const price = parseFloat(priceStr.replace(",", "."));
      if (isNaN(price) || price < 0) {
        Alert.alert("Hata", "Geçerli bir fiyat girin");
        return false;
      }

      if (price === urun?.price) return false;

      setLoading(true);
      const { error } = await updateMenuItem(urunId, { price });
      setLoading(false);

      if (error) {
        Alert.alert("Hata", "Fiyat güncellenemedi");
        return false;
      } else {
        Alert.alert(
          "Başarılı",
          "Fiyat güncellendi. Eski satışlar etkilenmedi."
        );
        return true;
      }
    },
    [urun, urunId, updateMenuItem]
  );

  // Birim değiştirme
  const handleUnitChange = useCallback(
    async (newUnit: string) => {
      if (newUnit === urun?.unit) return true;

      setLoading(true);
      const { error } = await updateMenuItem(urunId, { unit: newUnit });
      setLoading(false);

      if (error) {
        Alert.alert("Hata", "Birim güncellenemedi");
        return false;
      }
      return true;
    },
    [urun, urunId, updateMenuItem]
  );

  // Faturada gösterme toggle
  const handleToggleInvoice = useCallback(async () => {
    const newValue = !urun?.include_in_invoice;
    setLoading(true);
    const { error } = await updateMenuItem(urunId, {
      include_in_invoice: newValue,
    });
    setLoading(false);

    if (error) {
      Alert.alert(
        "Hata",
        "Ayar güncellenemedi: " + (error.message || JSON.stringify(error))
      );
      return false;
    }
    return true;
  }, [urun, urunId, updateMenuItem]);

  // Satış düzenlemeyi kaydet
  const saveSatis = useCallback(
    async (satisId: string, adetStr: string, fiyatStr: string, date: Date) => {
      const adet = parseFloat(adetStr.replace(",", "."));
      const fiyat = parseFloat(fiyatStr.replace(",", "."));

      if (isNaN(adet) || adet <= 0) {
        Alert.alert("Hata", "Geçerli bir adet girin");
        return false;
      }

      if (isNaN(fiyat) || fiyat < 0) {
        Alert.alert("Hata", "Geçerli bir fiyat girin");
        return false;
      }

      setLoading(true);
      const { error } = await supabase
        .from("satis_kayitlari")
        .update({
          quantity: adet,
          unit_price: fiyat,
          date: date.toISOString().split("T")[0],
        })
        .eq("id", satisId);

      setLoading(false);

      if (error) {
        Alert.alert("Hata", "Satış güncellenemedi");
        return false;
      }

      fetchSatisKayitlari();
      Alert.alert("Başarılı", "Satış güncellendi");
      return true;
    },
    [fetchSatisKayitlari]
  );

  // Satış tarihi güncelleme
  const saveSatisDate = useCallback(
    async (satisId: string, date: Date) => {
      setLoading(true);
      const { error } = await supabase
        .from("satis_kayitlari")
        .update({ date: date.toISOString().split("T")[0] })
        .eq("id", satisId);

      setLoading(false);

      if (error) {
        Alert.alert("Hata", "Tarih güncellenemedi");
        return false;
      }

      fetchSatisKayitlari();
      return true;
    },
    [fetchSatisKayitlari]
  );

  // Satış sil
  const deleteSatis = useCallback(
    (satis: SatisKaydi) => {
      Alert.alert(
        "Satış Kaydını Sil",
        `${satis.quantity} adet satışı silmek istediğinize emin misiniz?`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              const { error } = await supabase
                .from("satis_kayitlari")
                .delete()
                .eq("id", satis.id);
              if (!error) {
                fetchSatisKayitlari();
              }
            },
          },
        ]
      );
    },
    [fetchSatisKayitlari]
  );

  return {
    loading,
    handleNameChange,
    handlePriceChange,
    handleUnitChange,
    handleToggleInvoice,
    saveSatis,
    saveSatisDate,
    deleteSatis,
  };
}
