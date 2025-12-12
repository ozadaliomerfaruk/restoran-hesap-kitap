// useIslemlerData Hook

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { IslemFilterType } from "../types";

export const useIslemlerData = (filter: IslemFilterType = "all") => {
  const {
    profile,
    fetchProfile,
    islemler,
    fetchIslemler,
    loadingIslemler,
    fetchKasalar,
    fetchCariler,
    fetchKategoriler,
  } = useStore();

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch when restaurant_id is available
  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchIslemler();
      fetchKasalar();
      fetchCariler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchIslemler();
  }, [fetchIslemler]);

  // Filtered işlemler
  const filteredIslemler = useMemo(() => {
    return islemler.filter((islem) => {
      if (filter === "all") return true;
      if (filter === "gelir")
        return islem.type === "gelir" || islem.type === "tahsilat";
      if (filter === "gider")
        return islem.type === "gider" || islem.type === "odeme";
      return true;
    });
  }, [islemler, filter]);

  // Toplam gelir
  const totalGelir = useMemo(() => {
    return islemler
      .filter((i) => i.type === "gelir" || i.type === "tahsilat")
      .reduce((sum, i) => sum + i.amount, 0);
  }, [islemler]);

  // Toplam gider
  const totalGider = useMemo(() => {
    return islemler
      .filter((i) => i.type === "gider" || i.type === "odeme")
      .reduce((sum, i) => sum + i.amount, 0);
  }, [islemler]);

  // Net miktar
  const netAmount = totalGelir - totalGider;

  return {
    profile,
    islemler: filteredIslemler,
    allIslemler: islemler,
    loading: loadingIslemler,
    totalGelir,
    totalGider,
    netAmount,
    refresh,
  };
};
