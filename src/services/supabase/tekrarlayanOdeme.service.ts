/**
 * Tekrarlayan Ödeme Service
 */

import { supabase } from "../../lib/supabase";
import { TekrarlayanOdeme } from "../../types";

export const tekrarlayanOdemeService = {
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: TekrarlayanOdeme[]; error: any }> {
    const { data, error } = await supabase
      .from("tekrarlayan_odemeler")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("next_date", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    odeme: Partial<TekrarlayanOdeme> & { restaurant_id: string }
  ): Promise<{ data: TekrarlayanOdeme | null; error: any }> {
    const { data, error } = await supabase
      .from("tekrarlayan_odemeler")
      .insert(odeme)
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<TekrarlayanOdeme>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("tekrarlayan_odemeler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async deactivate(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("tekrarlayan_odemeler")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },
};
