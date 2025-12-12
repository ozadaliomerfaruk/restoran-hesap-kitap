/**
 * Islem Service
 */

import { supabase } from "../../lib/supabase";
import { Islem } from "../../types";

export const islemService = {
  async fetchAll(
    restaurantId: string,
    limit: number = 100
  ): Promise<{ data: Islem[]; error: any }> {
    const { data, error } = await supabase
      .from("islemler")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  async create(
    islem: Partial<Islem> & { restaurant_id: string; created_by: string }
  ): Promise<{ data: Islem | null; error: any }> {
    const { data, error } = await supabase
      .from("islemler")
      .insert(islem)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Islem>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("islemler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from("islemler").delete().eq("id", id);

    return { error };
  },
};
