/**
 * useCariDetay Hook
 * CariDetayModal için tüm state ve CRUD işlemleri
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useStore } from "../../../../../store/useStore";
import { supabase } from "../../../../../lib/supabase";
import { Cari, Islem } from "../../../../../types";
import { IslemKalemi } from "../types";

export function useCariDetay(cari: Cari | null, visible: boolean) {
  const {
    islemler,
    fetchIslemler,
    fetchCariler,
    fetchKasalar,
    cariler,
    deleteCari,
    updateCari,
  } = useStore();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingKalemler, setLoadingKalemler] = useState(false);
  const [savingIslem, setSavingIslem] = useState(false);

  // Modal states
  const [showMenu, setShowMenu] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showIslemDetay, setShowIslemDetay] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Data states
  const [editName, setEditName] = useState("");
  const [selectedIslem, setSelectedIslem] = useState<Islem | null>(null);
  const [islemKalemleri, setIslemKalemleri] = useState<IslemKalemi[]>([]);

  // Edit states
  const [editIslemAmount, setEditIslemAmount] = useState("");
  const [editIslemDate, setEditIslemDate] = useState("");
  const [editIslemDescription, setEditIslemDescription] = useState("");
  const [editKalemler, setEditKalemler] = useState<IslemKalemi[]>([]);

  // Güncel cari bilgisini store'dan al
  const currentCari = cariler.find((c) => c.id === cari?.id) || cari;

  // Bu cariye ait işlemler - en eski üstte, en yeni altta
  const cariIslemleri = islemler
    .filter((i) => i.cari_id === currentCari?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Reset all states
  const resetStates = useCallback(() => {
    setShowMenu(false);
    setShowEditNameModal(false);
    setShowIslemDetay(false);
    setIsEditMode(false);
    setSelectedIslem(null);
    setIslemKalemleri([]);
    setEditKalemler([]);
  }, []);

  // Fetch data when visible
  useEffect(() => {
    if (visible && cari) {
      fetchIslemler();
      fetchCariler();
      setEditName(cari.name);
    }
  }, [visible, cari]);

  // Reset when closed
  useEffect(() => {
    if (!visible) {
      resetStates();
    }
  }, [visible, resetStates]);

  // İşlem detayını aç
  const openIslemDetay = async (islem: Islem) => {
    setSelectedIslem(islem);
    setShowIslemDetay(true);
    setIsEditMode(false);
    setIslemKalemleri([]);

    setLoadingKalemler(true);
    try {
      const { data, error } = await supabase
        .from("islem_kalemleri")
        .select("*")
        .eq("islem_id", islem.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setIslemKalemleri(data);
      }
    } catch (error) {
      console.error("Kalemler yüklenirken hata:", error);
    } finally {
      setLoadingKalemler(false);
    }
  };

  // İşlem detayını kapat
  const closeIslemDetay = () => {
    setIsEditMode(false);
    setShowIslemDetay(false);
    setSelectedIslem(null);
    setIslemKalemleri([]);
    setEditKalemler([]);
  };

  // Edit moduna geç
  const startEditMode = () => {
    if (!selectedIslem) return;
    setEditIslemAmount(String(selectedIslem.amount));
    setEditIslemDate(selectedIslem.date);
    setEditIslemDescription(selectedIslem.description || "");
    setEditKalemler([...islemKalemleri]);
    setIsEditMode(true);
  };

  // İşlem kaydet
  const handleSaveIslem = async () => {
    if (!selectedIslem || !currentCari) return;

    const isKalemliFatura = editKalemler.length > 0;

    let newAmount: number;
    if (isKalemliFatura) {
      newAmount = editKalemler.reduce((sum, k) => sum + k.total_price, 0);
    } else {
      newAmount = parseFloat(editIslemAmount);
      if (isNaN(newAmount) || newAmount <= 0) {
        Alert.alert("Hata", "Geçerli bir tutar girin");
        return;
      }
    }

    setSavingIslem(true);

    try {
      const oldAmount = selectedIslem.amount;
      const amountDiff = newAmount - oldAmount;

      // İşlemi güncelle
      const { error: updateError } = await supabase
        .from("islemler")
        .update({
          amount: newAmount,
          date: editIslemDate,
          description: editIslemDescription.trim() || null,
        })
        .eq("id", selectedIslem.id);

      if (updateError) throw updateError;

      // Kalemli faturaysa kalemleri de güncelle
      if (isKalemliFatura) {
        for (const kalem of editKalemler) {
          await supabase
            .from("islem_kalemleri")
            .update({
              quantity: kalem.quantity,
              unit_price: kalem.unit_price,
              total_price: kalem.total_price,
            })
            .eq("id", kalem.id);
        }
      }

      // Bakiye farkını güncelle
      if (amountDiff !== 0) {
        if (
          selectedIslem.type === "gider" ||
          selectedIslem.type === "tahsilat"
        ) {
          await supabase.rpc("update_cari_balance", {
            cari_id: currentCari.id,
            amount: amountDiff,
          });
        } else if (
          selectedIslem.type === "gelir" ||
          selectedIslem.type === "odeme"
        ) {
          await supabase.rpc("update_cari_balance", {
            cari_id: currentCari.id,
            amount: -amountDiff,
          });
        }

        // Kasa bakiyesi güncelle
        if (selectedIslem.kasa_id) {
          if (
            selectedIslem.type === "odeme" ||
            selectedIslem.type === "gider"
          ) {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: selectedIslem.kasa_id,
              amount: -amountDiff,
            });
          } else {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: selectedIslem.kasa_id,
              amount: amountDiff,
            });
          }
        }
      }

      Alert.alert("Başarılı", "İşlem güncellendi");
      await fetchIslemler();
      await fetchCariler();
      await fetchKasalar();
      closeIslemDetay();
    } catch (error) {
      console.error("İşlem güncellenirken hata:", error);
      Alert.alert("Hata", "İşlem güncellenirken bir hata oluştu");
    } finally {
      setSavingIslem(false);
    }
  };

  // İşlem sil
  const handleDeleteIslem = async () => {
    if (!selectedIslem || !currentCari) return;

    Alert.alert(
      "İşlemi Sil",
      "Bu işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Önce kalemleri sil
              if (islemKalemleri.length > 0) {
                await supabase
                  .from("islem_kalemleri")
                  .delete()
                  .eq("islem_id", selectedIslem.id);
              }

              // İşlemi sil
              const { error } = await supabase
                .from("islemler")
                .delete()
                .eq("id", selectedIslem.id);

              if (error) throw error;

              // Bakiyeleri güncelle
              const amount = selectedIslem.amount;

              if (
                selectedIslem.type === "gider" ||
                selectedIslem.type === "tahsilat"
              ) {
                await supabase.rpc("update_cari_balance", {
                  cari_id: currentCari.id,
                  amount: -amount,
                });
              } else {
                await supabase.rpc("update_cari_balance", {
                  cari_id: currentCari.id,
                  amount: amount,
                });
              }

              if (selectedIslem.kasa_id) {
                if (
                  selectedIslem.type === "odeme" ||
                  selectedIslem.type === "gider"
                ) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: selectedIslem.kasa_id,
                    amount: amount,
                  });
                } else {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: selectedIslem.kasa_id,
                    amount: -amount,
                  });
                }
              }

              Alert.alert("Başarılı", "İşlem silindi");
              await fetchIslemler();
              await fetchCariler();
              await fetchKasalar();
              closeIslemDetay();
            } catch (error) {
              console.error("İşlem silinirken hata:", error);
              Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Cari isim güncelle
  const handleUpdateName = async () => {
    if (!editName.trim()) {
      Alert.alert("Hata", "İsim boş olamaz");
      return;
    }
    if (!currentCari) return;

    setLoading(true);
    const { error } = await updateCari(currentCari.id, {
      name: editName.trim(),
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "İsim güncellenirken bir hata oluştu");
    } else {
      setShowEditNameModal(false);
      fetchCariler();
    }
  };

  // Arşive al
  const handleArchive = () => {
    setShowMenu(false);
    Alert.alert(
      "Arşive Al",
      `"${currentCari?.name}" carisini arşive almak istediğinize emin misiniz?\n\nArşivdeki cariler listelerde görünmez ama verileri korunur.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşive Al",
          onPress: async () => {
            if (!currentCari) return;
            setLoading(true);
            const { error } = await updateCari(currentCari.id, {
              is_archived: true,
            });
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Arşive alınırken bir hata oluştu");
              return false;
            } else {
              Alert.alert("Başarılı", "Cari arşive alındı");
              return true;
            }
          },
        },
      ]
    );
  };

  // Raporlara dahil et/etme toggle
  const handleToggleIncludeInReports = async () => {
    if (!currentCari) return;
    setShowMenu(false);
    setLoading(true);
    const { error } = await updateCari(currentCari.id, {
      include_in_reports: !currentCari.include_in_reports,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Hata", "Ayar güncellenirken bir hata oluştu");
    } else {
      fetchCariler();
    }
  };

  // Cari sil
  const handleDelete = () => {
    setShowMenu(false);
    if (cariIslemleri.length > 0) {
      Alert.alert(
        "Silinemez",
        "Bu cariye ait işlemler var. Önce işlemleri silmeniz veya cariyi arşive almanız gerekiyor."
      );
      return;
    }

    Alert.alert(
      "Cariyi Sil",
      `"${currentCari?.name}" carisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!currentCari) return;
            setLoading(true);
            const { error } = await deleteCari(currentCari.id);
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Cari silinirken bir hata oluştu");
              return false;
            } else {
              Alert.alert("Başarılı", "Cari silindi");
              return true;
            }
          },
        },
      ]
    );
  };

  // Kalem güncelle
  const updateKalem = (index: number, field: string, value: string) => {
    const updated = [...editKalemler];
    const kalem = updated[index];

    if (field === "quantity") {
      kalem.quantity = parseFloat(value) || 0;
    } else if (field === "unit_price") {
      kalem.unit_price = parseFloat(value) || 0;
    }

    // Toplam hesapla
    const subtotal = kalem.quantity * kalem.unit_price;
    const kdv = subtotal * (kalem.kdv_rate / 100);
    kalem.total_price = subtotal + kdv;

    setEditKalemler(updated);
  };

  return {
    // Data
    currentCari,
    cariIslemleri,
    selectedIslem,
    islemKalemleri,
    editKalemler,

    // Loading states
    loading,
    loadingKalemler,
    savingIslem,

    // Modal states
    showMenu,
    setShowMenu,
    showEditNameModal,
    setShowEditNameModal,
    showIslemDetay,
    isEditMode,

    // Edit states
    editName,
    setEditName,
    editIslemAmount,
    setEditIslemAmount,
    editIslemDate,
    setEditIslemDate,
    editIslemDescription,
    setEditIslemDescription,

    // Actions
    resetStates,
    openIslemDetay,
    closeIslemDetay,
    startEditMode,
    handleSaveIslem,
    handleDeleteIslem,
    handleUpdateName,
    handleArchive,
    handleToggleIncludeInReports,
    handleDelete,
    updateKalem,
  };
}
