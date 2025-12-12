/**
 * Günlük Satış Slice
 *
 * Günlük satış kayıtlarını ve detaylarını yönetir.
 */

import type { GunlukSatis } from "../../types";
import type { StoreSlice } from "../types";
import { gunlukSatisService, profileService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface GunlukSatisSlice {
  // State
  gunlukSatislar: GunlukSatis[];
  loadingGunlukSatislar: boolean;

  // Actions
  fetchGunlukSatislar: () => Promise<void>;
  addGunlukSatis: (
    satis: Omit<GunlukSatis, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateGunlukSatis: (
    id: string,
    updates: Partial<GunlukSatis>
  ) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createGunlukSatisSlice: StoreSlice<GunlukSatisSlice> = (
  set,
  get
) => ({
  // Initial State
  gunlukSatislar: [],
  loadingGunlukSatislar: false,

  // Actions
  fetchGunlukSatislar: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingGunlukSatislar: true });

    try {
      const { data } = await gunlukSatisService.fetchAll(restaurantId);
      set({ gunlukSatislar: data || [], loadingGunlukSatislar: false });
    } catch (error) {
      console.error("fetchGunlukSatislar error:", error);
      set({ loadingGunlukSatislar: false });
    }
  },

  addGunlukSatis: async (satis) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();

    if (!user) {
      return { error: "No user" };
    }

    const { error } = await gunlukSatisService.create({
      ...satis,
      restaurant_id: restaurantId,
      created_by: user.id,
    });

    if (!error) {
      get().fetchGunlukSatislar();
    }

    return { error };
  },

  updateGunlukSatis: async (id, updates) => {
    const { gunlukSatislar } = get();
    const currentSatis = gunlukSatislar.find((s: GunlukSatis) => s.id === id);

    const { error } = await gunlukSatisService.update(
      id,
      updates,
      currentSatis
    );

    if (!error) {
      get().fetchGunlukSatislar();
    }

    return { error };
  },
});
