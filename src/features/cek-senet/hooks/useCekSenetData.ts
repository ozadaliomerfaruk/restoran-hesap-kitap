// useCekSenetData Hook - Optimized

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { FilterType, DirectionFilter } from "../types";

export const useCekSenetData = (
  typeFilter: FilterType = "all",
  directionFilter: DirectionFilter = "all"
) => {
  const {
    profile,
    fetchProfile,
    cekSenetler,
    fetchCekSenetler,
    loadingCekSenetler,
    fetchCariler,
  } = useStore();

  // Initial fetch - with proper dependencies
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Fetch when restaurant_id is available
  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchCariler();
      fetchCekSenetler();
    }
  }, [profile?.restaurant_id, fetchCariler, fetchCekSenetler]);

  // Refresh data - stable reference
  const refresh = useCallback(async () => {
    await fetchCekSenetler();
  }, [fetchCekSenetler]);

  // Filtered list - optimized
  const filteredCekSenetler = useMemo(() => {
    return cekSenetler.filter((cs) => {
      const matchesType = typeFilter === "all" || cs.type === typeFilter;
      const matchesDirection =
        directionFilter === "all" || cs.direction === directionFilter;
      return matchesType && matchesDirection;
    });
  }, [cekSenetler, typeFilter, directionFilter]);

  // Bekleyen alacak toplamı
  const bekleyenAlacak = useMemo(() => {
    return cekSenetler
      .filter((cs) => cs.direction === "alacak" && cs.status === "beklemede")
      .reduce((sum, cs) => sum + cs.amount, 0);
  }, [cekSenetler]);

  // Bekleyen borç toplamı
  const bekleyenBorc = useMemo(() => {
    return cekSenetler
      .filter((cs) => cs.direction === "borc" && cs.status === "beklemede")
      .reduce((sum, cs) => sum + cs.amount, 0);
  }, [cekSenetler]);

  return {
    profile,
    cekSenetler: filteredCekSenetler,
    allCekSenetler: cekSenetler,
    loading: loadingCekSenetler,
    bekleyenAlacak,
    bekleyenBorc,
    refresh,
  };
};
