/**
 * Günlük Satış Slice
 */

import { StateCreator } from "zustand";
import { GunlukSatis, Profile } from "../../types";
import { gunlukSatisService, profileService } from "../../services/supabase";

export interface GunlukSatisSlice {
  // State
  gunlukSatislar: GunlukSatis[];
  loadingGunlukSatislar: boolean;

  // Actions
  fetchGunlukSatislar: () => Promise<void>;
  addGunlukSatis: (
    satis: Omit<GunlukSatis, "id" | "created_at" | "updated_at" | "created_by">
  ) => Promise<{ error: any }>;
  updateGunlukSatis: (
    id: string,
    updates: Partial<GunlukSatis>
  ) => Promise<{ error: any }>;
}

type GunlukSatisSliceState = GunlukSatisSlice & { profile: Profile | null };

export const createGunlukSatisSlice: StateCreator<
  GunlukSatisSliceState,
  [],
  [],
  GunlukSatisSlice
> = (set, get) => ({
  // State
  gunlukSatislar: [],
  loadingGunlukSatislar: false,

  // Actions
  fetchGunlukSatislar: async () => {
    set({ loadingGunlukSatislar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await gunlukSatisService.fetchAll(profile.restaurant_id);
      set({ gunlukSatislar: data });
    }
    set({ loadingGunlukSatislar: false });
  },

  addGunlukSatis: async (satis) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await gunlukSatisService.create({
      ...satis,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      get().fetchGunlukSatislar();
    }
    return { error };
  },

  updateGunlukSatis: async (id, updates) => {
    const { gunlukSatislar } = get();
    const current = gunlukSatislar.find((s) => s.id === id);

    const { error } = await gunlukSatisService.update(id, updates, current);
    if (!error) {
      get().fetchGunlukSatislar();
    }
    return { error };
  },
});
