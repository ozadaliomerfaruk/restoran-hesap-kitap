/**
 * useKalemliFatura Hook
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useStore } from "../../../../../store/useStore";
import { supabase } from "../../../../../lib/supabase";
import { Cari, Urun } from "../../../../../types";
import { Kalem, FaturaTipi } from "../types";
import { generateId, parseAmount } from "../constants";

export function useKalemliFatura(cari: Cari | null, visible: boolean) {
  const {
    profile,
    urunler,
    fetchUrunler,
    addUrun,
    kategoriler,
    fetchKategoriler,
    fetchCariler,
    fetchIslemler,
  } = useStore();

  // Form state
  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDescription, setFormDescription] = useState("");
  const [faturaTipi, setFaturaTipi] = useState<FaturaTipi>("alis");
  const [loading, setLoading] = useState(false);

  // Ürün modal state
  const [showUrunModal, setShowUrunModal] = useState(false);
  const [activeKalemId, setActiveKalemId] = useState<string | null>(null);
  const [urunSearchText, setUrunSearchText] = useState("");

  // Dropdown state
  const [activeKdvKalemId, setActiveKdvKalemId] = useState<string | null>(null);
  const [activeBirimKalemId, setActiveBirimKalemId] = useState<string | null>(
    null
  );

  // Init
  useEffect(() => {
    if (visible) {
      fetchUrunler();
      fetchKategoriler();
      if (kalemler.length === 0) {
        addKalem();
      }
    }
  }, [visible]);

  // Kalem işlemleri
  const addKalem = () => {
    const newKalem: Kalem = {
      id: generateId(),
      urun_id: null,
      urun_adi: "",
      quantity: "1",
      unit: "adet",
      unit_price: "",
      kdv_rate: "10",
      kategori_id: null,
    };
    setKalemler([...kalemler, newKalem]);
  };

  const removeKalem = (id: string) => {
    if (kalemler.length === 1) {
      Alert.alert("Uyarı", "En az bir kalem olmalı");
      return;
    }
    setKalemler(kalemler.filter((k) => k.id !== id));
  };

  const updateKalem = (
    id: string,
    field: keyof Kalem,
    value: string | null
  ) => {
    setKalemler(
      kalemler.map((k) => (k.id === id ? { ...k, [field]: value } : k))
    );
  };

  const selectUrun = (urun: Urun) => {
    if (activeKalemId) {
      setKalemler(
        kalemler.map((k) => {
          if (k.id === activeKalemId) {
            return {
              ...k,
              urun_id: urun.id,
              urun_adi: urun.name,
              unit: urun.unit,
              unit_price: urun.default_price?.toString() || "",
              kdv_rate: urun.kdv_rate?.toString() || "10",
              kategori_id: urun.kategori_id || null,
            };
          }
          return k;
        })
      );
    }
    setShowUrunModal(false);
    setActiveKalemId(null);
    setUrunSearchText("");
  };

  const openUrunModal = (kalemId: string) => {
    setActiveKalemId(kalemId);
    setShowUrunModal(true);
    setUrunSearchText("");
  };

  // Hesaplamalar
  const calculateKalemTotal = (kalem: Kalem): number => {
    const qty = parseAmount(kalem.quantity) || 0;
    const price = parseAmount(kalem.unit_price) || 0;
    const kdv = parseAmount(kalem.kdv_rate) || 0;
    const subtotal = qty * price;
    return subtotal + subtotal * (kdv / 100);
  };

  const calculateKalemKdv = (kalem: Kalem): number => {
    const qty = parseAmount(kalem.quantity) || 0;
    const price = parseAmount(kalem.unit_price) || 0;
    const kdv = parseAmount(kalem.kdv_rate) || 0;
    const subtotal = qty * price;
    return subtotal * (kdv / 100);
  };

  const araToplam = kalemler.reduce(
    (sum, k) => sum + calculateKalemTotal(k) - calculateKalemKdv(k),
    0
  );
  const toplamKdv = kalemler.reduce((sum, k) => sum + calculateKalemKdv(k), 0);
  const genelToplam = kalemler.reduce(
    (sum, k) => sum + calculateKalemTotal(k),
    0
  );

  // Kaydet
  const handleSave = async () => {
    const invalidKalem = kalemler.find(
      (k) => !k.urun_adi.trim() || !k.unit_price
    );
    if (invalidKalem) {
      Alert.alert("Hata", "Tüm kalemler için ürün adı ve fiyat girin");
      return;
    }

    if (genelToplam <= 0) {
      Alert.alert("Hata", "Toplam tutar sıfırdan büyük olmalı");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const islemType = faturaTipi === "alis" ? "gider" : "gelir";
      const defaultDesc =
        faturaTipi === "alis"
          ? `${cari?.name} - Kalemli Alış`
          : `${cari?.name} - Kalemli İade`;

      const { data: islem, error: islemError } = await supabase
        .from("islemler")
        .insert({
          type: islemType,
          amount: genelToplam,
          description: formDescription.trim() || defaultDesc,
          date: formDate,
          cari_id: cari?.id,
          restaurant_id: profile?.restaurant_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (islemError) throw islemError;

      const kalemlerData = kalemler.map((k) => ({
        islem_id: islem.id,
        urun_id: k.urun_id,
        urun_adi: k.urun_adi,
        quantity: parseAmount(k.quantity) || 1,
        unit: k.unit,
        unit_price: parseAmount(k.unit_price) || 0,
        total_price: calculateKalemTotal(k),
        kdv_rate: parseAmount(k.kdv_rate) || 0,
        kategori_id: k.kategori_id,
      }));

      const { error: kalemlerError } = await supabase
        .from("islem_kalemleri")
        .insert(kalemlerData);

      if (kalemlerError) throw kalemlerError;

      // Cari bakiyesi güncelle
      if (cari) {
        const cariMultiplier = faturaTipi === "alis" ? 1 : -1;
        await supabase.rpc("update_cari_balance", {
          cari_id: cari.id,
          amount: genelToplam * cariMultiplier,
        });
      }

      const successMsg =
        faturaTipi === "alis"
          ? "Kalemli alış kaydedildi"
          : "Kalemli iade kaydedildi";
      Alert.alert("Başarılı", successMsg);

      // Reset
      setKalemler([]);
      setFormDescription("");
      setFormDate(new Date().toISOString().split("T")[0]);
      setFaturaTipi("alis");

      fetchCariler();
      fetchIslemler();

      return true;
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const resetForm = () => {
    setKalemler([]);
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFaturaTipi("alis");
  };

  return {
    // State
    kalemler,
    formDate,
    setFormDate,
    formDescription,
    setFormDescription,
    faturaTipi,
    setFaturaTipi,
    loading,

    // Ürün modal
    showUrunModal,
    setShowUrunModal,
    activeKalemId,
    urunSearchText,
    setUrunSearchText,

    // Dropdown
    activeKdvKalemId,
    setActiveKdvKalemId,
    activeBirimKalemId,
    setActiveBirimKalemId,

    // Data
    urunler,
    kategoriler,

    // Hesaplamalar
    araToplam,
    toplamKdv,
    genelToplam,
    calculateKalemTotal,

    // Actions
    addKalem,
    removeKalem,
    updateKalem,
    selectUrun,
    openUrunModal,
    handleSave,
    resetForm,
    addUrun,
    fetchUrunler,
  };
}
