/**
 * Kategori Service
 */

import { supabase } from "../../lib/supabase";
import { Kategori } from "../../types";

export const kategoriService = {
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: Kategori[]; error: any }> {
    const { data, error } = await supabase
      .from("kategoriler")
      .select("*")
      .or(`restaurant_id.eq.${restaurantId},is_default.eq.true`)
      .order("name", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    kategori: Partial<Kategori> & { restaurant_id: string }
  ): Promise<{ data: Kategori | null; error: any }> {
    const { data, error } = await supabase
      .from("kategoriler")
      .insert({
        ...kategori,
        is_default: false,
      })
      .select()
      .single();

    return { data, error };
  },
};
