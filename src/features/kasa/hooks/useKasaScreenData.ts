// useKasaScreenData Hook

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { KasaGroupData } from "../types";

export const useKasaScreenData = () => {
  const { profile, fetchProfile, kasalar, fetchKasalar } = useStore();

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch when restaurant_id is available
  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
    }
  }, [profile?.restaurant_id]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchKasalar();
  }, [fetchKasalar]);

  // Grup bazında kasaları ve toplamları hesapla
  const getGroupData = useCallback(
    (type: string): KasaGroupData => {
      const groupKasalar = kasalar.filter((k) => k.type === type);
      const total = groupKasalar.reduce((sum, k) => sum + k.balance, 0);
      return { kasalar: groupKasalar, total };
    },
    [kasalar]
  );

  // Genel toplam
  const genelToplam = useMemo(() => {
    return kasalar.reduce((sum, k) => sum + k.balance, 0);
  }, [kasalar]);

  return {
    profile,
    kasalar,
    genelToplam,
    getGroupData,
    refresh,
  };
};
