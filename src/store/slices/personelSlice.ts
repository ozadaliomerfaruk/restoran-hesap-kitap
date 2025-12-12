/**
 * Personel Slice
 *
 * Personel ve personel işlemlerini yönetir.
 * Balance güncellemeleri ledger üzerinden yapılır.
 */

import type { Personel, PersonelIslem, Kasa } from "../../types";
import type { StoreSlice } from "../types";
import { personelService, profileService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";
import { ledger } from "../domain";

// ============================================
// SLICE INTERFACE
// ============================================

export interface PersonelSlice {
  // State
  personeller: Personel[];
  loadingPersoneller: boolean;
  personelIslemler: PersonelIslem[];
  loadingPersonelIslemler: boolean;

  // Personel Actions
  fetchPersoneller: () => Promise<void>;
  addPersonel: (
    personel: Omit<Personel, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any; data: Personel | null }>;
  updatePersonel: (
    id: string,
    updates: Partial<Personel>
  ) => Promise<{ error: any }>;
  deletePersonel: (id: string) => Promise<{ error: any }>;

  // Personel İşlem Actions
  fetchPersonelIslemler: () => Promise<void>;
  addPersonelIslem: (
    islem: Omit<PersonelIslem, "id" | "created_at" | "created_by">
  ) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createPersonelSlice: StoreSlice<PersonelSlice> = (set, get) => ({
  // Initial State
  personeller: [],
  loadingPersoneller: false,
  personelIslemler: [],
  loadingPersonelIslemler: false,

  // Personel Actions
  fetchPersoneller: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingPersoneller: true });

    try {
      const { data } = await personelService.fetchAll(restaurantId);
      set({ personeller: data || [], loadingPersoneller: false });
    } catch (error) {
      console.error("fetchPersoneller error:", error);
      set({ loadingPersoneller: false });
    }
  },

  addPersonel: async (personel) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant", data: null };
    }

    const { data, error } = await personelService.create({
      ...personel,
      restaurant_id: restaurantId,
    });

    if (!error) {
      get().fetchPersoneller();
    }

    return { error, data };
  },

  updatePersonel: async (id, updates) => {
    const { error } = await personelService.update(id, updates);

    if (!error) {
      get().fetchPersoneller();
    }

    return { error };
  },

  deletePersonel: async (id) => {
    const { error } = await personelService.archive(id);

    if (!error) {
      get().fetchPersoneller();
    }

    return { error };
  },

  // Personel İşlem Actions
  fetchPersonelIslemler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingPersonelIslemler: true });

    try {
      const { data } = await personelService.fetchIslemler(restaurantId);
      const { personeller, kasalar } = get();

      // Join işlemleri
      const islemlerWithJoins = (data || []).map((islem: PersonelIslem) => ({
        ...islem,
        personel: personeller.find((p: Personel) => p.id === islem.personel_id),
        kasa: kasalar.find((k: Kasa) => k.id === islem.kasa_id),
      }));

      set({
        personelIslemler: islemlerWithJoins,
        loadingPersonelIslemler: false,
      });
    } catch (error) {
      console.error("fetchPersonelIslemler error:", error);
      set({ loadingPersonelIslemler: false });
    }
  },

  addPersonelIslem: async (islem) => {
    const { profile } = get();
    const restaurantId = getRestaurantId(profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();
    if (!user) {
      return { error: "No user" };
    }

    // Ledger üzerinden işlem oluştur (balance'ları da günceller)
    const result = await ledger.createPersonelIslem({
      ...islem,
      restaurant_id: restaurantId,
      created_by: user.id,
    });

    if (result.success) {
      get().fetchPersonelIslemler();
      get().fetchKasalar();
      get().fetchPersoneller();
    }

    return { error: result.success ? null : result.error };
  },
});
