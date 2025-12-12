/**
 * Personel Slice
 */

import { StateCreator } from "zustand";
import { Personel, PersonelIslem, Izin, Profile, Kasa } from "../../types";
import {
  personelService,
  kasaService,
  profileService,
} from "../../services/supabase";

export interface PersonelSlice {
  // State
  personeller: Personel[];
  loadingPersoneller: boolean;
  personelIslemler: PersonelIslem[];
  loadingPersonelIslemler: boolean;
  izinler: Izin[];
  loadingIzinler: boolean;

  // Actions
  fetchPersoneller: () => Promise<void>;
  addPersonel: (
    personel: Omit<Personel, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any; data: Personel | null }>;
  updatePersonel: (
    id: string,
    updates: Partial<Personel>
  ) => Promise<{ error: any }>;
  deletePersonel: (id: string) => Promise<{ error: any }>;
  fetchPersonelIslemler: () => Promise<void>;
  addPersonelIslem: (
    islem: Omit<PersonelIslem, "id" | "created_at" | "created_by">
  ) => Promise<{ error: any }>;
  fetchIzinler: () => Promise<void>;
  addIzin: (izin: Omit<Izin, "id" | "created_at">) => Promise<{ error: any }>;
  updateIzin: (id: string, updates: Partial<Izin>) => Promise<{ error: any }>;
}

type PersonelSliceState = PersonelSlice & {
  profile: Profile | null;
  kasalar: Kasa[];
  fetchKasalar: () => Promise<void>;
};

export const createPersonelSlice: StateCreator<
  PersonelSliceState,
  [],
  [],
  PersonelSlice
> = (set, get) => ({
  // State
  personeller: [],
  loadingPersoneller: false,
  personelIslemler: [],
  loadingPersonelIslemler: false,
  izinler: [],
  loadingIzinler: false,

  // Actions
  fetchPersoneller: async () => {
    set({ loadingPersoneller: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await personelService.fetchAll(profile.restaurant_id);
      set({ personeller: data });
    }
    set({ loadingPersoneller: false });
  },

  addPersonel: async (personel) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant", data: null };

    const { data, error } = await personelService.create({
      ...personel,
      restaurant_id: profile.restaurant_id,
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

  fetchPersonelIslemler: async () => {
    set({ loadingPersonelIslemler: true });
    const { profile, personeller, kasalar } = get();
    if (profile?.restaurant_id) {
      const { data } = await personelService.fetchIslemler(
        profile.restaurant_id
      );

      const islemlerWithJoins = data.map((islem: PersonelIslem) => ({
        ...islem,
        personel: personeller.find((p) => p.id === islem.personel_id),
        kasa: kasalar.find((k) => k.id === islem.kasa_id),
      }));

      set({ personelIslemler: islemlerWithJoins });
    }
    set({ loadingPersonelIslemler: false });
  },

  addPersonelIslem: async (islem) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await personelService.createIslem({
      ...islem,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      // Kasa güncelle - sadece ödeme için çıkış
      if (islem.kasa_id && islem.type === "odeme") {
        await kasaService.updateBalance(islem.kasa_id, -islem.amount);
      }
      // Kasa güncelle - kesinti için giriş
      if (islem.kasa_id && islem.type === "kesinti") {
        await kasaService.updateBalance(islem.kasa_id, islem.amount);
      }

      // Personel bakiyesi güncelle
      let balanceChange = 0;
      if (
        ["maas", "prim", "mesai", "tazminat", "komisyon", "diger"].includes(
          islem.type
        )
      ) {
        balanceChange = islem.amount;
      } else if (islem.type === "avans") {
        balanceChange = -islem.amount;
      } else if (islem.type === "odeme" || islem.type === "kesinti") {
        balanceChange = -islem.amount;
      }

      if (balanceChange !== 0) {
        await personelService.updateBalance(islem.personel_id, balanceChange);
      }

      get().fetchPersonelIslemler();
      get().fetchKasalar();
      get().fetchPersoneller();
    }
    return { error };
  },

  fetchIzinler: async () => {
    set({ loadingIzinler: true });
    const { profile, personeller } = get();
    if (profile?.restaurant_id) {
      const { data } = await personelService.fetchIzinler(
        profile.restaurant_id
      );

      const izinlerWithJoins = data.map((izin: Izin) => ({
        ...izin,
        personel: personeller.find((p) => p.id === izin.personel_id),
      }));

      set({ izinler: izinlerWithJoins });
    }
    set({ loadingIzinler: false });
  },

  addIzin: async (izin) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await personelService.createIzin({
      ...izin,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) {
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
