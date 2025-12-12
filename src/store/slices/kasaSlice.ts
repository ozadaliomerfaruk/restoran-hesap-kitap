/**
 * Kasa Slice
 *
 * Nakit, banka, kredi kartı ve birikim hesaplarını yönetir.
 */

import type { Kasa } from "../../types";
import type { StoreSlice } from "../types";
import { kasaService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface KasaSlice {
  // State
  kasalar: Kasa[];
  loadingKasalar: boolean;

  // Actions
  fetchKasalar: () => Promise<void>;
  addKasa: (
    kasa: Omit<Kasa, "id" | "created_at" | "updated_at" | "balance">
  ) => Promise<{ error: any }>;
  updateKasa: (id: string, updates: Partial<Kasa>) => Promise<{ error: any }>;
  deleteKasa: (id: string) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createKasaSlice: StoreSlice<KasaSlice> = (set, get) => ({
  // Initial State
  kasalar: [],
  loadingKasalar: false,

  // Actions
  fetchKasalar: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingKasalar: true });

    try {
      const { data } = await kasaService.fetchAll(restaurantId);
      set({ kasalar: data || [], loadingKasalar: false });
    } catch (error) {
      console.error("fetchKasalar error:", error);
      set({ loadingKasalar: false });
    }
  },

  addKasa: async (kasa) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await kasaService.create({
      ...kasa,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchKasalar();
    }

    return { error };
  },

  updateKasa: async (id, updates) => {
    const { error } = await kasaService.update(id, updates);

    if (!error) {
      get().fetchKasalar();
    }

    return { error };
  },

  deleteKasa: async (id) => {
    const { error } = await kasaService.archive(id);

    if (!error) {
      get().fetchKasalar();
    }

    return { error };
  },
});
