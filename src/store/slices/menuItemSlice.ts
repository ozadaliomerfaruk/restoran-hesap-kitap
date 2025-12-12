/**
 * Menu Item & Ürün Kategorileri Slice
 */

import { StateCreator } from "zustand";
import { MenuItem, UrunKategorisi, Profile } from "../../types";
import { menuItemService } from "../../services/supabase";

export interface MenuItemSlice {
  // State
  menuItems: MenuItem[];
  loadingMenuItems: boolean;
  urunKategorileri: UrunKategorisi[];
  loadingUrunKategorileri: boolean;

  // Actions
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (
    item: Omit<
      MenuItem,
      "id" | "restaurant_id" | "created_at" | "updated_at"
    > & { category?: string }
  ) => Promise<{ error: any }>;
  updateMenuItem: (
    id: string,
    updates: Partial<MenuItem>
  ) => Promise<{ error: any }>;
  deleteMenuItem: (id: string) => Promise<{ error: any }>;
  fetchUrunKategorileri: () => Promise<void>;
  addUrunKategorisi: (name: string) => Promise<{ error: any }>;
  deleteUrunKategorisi: (id: string) => Promise<{ error: any }>;
}

type MenuItemSliceState = MenuItemSlice & { profile: Profile | null };

export const createMenuItemSlice: StateCreator<
  MenuItemSliceState,
  [],
  [],
  MenuItemSlice
> = (set, get) => ({
  // State
  menuItems: [],
  loadingMenuItems: false,
  urunKategorileri: [],
  loadingUrunKategorileri: false,

  // Actions
  fetchMenuItems: async () => {
    set({ loadingMenuItems: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await menuItemService.fetchAll(profile.restaurant_id);
      set({ menuItems: data });
    }
    set({ loadingMenuItems: false });
  },

  addMenuItem: async (item) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const { error } = await menuItemService.create({
      ...item,
      restaurant_id: profile.restaurant_id,
    });

    if (!error) {
      get().fetchMenuItems();
    }
    return { error };
  },

  updateMenuItem: async (id, updates) => {
    const { error } = await menuItemService.update(id, updates);
    if (!error) {
      get().fetchMenuItems();
    }
    return { error };
  },

  deleteMenuItem: async (id) => {
    const { error } = await menuItemService.delete(id);
    if (!error) {
      get().fetchMenuItems();
    }
    return { error };
  },

  fetchUrunKategorileri: async () => {
    set({ loadingUrunKategorileri: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await menuItemService.fetchKategoriler(
        profile.restaurant_id
      );
      set({ urunKategorileri: data });
    }
    set({ loadingUrunKategorileri: false });
  },

  addUrunKategorisi: async (name) => {
    const { profile, urunKategorileri } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const maxOrder = urunKategorileri.reduce(
      (max, k) => Math.max(max, k.sort_order || 0),
      0
    );

    const { error } = await menuItemService.createKategori(
      profile.restaurant_id,
      name,
      maxOrder + 1
    );

    if (!error) {
      get().fetchUrunKategorileri();
    }
    return { error };
  },

  deleteUrunKategorisi: async (id) => {
    const { error } = await menuItemService.deleteKategori(id);
    if (!error) {
      get().fetchUrunKategorileri();
    }
    return { error };
  },
});
