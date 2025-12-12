/**
 * Cari Slice
 */

import { StateCreator } from "zustand";
import { Cari, Profile } from "../../types";
import { cariService } from "../../services/supabase";

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

type CariSliceState = CariSlice & { profile: Profile | null };

export const createCariSlice: StateCreator<
  CariSliceState,
  [],
  [],
  CariSlice
> = (set, get) => ({
  // State
  cariler: [],
  loadingCariler: false,

  // Actions
  fetchCariler: async () => {
    set({ loadingCariler: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await cariService.fetchAll(profile.restaurant_id);
      set({ cariler: data });
    }
    set({ loadingCariler: false });
  },

  addCari: async (cari) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await cariService.create({
      ...cari,
      restaurant_id: profile.restaurant_id,
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
