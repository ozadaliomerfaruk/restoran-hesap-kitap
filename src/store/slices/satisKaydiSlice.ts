/**
 * Satış Kaydı Slice
 */

import { StateCreator } from "zustand";
import { SatisKaydi, Profile, MenuItem } from "../../types";
import { satisKaydiService, profileService } from "../../services/supabase";

export interface SatisKaydiSlice {
  // State
  satisKayitlari: SatisKaydi[];
  loadingSatisKayitlari: boolean;

  // Actions
  fetchSatisKayitlari: (limit?: number) => Promise<void>;
  addSatisKaydi: (
    kayit: Omit<
      SatisKaydi,
      | "id"
      | "restaurant_id"
      | "created_at"
      | "updated_at"
      | "created_by"
      | "total_price"
      | "menu_item"
    >
  ) => Promise<{ error: any }>;
  updateSatisKaydi: (
    id: string,
    updates: Partial<SatisKaydi>
  ) => Promise<{ error: any }>;
  deleteSatisKaydi: (id: string) => Promise<{ error: any }>;
}

type SatisKaydiSliceState = SatisKaydiSlice & {
  profile: Profile | null;
  menuItems: MenuItem[];
};

export const createSatisKaydiSlice: StateCreator<
  SatisKaydiSliceState,
  [],
  [],
  SatisKaydiSlice
> = (set, get) => ({
  // State
  satisKayitlari: [],
  loadingSatisKayitlari: false,

  // Actions
  fetchSatisKayitlari: async (limit = 500) => {
    set({ loadingSatisKayitlari: true });
    const { profile, menuItems } = get();
    if (profile?.restaurant_id) {
      const { data } = await satisKaydiService.fetchAll(
        profile.restaurant_id,
        limit
      );

      const kayitlarWithJoins = data.map((kayit: SatisKaydi) => ({
        ...kayit,
        menu_item: menuItems.find((m) => m.id === kayit.menu_item_id),
      }));

      set({ satisKayitlari: kayitlarWithJoins });
    }
    set({ loadingSatisKayitlari: false });
  },

  addSatisKaydi: async (kayit) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { error } = await satisKaydiService.create({
      ...kayit,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error) {
      get().fetchSatisKayitlari();
    }
    return { error };
  },

  updateSatisKaydi: async (id, updates) => {
    const { error } = await satisKaydiService.update(id, updates);
    if (!error) {
      get().fetchSatisKayitlari();
    }
    return { error };
  },

  deleteSatisKaydi: async (id) => {
    const { error } = await satisKaydiService.delete(id);
    if (!error) {
      get().fetchSatisKayitlari();
    }
    return { error };
  },
});
