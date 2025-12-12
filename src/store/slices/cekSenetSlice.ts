/**
 * Çek/Senet Slice
 *
 * Çek ve senet işlemlerini yönetir.
 * Status değişikliklerinde balance güncellemeleri ledger üzerinden yapılır.
 */

import type { CekSenet, Cari, Kasa } from "../../types";
import type { StoreSlice } from "../types";
import { cekSenetService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";
import { ledger } from "../domain";

// ============================================
// SLICE INTERFACE
// ============================================

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

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createCekSenetSlice: StoreSlice<CekSenetSlice> = (set, get) => ({
  // Initial State
  cekSenetler: [],
  loadingCekSenetler: false,

  // Actions
  fetchCekSenetler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingCekSenetler: true });

    try {
      const { data } = await cekSenetService.fetchAll(restaurantId);
      const { cariler, kasalar } = get();

      // Join işlemleri
      const cekSenetlerWithJoins = (data || []).map((cs: CekSenet) => ({
        ...cs,
        cari: cariler.find((c: Cari) => c.id === cs.cari_id),
        kasa: kasalar.find((k: Kasa) => k.id === cs.kasa_id),
      }));

      set({ cekSenetler: cekSenetlerWithJoins, loadingCekSenetler: false });
    } catch (error) {
      console.error("fetchCekSenetler error:", error);
      set({ loadingCekSenetler: false });
    }
  },

  addCekSenet: async (cekSenet) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await cekSenetService.create({
      ...cekSenet,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchCekSenetler();
    }

    return { error };
  },

  updateCekSenet: async (id, updates) => {
    const { cekSenetler } = get();
    const cekSenet = cekSenetler.find((cs: CekSenet) => cs.id === id);

    if (!cekSenet) {
      return { error: "Çek/Senet bulunamadı" };
    }

    // Status değişikliği varsa ledger üzerinden yap
    if (updates.status && updates.status !== cekSenet.status) {
      const result = await ledger.updateCekSenetStatus(
        cekSenet,
        updates.status,
        updates.kasa_id
      );

      if (result.success) {
        get().fetchCekSenetler();
        get().fetchKasalar();
        get().fetchCariler();
      }

      return { error: result.success ? null : result.error };
    }

    // Normal güncelleme
    const { error } = await cekSenetService.update(id, updates);

    if (!error) {
      get().fetchCekSenetler();
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
