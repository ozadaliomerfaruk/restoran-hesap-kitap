/**
 * İşlem Slice
 */

import { StateCreator } from "zustand";
import { Islem, Profile, Kasa, Cari, Kategori } from "../../types";
import {
  islemService,
  kasaService,
  cariService,
  profileService,
} from "../../services/supabase";

export interface IslemSlice {
  // State
  islemler: Islem[];
  loadingIslemler: boolean;

  // Actions
  fetchIslemler: (limit?: number) => Promise<void>;
  addIslem: (
    islem: Omit<
      Islem,
      "id" | "created_at" | "updated_at" | "created_by" | "restaurant_id"
    >
  ) => Promise<{ error: any }>;
  updateIslem: (id: string, updates: Partial<Islem>) => Promise<{ error: any }>;
  deleteIslem: (id: string) => Promise<{ error: any }>;
}

type IslemSliceState = IslemSlice & {
  profile: Profile | null;
  kasalar: Kasa[];
  cariler: Cari[];
  kategoriler: Kategori[];
  fetchKasalar: () => Promise<void>;
  fetchCariler: () => Promise<void>;
};

export const createIslemSlice: StateCreator<
  IslemSliceState,
  [],
  [],
  IslemSlice
> = (set, get) => ({
  // State
  islemler: [],
  loadingIslemler: false,

  // Actions
  fetchIslemler: async (limit = 100) => {
    set({ loadingIslemler: true });
    const { profile, kasalar, cariler, kategoriler } = get();

    if (profile?.restaurant_id) {
      const { data } = await islemService.fetchAll(
        profile.restaurant_id,
        limit
      );

      // Manual join
      const islemlerWithJoins = data.map((islem: Islem) => ({
        ...islem,
        kasa: kasalar.find((k) => k.id === islem.kasa_id),
        kasa_hedef: kasalar.find((k) => k.id === islem.kasa_hedef_id),
        cari: cariler.find((c) => c.id === islem.cari_id),
        kategori: kategoriler.find((k) => k.id === islem.kategori_id),
      }));

      set({ islemler: islemlerWithJoins });
    }
    set({ loadingIslemler: false });
  },

  addIslem: async (islem) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();
    if (!user) return { error: "No user" };

    const { error } = await islemService.create({
      ...islem,
      restaurant_id: profile.restaurant_id,
      created_by: user.id,
    });

    if (!error) {
      // Kasa bakiyesi güncelle
      if (islem.kasa_id && islem.type !== "transfer") {
        let kasaMultiplier = 0;
        if (islem.type === "gelir" || islem.type === "tahsilat") {
          kasaMultiplier = 1;
        } else if (islem.type === "gider" || islem.type === "odeme") {
          kasaMultiplier = -1;
        }

        if (kasaMultiplier !== 0) {
          await kasaService.updateBalance(
            islem.kasa_id,
            islem.amount * kasaMultiplier
          );
        }
      }

      // Cari bakiyesi güncelle
      if (islem.cari_id) {
        const { type: cariType } = await cariService.getType(islem.cari_id);
        let cariMultiplier = 0;

        if (islem.type === "gider") cariMultiplier = 1;
        else if (islem.type === "satis") cariMultiplier = 1;
        else if (islem.type === "iade") cariMultiplier = -1;
        else if (islem.type === "musteri_iade") cariMultiplier = -1;
        else if (islem.type === "gelir") cariMultiplier = -1;
        else if (islem.type === "odeme")
          cariMultiplier = cariType === "tedarikci" ? -1 : 1;
        else if (islem.type === "tahsilat")
          cariMultiplier = cariType === "tedarikci" ? 1 : -1;

        if (cariMultiplier !== 0) {
          await cariService.updateBalance(
            islem.cari_id,
            islem.amount * cariMultiplier
          );
        }
      }

      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  updateIslem: async (id, updates) => {
    const { error } = await islemService.update(id, updates);
    if (!error) {
      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },

  deleteIslem: async (id) => {
    const { islemler } = get();
    const islem = islemler.find((i) => i.id === id);

    const { error } = await islemService.delete(id);

    if (!error && islem) {
      // Kasa bakiyesini geri al
      if (islem.kasa_id && islem.type !== "transfer") {
        let kasaMultiplier = 0;
        if (islem.type === "gelir" || islem.type === "tahsilat")
          kasaMultiplier = -1;
        else if (islem.type === "gider" || islem.type === "odeme")
          kasaMultiplier = 1;

        if (kasaMultiplier !== 0) {
          await kasaService.updateBalance(
            islem.kasa_id,
            islem.amount * kasaMultiplier
          );
        }
      }

      // Cari bakiyesini geri al
      if (islem.cari_id) {
        const { type: cariType } = await cariService.getType(islem.cari_id);
        let cariMultiplier = 0;

        if (islem.type === "gider") cariMultiplier = -1;
        else if (islem.type === "satis") cariMultiplier = -1;
        else if (islem.type === "iade") cariMultiplier = 1;
        else if (islem.type === "musteri_iade") cariMultiplier = 1;
        else if (islem.type === "gelir") cariMultiplier = 1;
        else if (islem.type === "odeme")
          cariMultiplier = cariType === "tedarikci" ? 1 : -1;
        else if (islem.type === "tahsilat")
          cariMultiplier = cariType === "tedarikci" ? -1 : 1;

        if (cariMultiplier !== 0) {
          await cariService.updateBalance(
            islem.cari_id,
            islem.amount * cariMultiplier
          );
        }
      }

      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }
    return { error };
  },
});
