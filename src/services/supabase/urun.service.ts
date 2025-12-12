/**
 * Ürün Service
 */

import { supabase } from "../../lib/supabase";
import { Urun } from "../../types";

export const urunService = {
  async fetchAll(restaurantId: string): Promise<{ data: Urun[]; error: any }> {
    const { data, error } = await supabase
      .from("urunler")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("name", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    urun: Partial<Urun> & { restaurant_id: string }
  ): Promise<{ data: Urun | null; error: any }> {
    const { data, error } = await supabase
      .from("urunler")
      .insert({
        ...urun,
        is_active: true,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Urun>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("urunler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },
};
