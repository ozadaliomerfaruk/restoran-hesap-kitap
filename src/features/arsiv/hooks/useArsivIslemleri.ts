// useArsivIslemleri Hook

import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { supabase } from "../../../lib/supabase";
import { useStore } from "../../../store/useStore";
import { ArchivedItem } from "../types";

export const useArsivIslemleri = (onSuccess: () => void) => {
  const { fetchCariler, fetchPersoneller, fetchKasalar } = useStore();
  const [loading, setLoading] = useState(false);

  const handleRestore = useCallback(
    (item: ArchivedItem, table: string) => {
      Alert.alert("Arşivden Çıkar", `"${item.name}" arşivden çıkarılsın mı?`, [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkar",
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from(table)
              .update({ is_archived: false })
              .eq("id", item.id);

            setLoading(false);

            if (error) {
              Alert.alert("Hata", "Arşivden çıkarılırken bir hata oluştu");
            } else {
              onSuccess();
              // Ana listeleri güncelle
              if (table === "cariler") fetchCariler();
              if (table === "personeller") fetchPersoneller();
              if (table === "kasalar") fetchKasalar();
              Alert.alert("Başarılı", `"${item.name}" arşivden çıkarıldı`);
            }
          },
        },
      ]);
    },
    [onSuccess, fetchCariler, fetchPersoneller, fetchKasalar]
  );

  const handlePermanentDelete = useCallback(
    (item: ArchivedItem, table: string) => {
      Alert.alert(
        "Kalıcı Olarak Sil",
        `"${item.name}" kalıcı olarak silinecek.\n\nBu işlem geri alınamaz!`,
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              const { error } = await supabase
                .from(table)
                .delete()
                .eq("id", item.id);

              setLoading(false);

              if (error) {
                Alert.alert("Hata", "Silinirken bir hata oluştu");
              } else {
                onSuccess();
                Alert.alert("Başarılı", `"${item.name}" kalıcı olarak silindi`);
              }
            },
          },
        ]
      );
    },
    [onSuccess]
  );

  return {
    loading,
    handleRestore,
    handlePermanentDelete,
  };
};
