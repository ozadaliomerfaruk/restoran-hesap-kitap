// Ürün Detay Data Hook

import { useMemo, useCallback, useState } from "react";
import { useStore } from "../../../store/useStore";
import { UrunStats } from "../types";

export function useUrunDetayData(urunId: string) {
  const { menuItems, fetchMenuItems, satisKayitlari, fetchSatisKayitlari } =
    useStore();

  const [refreshing, setRefreshing] = useState(false);

  // Ürün bulma
  const urun = useMemo(
    () => menuItems.find((m) => m.id === urunId),
    [menuItems, urunId]
  );

  // Bu ürüne ait satışlar (tarihe göre sıralı)
  const urunSatislari = useMemo(() => {
    return satisKayitlari
      .filter((s) => s.menu_item_id === urunId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [satisKayitlari, urunId]);

  // İstatistikler
  const stats = useMemo<UrunStats>(() => {
    const toplamAdet = urunSatislari.reduce((sum, s) => sum + s.quantity, 0);
    const toplamCiro = urunSatislari.reduce((sum, s) => sum + s.total_price, 0);
    return { toplamAdet, toplamCiro };
  }, [urunSatislari]);

  // Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchMenuItems(), fetchSatisKayitlari()]);
    setRefreshing(false);
  }, [fetchMenuItems, fetchSatisKayitlari]);

  return {
    urun,
    urunSatislari,
    stats,
    refreshing,
    onRefresh,
  };
}
