/**
 * Dashboard Data Hook
 */

import { useEffect, useCallback } from "react";
import { useStore } from "@/store/useStore";

export function useDashboardData() {
  const {
    profile,
    fetchProfile,
    kasalar,
    fetchKasalar,
    islemler,
    fetchIslemler,
    cariler,
    fetchCariler,
    personeller,
    fetchPersoneller,
    personelIslemler,
    fetchPersonelIslemler,
    kategoriler,
    fetchKategoriler,
  } = useStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
      fetchIslemler();
      fetchCariler();
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const refreshAll = useCallback(async () => {
    await fetchProfile();
    if (profile?.restaurant_id) {
      await Promise.all([
        fetchKasalar(),
        fetchIslemler(),
        fetchCariler(),
        fetchPersoneller(),
        fetchPersonelIslemler(),
      ]);
    }
  }, [profile?.restaurant_id]);

  return {
    profile,
    kasalar: kasalar.filter((k) => !k.is_archived),
    islemler,
    cariler,
    personeller,
    kategoriler,
    refreshAll,
    fetchKasalar,
    fetchIslemler,
    fetchCariler,
    fetchPersoneller,
    fetchPersonelIslemler,
  };
}
