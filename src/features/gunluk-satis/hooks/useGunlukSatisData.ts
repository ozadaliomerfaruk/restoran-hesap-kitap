// useGunlukSatisData Hook

import { useEffect, useCallback, useMemo } from "react";
import { useStore } from "../../../store/useStore";
import { MenuItem } from "../../../types";
import { FilterType, UrunStats, VARSAYILAN_KATEGORILER } from "../types";

export const useGunlukSatisData = (
  searchText: string,
  filterType: FilterType,
  selectedKategori: string | null
) => {
  const {
    profile,
    fetchProfile,
    menuItems,
    fetchMenuItems,
    satisKayitlari,
    fetchSatisKayitlari,
    urunKategorileri,
    fetchUrunKategorileri,
  } = useStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchMenuItems();
      fetchSatisKayitlari();
      fetchUrunKategorileri();
    }
  }, [profile?.restaurant_id]);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchMenuItems(),
      fetchSatisKayitlari(),
      fetchUrunKategorileri(),
    ]);
  }, [fetchMenuItems, fetchSatisKayitlari, fetchUrunKategorileri]);

  const tumKategoriler = useMemo(() => {
    const dbKategoriler = urunKategorileri.map((k) => k.name);
    return [...new Set([...VARSAYILAN_KATEGORILER, ...dbKategoriler])].sort();
  }, [urunKategorileri]);

  const getUrunStats = useCallback(
    (urunId: string): UrunStats => {
      const urunSatislar = satisKayitlari.filter(
        (s) => s.menu_item_id === urunId
      );
      return {
        toplamAdet: urunSatislar.reduce((sum, s) => sum + s.quantity, 0),
        toplamCiro: urunSatislar.reduce((sum, s) => sum + s.total_price, 0),
      };
    },
    [satisKayitlari]
  );

  const filteredAndSortedItems = useMemo(() => {
    let items = menuItems.filter(
      (u) => u.is_active && u.include_in_invoice !== false
    );

    if (searchText) {
      const search = searchText.toLowerCase();
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.category?.toLowerCase().includes(search)
      );
    }

    if (filterType === "kategori" && selectedKategori) {
      items = items.filter((u) => u.category === selectedKategori);
    }

    if (filterType === "en_cok_satan" || filterType === "en_cok_ciro") {
      const itemsWithStats = items.map((item) => ({
        ...item,
        _stats: getUrunStats(item.id),
      }));
      itemsWithStats.sort((a: any, b: any) =>
        filterType === "en_cok_satan"
          ? b._stats.toplamAdet - a._stats.toplamAdet
          : b._stats.toplamCiro - a._stats.toplamCiro
      );
      return itemsWithStats;
    }

    return items.sort((a, b) => {
      if (a.category !== b.category)
        return (a.category || "").localeCompare(b.category || "");
      return a.name.localeCompare(b.name);
    });
  }, [menuItems, searchText, filterType, selectedKategori, getUrunStats]);

  const groupedItems = useMemo(() => {
    if (filterType === "en_cok_satan" || filterType === "en_cok_ciro")
      return null;
    const groups: Record<string, MenuItem[]> = {};
    filteredAndSortedItems.forEach((item) => {
      const cat = item.category || "Diğer";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredAndSortedItems, filterType]);

  return {
    menuItems,
    tumKategoriler,
    urunKategorileri,
    filteredAndSortedItems,
    groupedItems,
    getUrunStats,
    refreshAll,
  };
};
