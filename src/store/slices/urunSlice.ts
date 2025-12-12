/**
 * Ürün Slice
 *
 * Stok/malzeme ürünlerini yönetir.
 */

import type { Urun, Kategori } from "../../types";
import type { StoreSlice } from "../types";
import { urunService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface UrunSlice {
  // State
  urunler: Urun[];
  loadingUrunler: boolean;

  // Actions
  fetchUrunler: () => Promise<void>;
  addUrun: (
    urun: Omit<Urun, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateUrun: (id: string, updates: Partial<Urun>) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createUrunSlice: StoreSlice<UrunSlice> = (set, get) => ({
  // Initial State
  urunler: [],
  loadingUrunler: false,

  // Actions
  fetchUrunler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingUrunler: true });

    try {
      const { data } = await urunService.fetchAll(restaurantId);
      const { kategoriler } = get();

      // Join işlemleri
      const urunlerWithJoins = (data || []).map((urun: Urun) => ({
        ...urun,
        kategori: kategoriler.find((k: Kategori) => k.id === urun.kategori_id),
      }));

      set({ urunler: urunlerWithJoins, loadingUrunler: false });
    } catch (error) {
      console.error("fetchUrunler error:", error);
      set({ loadingUrunler: false });
    }
  },

  addUrun: async (urun) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await urunService.create({
      ...urun,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchUrunler();
    }

    return { error };
  },

  updateUrun: async (id, updates) => {
    const { error } = await urunService.update(id, updates);

    if (!error) {
      get().fetchUrunler();
    }

    return { error };
  },
});
