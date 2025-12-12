/**
 * Menu Item Service
 */

import { supabase } from "../../lib/supabase";
import { MenuItem, UrunKategorisi } from "../../types";

export const menuItemService = {
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: MenuItem[]; error: any }> {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    item: Partial<MenuItem> & { restaurant_id: string }
  ): Promise<{ data: MenuItem | null; error: any }> {
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        ...item,
        is_active: true,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<MenuItem>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("menu_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    return { error };
  },

  // Ürün Kategorileri
  async fetchKategoriler(
    restaurantId: string
  ): Promise<{ data: UrunKategorisi[]; error: any }> {
    const { data, error } = await supabase
      .from("urun_kategorileri")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    return { data: data || [], error };
  },

  async createKategori(
    restaurantId: string,
    name: string,
    sortOrder: number
  ): Promise<{ data: UrunKategorisi | null; error: any }> {
    const { data, error } = await supabase
      .from("urun_kategorileri")
      .insert({
        restaurant_id: restaurantId,
        name: name.trim(),
        sort_order: sortOrder,
      })
      .select()
      .single();

    return { data, error };
  },

  async deleteKategori(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("urun_kategorileri")
      .delete()
      .eq("id", id);

    return { error };
  },
};
