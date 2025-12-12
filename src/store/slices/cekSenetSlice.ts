/**
 * Çek/Senet Slice
 */

import { StateCreator } from "zustand";
import { CekSenet, Profile, Cari, Kasa } from "../../types";
import {
  cekSenetService,
  kasaService,
  cariService,
} from "../../services/supabase";

export interface CekSenetSlice {
  // State
  cekSenetler: CekSenet[];
  loadingCekSenetler: boolean;

  // Actions
  fetchCekSenetler: () => Promise<void>;
  addCekSenet: (
    cekSenet: Omit<CekSenet, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateCekSenet: (
    id: string,
    updates: Partial<CekSenet>
  ) => Promise<{ error: any }>;
  deleteCekSenet: (id: string) => Promise<{ error: any }>;
}

type CekSenetSliceState = CekSenetSlice & {
  profile: Profile | null;
  cariler: Cari[];
  kasalar: Kasa[];
  fetchKasalar: () => Promise<void>;
  fetchCariler: () => Promise<void>;
};

export const createCekSenetSlice: StateCreator<
  CekSenetSliceState,
  [],
  [],
  CekSenetSlice
> = (set, get) => ({
  // State
  cekSenetler: [],
  loadingCekSenetler: false,

  // Actions
  fetchCekSenetler: async () => {
    set({ loadingCekSenetler: true });
    const { profile, cariler, kasalar } = get();
    if (profile?.restaurant_id) {
      const { data } = await cekSenetService.fetchAll(profile.restaurant_id);

      const cekSenetlerWithJoins = data.map((cs: CekSenet) => ({
        ...cs,
        cari: cariler.find((c) => c.id === cs.cari_id),
        kasa: kasalar.find((k) => k.id === cs.kasa_id),
      }));

      set({ cekSenetler: cekSenetlerWithJoins });
    }
    set({ loadingCekSenetler: false });
  },

  addCekSenet: async (cekSenet) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await cekSenetService.create({
      ...cekSenet,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) {
      get().fetchCekSenetler();
    }
    return { error };
  },

  updateCekSenet: async (id, updates) => {
    const { cekSenetler } = get();
    const cekSenet = cekSenetler.find((cs) => cs.id === id);

    const { error } = await cekSenetService.update(id, updates);

    if (!error && cekSenet) {
      if (updates.status && updates.status !== cekSenet.status) {
        const kasaId = updates.kasa_id || cekSenet.kasa_id;

        if (kasaId) {
          if (
            updates.status === "tahsil_edildi" &&
            cekSenet.direction === "alacak"
          ) {
            await kasaService.updateBalance(kasaId, cekSenet.amount);
          } else if (
            updates.status === "odendi" &&
            cekSenet.direction === "borc"
          ) {
            await kasaService.updateBalance(kasaId, -cekSenet.amount);
          }
        }

        if (cekSenet.cari_id) {
          if (
            updates.status === "tahsil_edildi" &&
            cekSenet.direction === "alacak"
          ) {
            await cariService.updateBalance(cekSenet.cari_id, -cekSenet.amount);
          } else if (
            updates.status === "odendi" &&
            cekSenet.direction === "borc"
          ) {
            await cariService.updateBalance(cekSenet.cari_id, cekSenet.amount);
          }
        }
      }

      get().fetchCekSenetler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  deleteCekSenet: async (id) => {
    const { error } = await cekSenetService.delete(id);
    if (!error) {
      get().fetchCekSenetler();
    }
    return { error };
  },
});
