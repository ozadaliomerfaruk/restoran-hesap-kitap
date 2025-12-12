/**
 * Anımsatıcı Service
 */

import { supabase } from "../../lib/supabase";
import { Animsatici } from "../../types";

export const animsaticiService = {
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: Animsatici[]; error: any }> {
    const { data, error } = await supabase
      .from("animsaticilar")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_completed", false)
      .order("due_date", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    animsatici: Partial<Animsatici> & { restaurant_id: string }
  ): Promise<{ data: Animsatici | null; error: any }> {
    const { data, error } = await supabase
      .from("animsaticilar")
      .insert({
        ...animsatici,
        is_completed: false,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<Animsatici>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("animsaticilar")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async complete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("animsaticilar")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return { error };
  },
};
