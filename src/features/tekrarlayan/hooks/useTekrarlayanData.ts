// useTekrarlayanData Hook

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { isOverdue } from "../constants";

export const useTekrarlayanData = () => {
  const {
    profile,
    fetchProfile,
    tekrarlayanOdemeler,
    fetchTekrarlayanOdemeler,
    loadingTekrarlayanOdemeler,
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
      fetchKasalar();
      fetchCariler();
      fetchKategoriler();
      fetchTekrarlayanOdemeler();
    }
  }, [profile?.restaurant_id]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchTekrarlayanOdemeler();
  }, [fetchTekrarlayanOdemeler]);

  // Aylık toplam
  const totalMonthly = useMemo(() => {
    return tekrarlayanOdemeler
      .filter((o) => o.period === "aylik")
      .reduce((sum, o) => sum + o.amount, 0);
  }, [tekrarlayanOdemeler]);

  // Gecikmiş ödeme sayısı
  const overdueCount = useMemo(() => {
    return tekrarlayanOdemeler.filter((o) => isOverdue(o.next_date)).length;
  }, [tekrarlayanOdemeler]);

  return {
    profile,
    tekrarlayanOdemeler,
    loading: loadingTekrarlayanOdemeler,
    totalMonthly,
    overdueCount,
    refresh,
  };
};
