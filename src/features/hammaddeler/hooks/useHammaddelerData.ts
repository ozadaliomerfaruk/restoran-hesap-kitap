// useHammaddelerData Hook

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";

export const useHammaddelerData = (
  searchText: string,
  selectedKategori: string | null
) => {
  const {
    profile,
    fetchProfile,
    urunler,
    fetchUrunler,
    kategoriler,
    fetchKategoriler,
  } = useStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchUrunler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchUrunler(), fetchKategoriler()]);
  }, [fetchUrunler, fetchKategoriler]);

  const giderKategorileri = useMemo(
    () => kategoriler.filter((k) => k.type === "gider"),
    [kategoriler]
  );

  const filteredItems = useMemo(() => {
    let items = urunler.filter((u) => u.is_active);
    if (searchText)
      items = items.filter((u) =>
        u.name.toLowerCase().includes(searchText.toLowerCase())
      );
    if (selectedKategori)
      items = items.filter((u) => u.kategori_id === selectedKategori);
    return items.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [urunler, searchText, selectedKategori]);

  const groupedItems = useMemo(() => {
    if (selectedKategori) return null;
    const groups: Record<string, typeof urunler> = {};
    filteredItems.forEach((item) => {
      const kat = giderKategorileri.find((k) => k.id === item.kategori_id);
      const katName = kat?.name || "Kategorisiz";
      if (!groups[katName]) groups[katName] = [];
      groups[katName].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "tr"));
  }, [filteredItems, giderKategorileri, selectedKategori]);

  return {
    urunler,
    giderKategorileri,
    filteredItems,
    groupedItems,
    refreshAll,
  };
};
