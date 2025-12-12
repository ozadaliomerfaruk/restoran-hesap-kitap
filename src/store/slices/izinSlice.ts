/**
 * İzin Slice
 *
 * Personel izinlerini yönetir.
 * Yıllık izin kullanımında used_leave_days güncellenir.
 */

import type { Izin, Personel } from "../../types";
import type { StoreSlice } from "../types";
import { personelService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface IzinSlice {
  // State
  izinler: Izin[];
  loadingIzinler: boolean;

  // Actions
  fetchIzinler: () => Promise<void>;
  addIzin: (izin: Omit<Izin, "id" | "created_at">) => Promise<{ error: any }>;
  updateIzin: (id: string, updates: Partial<Izin>) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createIzinSlice: StoreSlice<IzinSlice> = (set, get) => ({
  // Initial State
  izinler: [],
  loadingIzinler: false,

  // Actions
  fetchIzinler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingIzinler: true });

    try {
      const { data } = await personelService.fetchIzinler(restaurantId);
      const { personeller } = get();

      // Join işlemleri
      const izinlerWithJoins = (data || []).map((izin: Izin) => ({
        ...izin,
        personel: personeller.find((p: Personel) => p.id === izin.personel_id),
      }));

      set({ izinler: izinlerWithJoins, loadingIzinler: false });
    } catch (error) {
      console.error("fetchIzinler error:", error);
      set({ loadingIzinler: false });
    }
  },

  addIzin: async (izin) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await personelService.createIzin({
      ...izin,
      restaurant_id: restaurantId,
    });

    if (!error) {
      // Yıllık izin ise used_leave_days güncelle
      if (izin.type === "yillik") {
        await personelService.updateUsedLeave(izin.personel_id, izin.days);
      }

      get().fetchIzinler();
      get().fetchPersoneller();
    }

    return { error };
  },

  updateIzin: async (id, updates) => {
    const { error } = await personelService.updateIzin(id, updates);

    if (!error) {
      get().fetchIzinler();
    }

    return { error };
  },
});
