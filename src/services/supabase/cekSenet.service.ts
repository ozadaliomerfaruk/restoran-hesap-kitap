/**
 * Çek/Senet Service
 */

import { supabase } from "../../lib/supabase";
import { CekSenet } from "../../types";

export const cekSenetService = {
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: CekSenet[]; error: any }> {
    const { data, error } = await supabase
      .from("cek_senet")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("due_date", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    cekSenet: Partial<CekSenet> & { restaurant_id: string }
  ): Promise<{ data: CekSenet | null; error: any }> {
    const { data, error } = await supabase
      .from("cek_senet")
      .insert(cekSenet)
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<CekSenet>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("cek_senet")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from("cek_senet").delete().eq("id", id);

    return { error };
  },
};
