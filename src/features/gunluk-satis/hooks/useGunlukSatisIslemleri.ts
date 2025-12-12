// useGunlukSatisIslemleri Hook - İşlem yönetimi

import { useCallback } from "react";
import { Alert } from "react-native";
import { useStore } from "../../../store/useStore";
import { MenuItem } from "../../../types";

export const useGunlukSatisIslemleri = () => {
  const {
    addSatisKaydi,
    addMenuItem,
    addUrunKategorisi,
    deleteUrunKategorisi,
  } = useStore();

  // Satış kaydet
  const submitSatis = useCallback(
    async (
      urun: MenuItem,
      adet: string,
      fiyat: string,
      tarih: Date
    ): Promise<boolean> => {
      const adetNum = parseInt(adet);
      if (isNaN(adetNum) || adetNum <= 0) {
        Alert.alert("Hata", "Geçerli adet girin");
        return false;
      }

      const fiyatNum = parseFloat(fiyat.replace(",", "."));
      if (isNaN(fiyatNum) || fiyatNum <= 0) {
        Alert.alert("Hata", "Geçerli fiyat girin");
        return false;
      }

      const { error } = await addSatisKaydi({
        menu_item_id: urun.id,
        date: tarih.toISOString().split("T")[0],
        quantity: adetNum,
        unit_price: fiyatNum,
      });

      if (error) {
        Alert.alert("Hata", "Satış kaydedilirken bir hata oluştu");
        return false;
      }

      Alert.alert(
        "Başarılı",
        `${adetNum} ${urun.unit || "adet"} ${urun.name} satışı kaydedildi`
      );
      return true;
    },
    [addSatisKaydi]
  );

  // Ürün ekle
  const submitUrun = useCallback(
    async (
      name: string,
      category: string,
      price: string,
      unit: string
    ): Promise<boolean> => {
      if (!name.trim()) {
        Alert.alert("Hata", "Ürün adı girin");
        return false;
      }
      if (!category) {
        Alert.alert("Hata", "Kategori seçin");
        return false;
      }

      const priceNum = parseFloat(price.replace(",", ".")) || 0;

      const { error } = await addMenuItem({
        name: name.trim(),
        category,
        price: priceNum,
        unit,
        is_active: true,
        include_in_invoice: true,
      });

      if (error) {
        Alert.alert("Hata", "Ürün eklenirken bir hata oluştu");
        return false;
      }

      Alert.alert("Başarılı", "Ürün eklendi");
      return true;
    },
    [addMenuItem]
  );

  // Kategori ekle
  const submitKategori = useCallback(
    async (name: string): Promise<boolean> => {
      if (!name.trim()) {
        Alert.alert("Hata", "Kategori adı girin");
        return false;
      }

      const { error } = await addUrunKategorisi(name.trim());
      if (error) {
        Alert.alert("Hata", "Kategori eklenemedi");
        return false;
      }
      return true;
    },
    [addUrunKategorisi]
  );

  // Kategori sil
  const handleKategoriSil = useCallback(
    (kategoriId: string, kategoriName: string) => {
      Alert.alert(
        "Kategori Sil",
        `"${kategoriName}" kategorisini silmek istediğinize emin misiniz?`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            style: "destructive",
            onPress: () => deleteUrunKategorisi(kategoriId),
          },
        ]
      );
    },
    [deleteUrunKategorisi]
  );

  return { submitSatis, submitUrun, submitKategori, handleKategoriSil };
};
