/**
 * Kategori Slice
 *
 * Gelir ve gider kategorilerini yönetir.
 * Hiyerarşik yapı destekler (parent_id).
 *
 * NOT: Mevcut service'de sadece fetchAll ve create var.
 * Update/delete gerekirse service'e eklenmeli.
 */

import type { Kategori } from "../../types";
import type { StoreSlice } from "../types";
import { kategoriService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface KategoriSlice {
  // State
  kategoriler: Kategori[];
  loadingKategoriler: boolean;

  // Actions
  fetchKategoriler: () => Promise<void>;
  addKategori: (
    kategori: Omit<Kategori, "id" | "created_at">
  ) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createKategoriSlice: StoreSlice<KategoriSlice> = (set, get) => ({
  // Initial State
  kategoriler: [],
  loadingKategoriler: false,

  // Actions
  fetchKategoriler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingKategoriler: true });

    try {
      const { data } = await kategoriService.fetchAll(restaurantId);
      set({ kategoriler: data || [], loadingKategoriler: false });
    } catch (error) {
      console.error("fetchKategoriler error:", error);
      set({ loadingKategoriler: false });
    }
  },

  addKategori: async (kategori) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await kategoriService.create({
      ...kategori,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchKategoriler();
    }

    return { error };
  },
});
