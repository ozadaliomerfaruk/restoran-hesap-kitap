/**
 * Tekrarlayan Ödeme Slice
 *
 * Periyodik ödemeleri (kira, fatura vb.) yönetir.
 */

import type { TekrarlayanOdeme, Kasa, Cari, Kategori } from "../../types";
import type { StoreSlice } from "../types";
import {
  tekrarlayanOdemeService,
  profileService,
} from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

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

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createTekrarlayanOdemeSlice: StoreSlice<TekrarlayanOdemeSlice> = (
  set,
  get
) => ({
  // Initial State
  tekrarlayanOdemeler: [],
  loadingTekrarlayanOdemeler: false,

  // Actions
  fetchTekrarlayanOdemeler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingTekrarlayanOdemeler: true });

    try {
      const { data } = await tekrarlayanOdemeService.fetchAll(restaurantId);
      const { kasalar, cariler, kategoriler } = get();

      // Join işlemleri
      const odemelerWithJoins = (data || []).map((odeme: TekrarlayanOdeme) => ({
        ...odeme,
        kasa: kasalar.find((k: Kasa) => k.id === odeme.kasa_id),
        cari: cariler.find((c: Cari) => c.id === odeme.cari_id),
        kategori: kategoriler.find((k: Kategori) => k.id === odeme.kategori_id),
      }));

      set({
        tekrarlayanOdemeler: odemelerWithJoins,
        loadingTekrarlayanOdemeler: false,
      });
    } catch (error) {
      console.error("fetchTekrarlayanOdemeler error:", error);
      set({ loadingTekrarlayanOdemeler: false });
    }
  },

  addTekrarlayanOdeme: async (odeme) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();

    const { error } = await tekrarlayanOdemeService.create({
      ...odeme,
      restaurant_id: restaurantId,
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
