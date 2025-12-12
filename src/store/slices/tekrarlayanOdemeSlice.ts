/**
 * Tekrarlayan Ödeme Slice
 */

import { StateCreator } from "zustand";
import { TekrarlayanOdeme, Profile, Kasa, Cari, Kategori } from "../../types";
import {
  tekrarlayanOdemeService,
  profileService,
} from "../../services/supabase";

export interface TekrarlayanOdemeSlice {
  // State
  tekrarlayanOdemeler: TekrarlayanOdeme[];
  loadingTekrarlayanOdemeler: boolean;

  // Actions
  fetchTekrarlayanOdemeler: () => Promise<void>;
  addTekrarlayanOdeme: (
    odeme: Omit<TekrarlayanOdeme, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateTekrarlayanOdeme: (
    id: string,
    updates: Partial<TekrarlayanOdeme>
  ) => Promise<{ error: any }>;
  deleteTekrarlayanOdeme: (id: string) => Promise<{ error: any }>;
}

type TekrarlayanOdemeSliceState = TekrarlayanOdemeSlice & {
  profile: Profile | null;
  kasalar: Kasa[];
  cariler: Cari[];
  kategoriler: Kategori[];
};

export const createTekrarlayanOdemeSlice: StateCreator<
  TekrarlayanOdemeSliceState,
  [],
  [],
  TekrarlayanOdemeSlice
> = (set, get) => ({
  // State
  tekrarlayanOdemeler: [],
  loadingTekrarlayanOdemeler: false,

  // Actions
  fetchTekrarlayanOdemeler: async () => {
    set({ loadingTekrarlayanOdemeler: true });
    const { profile, kasalar, cariler, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data } = await tekrarlayanOdemeService.fetchAll(
        profile.restaurant_id
      );

      const odemelerWithJoins = data.map((odeme: TekrarlayanOdeme) => ({
        ...odeme,
        kasa: kasalar.find((k) => k.id === odeme.kasa_id),
        cari: cariler.find((c) => c.id === odeme.cari_id),
        kategori: kategoriler.find((k) => k.id === odeme.kategori_id),
      }));

      set({ tekrarlayanOdemeler: odemelerWithJoins });
    }
    set({ loadingTekrarlayanOdemeler: false });
  },

  addTekrarlayanOdeme: async (odeme) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { error } = await tekrarlayanOdemeService.create({
      ...odeme,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },

  updateTekrarlayanOdeme: async (id, updates) => {
    const { error } = await tekrarlayanOdemeService.update(id, updates);
    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },

  deleteTekrarlayanOdeme: async (id) => {
    const { error } = await tekrarlayanOdemeService.deactivate(id);
    if (!error) {
      get().fetchTekrarlayanOdemeler();
    }
    return { error };
  },
});
