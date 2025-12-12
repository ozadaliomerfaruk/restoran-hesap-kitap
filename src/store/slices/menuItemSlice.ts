/**
 * Menü Item Slice
 *
 * Restoran menü öğelerini yönetir.
 */

import type { MenuItem } from "../../types";
import type { StoreSlice } from "../types";
import { menuItemService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";

// ============================================
// SLICE INTERFACE
// ============================================

export interface MenuItemSlice {
  // State
  menuItems: MenuItem[];
  loadingMenuItems: boolean;

  // Actions
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (
    item: Omit<MenuItem, "id" | "created_at" | "updated_at">
  ) => Promise<{ error: any }>;
  updateMenuItem: (
    id: string,
    updates: Partial<MenuItem>
  ) => Promise<{ error: any }>;
  deleteMenuItem: (id: string) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createMenuItemSlice: StoreSlice<MenuItemSlice> = (set, get) => ({
  // Initial State
  menuItems: [],
  loadingMenuItems: false,

  // Actions
  fetchMenuItems: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingMenuItems: true });

    try {
      const { data } = await menuItemService.fetchAll(restaurantId);
      set({ menuItems: data || [], loadingMenuItems: false });
    } catch (error) {
      console.error("fetchMenuItems error:", error);
      set({ loadingMenuItems: false });
    }
  },

  addMenuItem: async (item) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const { error } = await menuItemService.create({
      ...item,
      restaurant_id: restaurantId,
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
});
