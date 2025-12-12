/**
 * Kasa Slice
 */

import { StateCreator } from "zustand";
import { Kasa, Profile } from "../../types";
import { kasaService } from "../../services/supabase";

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
  transferBetweenKasalar: (
    fromKasaId: string,
    toKasaId: string,
    amount: number,
    description?: string
  ) => Promise<{ error: any }>;
}

type KasaSliceState = KasaSlice & {
  profile: Profile | null;
  fetchIslemler: () => Promise<void>;
};

export const createKasaSlice: StateCreator<
  KasaSliceState,
  [],
  [],
  KasaSlice
> = (set, get) => ({
  // State
  kasalar: [],
  loadingKasalar: false,

  // Actions
  fetchKasalar: async () => {
    set({ loadingKasalar: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await kasaService.fetchAll(profile.restaurant_id);
      set({ kasalar: data });
    }
    set({ loadingKasalar: false });
  },

  addKasa: async (kasa) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await kasaService.create({
      ...kasa,
      restaurant_id: profile.restaurant_id,
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

  transferBetweenKasalar: async (fromKasaId, toKasaId, amount, description) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    // Transfer işlemi için islem service'i kullan
    const { supabase } = await import("../../lib/supabase");

    const { error } = await supabase.from("islemler").insert({
      type: "transfer",
      amount,
      description: description || "Kasalar arası transfer",
      date: new Date().toISOString().split("T")[0],
      kasa_id: fromKasaId,
      kasa_hedef_id: toKasaId,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      await kasaService.updateBalance(fromKasaId, -amount);
      await kasaService.updateBalance(toKasaId, amount);
      get().fetchKasalar();
      get().fetchIslemler();
    }
    return { error };
  },
});

// profileService import for getCurrentUser
import { profileService } from "../../services/supabase";
