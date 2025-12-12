// usePersonelData Hook - Centralized data fetching

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";

export const usePersonelData = () => {
  const {
    profile,
    fetchProfile,
    personeller,
    fetchPersoneller,
    personelIslemler,
    fetchPersonelIslemler,
    kasalar,
    fetchKasalar,
    izinler,
    fetchIzinler,
  } = useStore();

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch when restaurant_id is available
  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchKasalar();
      fetchIzinler();
    }
  }, [profile?.restaurant_id]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPersoneller(),
      fetchPersonelIslemler(),
      fetchKasalar(),
      fetchIzinler(),
    ]);
  }, [fetchPersoneller, fetchPersonelIslemler, fetchKasalar, fetchIzinler]);

  // Nakit ve banka kasaları (ödeme/tahsilat için)
  const nakitBankaKasalar = useMemo(
    () => kasalar.filter((k) => k.type === "nakit" || k.type === "banka"),
    [kasalar]
  );

  // İsme göre sıralı personeller
  const sortedPersoneller = useMemo(
    () => [...personeller].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [personeller]
  );

  // Toplam borç/alacak hesaplamaları (sadece raporlara dahil olanlar)
  const { toplamBorcumuz, toplamAlacagimiz } = useMemo(() => {
    const borcumuz = personeller
      .filter((p) => (p.balance || 0) > 0 && p.include_in_reports)
      .reduce((sum, p) => sum + (p.balance || 0), 0);

    const alacagimiz = personeller
      .filter((p) => (p.balance || 0) < 0 && p.include_in_reports)
      .reduce((sum, p) => sum + Math.abs(p.balance || 0), 0);

    return { toplamBorcumuz: borcumuz, toplamAlacagimiz: alacagimiz };
  }, [personeller]);

  return {
    profile,
    personeller: sortedPersoneller,
    personelIslemler,
    kasalar,
    nakitBankaKasalar,
    izinler,
    toplamBorcumuz,
    toplamAlacagimiz,
    refreshAll,
  };
};
