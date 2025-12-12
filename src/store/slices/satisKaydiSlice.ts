/**
 * Satış Kaydı Slice
 *
 * POS satış kayıtlarını yönetir.
 */

import type { SatisKaydi, MenuItem } from "../../types";
import type { StoreSlice } from "../types";
import { satisKaydiService, profileService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface SatisKaydiSlice {
  // State
  satisKayitlari: SatisKaydi[];
  loadingSatisKayitlari: boolean;

  // Actions
  fetchSatisKayitlari: (limit?: number) => Promise<void>;
  addSatisKaydi: (
    kayit: Omit<SatisKaydi, "id" | "created_at">
  ) => Promise<{ error: any }>;
  updateSatisKaydi: (
    id: string,
    updates: Partial<SatisKaydi>
  ) => Promise<{ error: any }>;
  deleteSatisKaydi: (id: string) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createSatisKaydiSlice: StoreSlice<SatisKaydiSlice> = (
  set,
  get
) => ({
  // Initial State
  satisKayitlari: [],
  loadingSatisKayitlari: false,

  // Actions
  fetchSatisKayitlari: async (limit = 100) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingSatisKayitlari: true });

    try {
      const { data } = await satisKaydiService.fetchAll(restaurantId, limit);
      const { menuItems } = get();

      // Join işlemleri
      const kayitlarWithJoins = (data || []).map((kayit: SatisKaydi) => ({
        ...kayit,
        menu_item: menuItems.find((m: MenuItem) => m.id === kayit.menu_item_id),
      }));

      set({ satisKayitlari: kayitlarWithJoins, loadingSatisKayitlari: false });
    } catch (error) {
      console.error("fetchSatisKayitlari error:", error);
      set({ loadingSatisKayitlari: false });
    }
  },

  addSatisKaydi: async (kayit) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();

    const { error } = await satisKaydiService.create({
      ...kayit,
      restaurant_id: restaurantId,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchSatisKayitlari();
    }

    return { error };
  },

  updateSatisKaydi: async (id, updates) => {
    const { error } = await satisKaydiService.update(id, updates);

    if (!error) {
      get().fetchSatisKayitlari();
    }

    return { error };
  },

  deleteSatisKaydi: async (id) => {
    const { error } = await satisKaydiService.delete(id);

    if (!error) {
      get().fetchSatisKayitlari();
    }

    return { error };
  },
});
