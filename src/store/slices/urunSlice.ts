/**
 * Ürün Slice
 */

import { StateCreator } from "zustand";
import { Urun, Profile, Kategori } from "../../types";
import { urunService } from "../../services/supabase";

export interface UrunSlice {
  // State
  urunler: Urun[];
  loadingUrunler: boolean;

  // Actions
  fetchUrunler: () => Promise<void>;
  addUrun: (
    urun: Omit<Urun, "id" | "restaurant_id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateUrun: (id: string, updates: Partial<Urun>) => Promise<{ error: any }>;
}

type UrunSliceState = UrunSlice & {
  profile: Profile | null;
  kategoriler: Kategori[];
};

export const createUrunSlice: StateCreator<
  UrunSliceState,
  [],
  [],
  UrunSlice
> = (set, get) => ({
  // State
  urunler: [],
  loadingUrunler: false,

  // Actions
  fetchUrunler: async () => {
    set({ loadingUrunler: true });
    const { profile, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data } = await urunService.fetchAll(profile.restaurant_id);

      const urunlerWithJoins = data.map((urun: Urun) => ({
        ...urun,
        kategori: kategoriler.find((k) => k.id === urun.kategori_id),
      }));

      set({ urunler: urunlerWithJoins });
    }
    set({ loadingUrunler: false });
  },

  addUrun: async (urun) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await urunService.create({
      ...urun,
      restaurant_id: profile.restaurant_id,
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
