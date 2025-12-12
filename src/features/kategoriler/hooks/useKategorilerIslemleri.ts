// Kategoriler İşlemleri Hook

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../lib/supabase";
import { Kategori } from "../../../types";
import { KategoriFormState, KategoriTab } from "../types";

export function useKategorilerIslemleri(
  profileRestaurantId: string | undefined,
  kategoriler: Kategori[],
  fetchKategoriler: () => Promise<void>,
  activeTab: KategoriTab
) {
  const [showModal, setShowModal] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formState, setFormState] = useState<KategoriFormState>({
    name: "",
    type: "gider",
    parentId: null,
  });

  const openAddModal = useCallback(
    (parentId: string | null = null) => {
      setEditingKategori(null);
      setFormState({
        name: "",
        type: activeTab,
        parentId,
      });
      setShowModal(true);
    },
    [activeTab]
  );

  const openEditModal = useCallback((kategori: Kategori) => {
    setEditingKategori(kategori);
    setFormState({
      name: kategori.name,
      type: kategori.type as KategoriTab,
      parentId: kategori.parent_id || null,
    });
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingKategori(null);
  }, []);

  const updateFormName = useCallback((name: string) => {
    setFormState((prev) => ({ ...prev, name }));
  }, []);

  const updateFormType = useCallback((type: KategoriTab) => {
    setFormState((prev) => ({ ...prev, type, parentId: null }));
  }, []);

  const updateFormParent = useCallback((parentId: string | null) => {
    setFormState((prev) => ({ ...prev, parentId }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!formState.name.trim()) {
      Alert.alert("Hata", "Kategori adı girin");
      return;
    }

    setFormLoading(true);

    try {
      if (editingKategori) {
        // Güncelle
        const { error } = await supabase
          .from("kategoriler")
          .update({
            name: formState.name.trim(),
            type: formState.type,
            parent_id: formState.parentId,
          })
          .eq("id", editingKategori.id);

        if (error) throw error;
        Alert.alert("Başarılı", "Kategori güncellendi");
      } else {
        // Yeni ekle
        const { error } = await supabase.from("kategoriler").insert({
          name: formState.name.trim(),
          type: formState.type,
          parent_id: formState.parentId,
          restaurant_id: profileRestaurantId,
          is_default: false,
        });

        if (error) throw error;
        Alert.alert("Başarılı", "Kategori eklendi");
      }

      closeModal();
      fetchKategoriler();
    } catch (error) {
      console.error("Kategori kaydetme hatası:", error);
      Alert.alert("Hata", "Kategori kaydedilirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  }, [
    formState,
    editingKategori,
    profileRestaurantId,
    closeModal,
    fetchKategoriler,
  ]);

  const handleDelete = useCallback(
    (kategori: Kategori) => {
      if (kategori.is_default) {
        Alert.alert("Hata", "Varsayılan kategoriler silinemez");
        return;
      }

      // Alt kategorisi var mı kontrol et
      const hasChildren = kategoriler.some((k) => k.parent_id === kategori.id);
      if (hasChildren) {
        Alert.alert(
          "Hata",
          "Bu kategorinin alt kategorileri var. Önce onları silin."
        );
        return;
      }

      Alert.alert(
        "Kategori Sil",
        `"${kategori.name}" kategorisini silmek istediğinize emin misiniz?`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              try {
                const { error } = await supabase
                  .from("kategoriler")
                  .delete()
                  .eq("id", kategori.id);

                if (error) throw error;
                fetchKategoriler();
              } catch (error) {
                Alert.alert("Hata", "Kategori silinirken bir hata oluştu");
              }
            },
          },
        ]
      );
    },
    [kategoriler, fetchKategoriler]
  );

  return {
    showModal,
    editingKategori,
    formState,
    formLoading,
    openAddModal,
    openEditModal,
    closeModal,
    updateFormName,
    updateFormType,
    updateFormParent,
    handleSave,
    handleDelete,
  };
}
