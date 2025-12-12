/**
 * Kategori Slice
 */

import { StateCreator } from "zustand";
import { Kategori, Profile } from "../../types";
import { kategoriService } from "../../services/supabase";

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

type KategoriSliceState = KategoriSlice & { profile: Profile | null };

export const createKategoriSlice: StateCreator<
  KategoriSliceState,
  [],
  [],
  KategoriSlice
> = (set, get) => ({
  // State
  kategoriler: [],
  loadingKategoriler: false,

  // Actions
  fetchKategoriler: async () => {
    set({ loadingKategoriler: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await kategoriService.fetchAll(profile.restaurant_id);
      set({ kategoriler: data });
    }
    set({ loadingKategoriler: false });
  },

  addKategori: async (kategori) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await kategoriService.create({
      ...kategori,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) {
      get().fetchKategoriler();
    }
    return { error };
  },
});
