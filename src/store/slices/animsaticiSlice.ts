/**
 * Anımsatıcı Slice
 *
 * Hatırlatıcı/todo listesini yönetir.
 */

import type { Animsatici } from "../../types";
import type { StoreSlice } from "../types";
import { animsaticiService, profileService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface AnimsaticiSlice {
  // State
  animsaticilar: Animsatici[];
  loadingAnimsaticilar: boolean;

  // Actions
  fetchAnimsaticilar: () => Promise<void>;
  addAnimsatici: (
    animsatici: Omit<Animsatici, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateAnimsatici: (
    id: string,
    updates: Partial<Animsatici>
  ) => Promise<{ error: any }>;
  completeAnimsatici: (id: string) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createAnimsaticiSlice: StoreSlice<AnimsaticiSlice> = (
  set,
  get
) => ({
  // Initial State
  animsaticilar: [],
  loadingAnimsaticilar: false,

  // Actions
  fetchAnimsaticilar: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingAnimsaticilar: true });

    try {
      const { data } = await animsaticiService.fetchAll(restaurantId);
      set({ animsaticilar: data || [], loadingAnimsaticilar: false });
    } catch (error) {
      console.error("fetchAnimsaticilar error:", error);
      set({ loadingAnimsaticilar: false });
    }
  },

  addAnimsatici: async (animsatici) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();

    const { error } = await animsaticiService.create({
      ...animsatici,
      restaurant_id: restaurantId,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchAnimsaticilar();
    }

    return { error };
  },

  updateAnimsatici: async (id, updates) => {
    const { error } = await animsaticiService.update(id, updates);

    if (!error) {
      get().fetchAnimsaticilar();
    }

    return { error };
  },

  completeAnimsatici: async (id) => {
    const { error } = await animsaticiService.complete(id);

    if (!error) {
      get().fetchAnimsaticilar();
    }

    return { error };
  },
});
