/**
 * Ürün Kategorisi Slice
 *
 * Ürün kategorilerini yönetir (malzeme kategorileri).
 *
 * NOT: Ayrı bir urunKategoriService yok, supabase direkt kullanılıyor.
 */

import type { UrunKategorisi } from "../../types";
import type { StoreSlice } from "../types";
import { supabase } from "../../lib/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface UrunKategoriSlice {
  // State
  urunKategorileri: UrunKategorisi[];
  loadingUrunKategorileri: boolean;

  // Actions
  fetchUrunKategorileri: () => Promise<void>;
  addUrunKategorisi: (
    kategori: Omit<UrunKategorisi, "id" | "created_at">
  ) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createUrunKategoriSlice: StoreSlice<UrunKategoriSlice> = (
  set,
  get
) => ({
  // Initial State
  urunKategorileri: [],
  loadingUrunKategorileri: false,

  // Actions
  fetchUrunKategorileri: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingUrunKategorileri: true });

    try {
      const { data, error } = await supabase
        .from("urun_kategorileri")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("name");

      if (error) throw error;

      set({ urunKategorileri: data || [], loadingUrunKategorileri: false });
    } catch (error) {
      console.error("fetchUrunKategorileri error:", error);
      set({ loadingUrunKategorileri: false });
    }
  },

  addUrunKategorisi: async (kategori) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await supabase.from("urun_kategorileri").insert({
      ...kategori,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchUrunKategorileri();
    }

    return { error };
  },
});
