// useCariIslemleri Hook - İşlem yönetimi

import { useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../lib/supabase";
import { useStore } from "../../../store/useStore";
import { Cari } from "../../../types";
import { CariIslemTipi } from "../types";

interface IslemFormData {
  date: string;
  amount: string;
  description: string;
  kasaId: string;
  kategoriId: string;
}

// Virgülü noktaya çeviren yardımcı fonksiyon
const parseAmount = (value: string): number => {
  const normalized = value.replace(",", ".");
  return parseFloat(normalized) || 0;
};

export const useCariIslemleri = () => {
  const { profile, addIslem, fetchCariler, fetchKasalar, fetchKategoriler } =
    useStore();

  // İşlem kaydet
  const submitIslem = useCallback(
    async (
      cari: Cari,
      islemTipi: CariIslemTipi,
      formData: IslemFormData
    ): Promise<boolean> => {
      const amount = parseAmount(formData.amount);
      if (!formData.amount || amount <= 0) {
        Alert.alert("Hata", "Geçerli bir tutar girin");
        return false;
      }

      // Kasa sadece ödeme ve tahsilat için gerekli
      if (
        !formData.kasaId &&
        (islemTipi === "odeme" || islemTipi === "tahsilat")
      ) {
        Alert.alert("Hata", "Lütfen bir kasa seçin");
        return false;
      }

      // İşlem tipini belirle
      let islemType: string;
      let description = formData.description.trim();

      switch (islemTipi) {
        case "alis":
          islemType = "gider";
          if (!description) description = `${cari.name} - Alış`;
          break;
        case "iade":
          islemType = "iade";
          if (!description) description = `${cari.name} - Tedarikçi İadesi`;
          break;
        case "satis":
          islemType = "satis";
          if (!description) description = `${cari.name} - Satış`;
          break;
        case "musteri_iade":
          islemType = "musteri_iade";
          if (!description) description = `${cari.name} - Müşteri İadesi`;
          break;
        case "odeme":
          islemType = "odeme";
          if (!description) description = `${cari.name} - Ödeme`;
          break;
        case "tahsilat":
          islemType = "tahsilat";
          if (!description) description = `${cari.name} - Tahsilat`;
          break;
        default:
          return false;
      }

      const kasaId =
        islemTipi === "odeme" || islemTipi === "tahsilat"
          ? formData.kasaId
          : undefined;
      const kategoriId =
        islemTipi === "alis" && formData.kategoriId
          ? formData.kategoriId
          : undefined;

      const { error } = await addIslem({
        type: islemType as any,
        amount: amount,
        description,
        date: formData.date,
        kasa_id: kasaId,
        cari_id: cari.id,
        kategori_id: kategoriId,
      });

      if (error) {
        Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
        return false;
      }

      Alert.alert("Başarılı", "İşlem kaydedildi");
      fetchCariler();
      fetchKasalar();
      return true;
    },
    [addIslem, fetchCariler, fetchKasalar]
  );

  // Yeni kategori ekle
  const addKategori = useCallback(
    async (name: string, parentId: string | null): Promise<string | null> => {
      if (!name.trim()) {
        Alert.alert("Hata", "Kategori adı boş olamaz");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("kategoriler")
          .insert({
            restaurant_id: profile?.restaurant_id,
            name: name.trim(),
            type: "gider",
            parent_id: parentId || null,
            is_default: false,
          })
          .select()
          .single();

        if (error) throw error;

        await fetchKategoriler();
        Alert.alert("Başarılı", "Kategori eklendi");
        return data.id;
      } catch (error: any) {
        console.error("Kategori ekleme hatası:", error);
        Alert.alert("Hata", error.message || "Kategori eklenemedi");
        return null;
      }
    },
    [profile?.restaurant_id, fetchKategoriler]
  );

  return {
    submitIslem,
    addKategori,
  };
};
