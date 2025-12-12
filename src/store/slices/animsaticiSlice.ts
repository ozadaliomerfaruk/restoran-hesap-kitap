/**
 * Anımsatıcı Slice
 */

import { StateCreator } from "zustand";
import { Animsatici, Profile } from "../../types";
import { animsaticiService, profileService } from "../../services/supabase";

export interface AnimsaticiSlice {
  // State
  animsaticilar: Animsatici[];
  loadingAnimsaticilar: boolean;

  // Actions
  fetchAnimsaticilar: () => Promise<void>;
  addAnimsatici: (
    animsatici: Omit<
      Animsatici,
      "id" | "created_at" | "updated_at" | "is_completed" | "completed_at"
    >
  ) => Promise<{ error: any }>;
  updateAnimsatici: (
    id: string,
    updates: Partial<Animsatici>
  ) => Promise<{ error: any }>;
  completeAnimsatici: (id: string) => Promise<{ error: any }>;
}

type AnimsaticiSliceState = AnimsaticiSlice & { profile: Profile | null };

export const createAnimsaticiSlice: StateCreator<
  AnimsaticiSliceState,
  [],
  [],
  AnimsaticiSlice
> = (set, get) => ({
  // State
  animsaticilar: [],
  loadingAnimsaticilar: false,

  // Actions
  fetchAnimsaticilar: async () => {
    set({ loadingAnimsaticilar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await animsaticiService.fetchAll(profile.restaurant_id);
      set({ animsaticilar: data });
    }
    set({ loadingAnimsaticilar: false });
  },

  addAnimsatici: async (animsatici) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { error } = await animsaticiService.create({
      ...animsatici,
      restaurant_id: profile.restaurant_id,
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
