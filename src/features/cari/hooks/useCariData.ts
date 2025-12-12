// useCariData Hook - Centralized data fetching

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { CariFilter } from "../types";

export const useCariData = (filter: CariFilter = "all") => {
  const {
    profile,
    fetchProfile,
    cariler,
    fetchCariler,
    kasalar,
    fetchKasalar,
    kategoriler,
    fetchKategoriler,
  } = useStore();

  // Initial fetch
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch when restaurant_id is available
  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchCariler();
      fetchKasalar();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchCariler(), fetchKasalar()]);
  }, [fetchCariler, fetchKasalar]);

  // Filtered cariler
  const filteredCariler = useMemo(() => {
    return cariler
      .filter((cari) => filter === "all" || cari.type === filter)
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [cariler, filter]);

  // Nakit ve banka kasaları
  const nakitBankaKasalar = useMemo(
    () => kasalar.filter((k) => k.type === "nakit" || k.type === "banka"),
    [kasalar]
  );

  // Gider kategorileri (alış için)
  const giderKategoriler = useMemo(
    () => kategoriler.filter((k) => k.type === "gider"),
    [kategoriler]
  );

  // Toplam borç/alacak (sadece raporlara dahil olanlar)
  const { toplamTedarikciBorc, toplamMusteriAlacak } = useMemo(() => {
    const tedBorc = cariler
      .filter(
        (c) => c.type === "tedarikci" && c.balance > 0 && c.include_in_reports
      )
      .reduce((sum, c) => sum + c.balance, 0);

    const mustAlacak = cariler
      .filter(
        (c) => c.type === "musteri" && c.balance > 0 && c.include_in_reports
      )
      .reduce((sum, c) => sum + c.balance, 0);

    return { toplamTedarikciBorc: tedBorc, toplamMusteriAlacak: mustAlacak };
  }, [cariler]);

  // Cari sayıları
  const cariCounts = useMemo(
    () => ({
      all: cariler.length,
      tedarikci: cariler.filter((c) => c.type === "tedarikci").length,
      musteri: cariler.filter((c) => c.type === "musteri").length,
    }),
    [cariler]
  );

  return {
    profile,
    cariler: filteredCariler,
    allCariler: cariler,
    kasalar,
    nakitBankaKasalar,
    kategoriler,
    giderKategoriler,
    toplamTedarikciBorc,
    toplamMusteriAlacak,
    cariCounts,
    refreshAll,
    fetchCariler,
    fetchKategoriler,
  };
};
