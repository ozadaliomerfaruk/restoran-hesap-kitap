/**
 * Cari Slice
 *
 * Tedarikçi ve müşteri cari hesaplarını yönetir.
 */

import type { Cari } from "../../types";
import type { StoreSlice } from "../types";
import { cariService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface CariSlice {
  // State
  cariler: Cari[];
  loadingCariler: boolean;

  // Actions
  fetchCariler: () => Promise<void>;
  addCari: (
    cari: Omit<Cari, "id" | "created_at" | "updated_at" | "balance">
  ) => Promise<{ error: any }>;
  updateCari: (id: string, updates: Partial<Cari>) => Promise<{ error: any }>;
  deleteCari: (id: string) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createCariSlice: StoreSlice<CariSlice> = (set, get) => ({
  // Initial State
  cariler: [],
  loadingCariler: false,

  // Actions
  fetchCariler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingCariler: true });

    try {
      const { data } = await cariService.fetchAll(restaurantId);
      set({ cariler: data || [], loadingCariler: false });
    } catch (error) {
      console.error("fetchCariler error:", error);
      set({ loadingCariler: false });
    }
  },

  addCari: async (cari) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await cariService.create({
      ...cari,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchCariler();
    }

    return { error };
  },

  updateCari: async (id, updates) => {
    const { error } = await cariService.update(id, updates);

    if (!error) {
      get().fetchCariler();
    }

    return { error };
  },

  deleteCari: async (id) => {
    const { error } = await cariService.archive(id);

    if (!error) {
      get().fetchCariler();
    }

    return { error };
  },
});
