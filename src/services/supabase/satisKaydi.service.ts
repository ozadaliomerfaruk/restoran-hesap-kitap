/**
 * Satış Kaydı Service
 */

import { supabase } from "../../lib/supabase";
import { SatisKaydi } from "../../types";

export const satisKaydiService = {
  async fetchAll(
    restaurantId: string,
    limit: number = 500
  ): Promise<{ data: SatisKaydi[]; error: any }> {
    const { data, error } = await supabase
      .from("satis_kayitlari")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  async create(
    kayit: Partial<SatisKaydi> & { restaurant_id: string }
  ): Promise<{ data: SatisKaydi | null; error: any }> {
    const { data, error } = await supabase
      .from("satis_kayitlari")
      .insert(kayit)
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<SatisKaydi>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("satis_kayitlari")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("satis_kayitlari")
      .delete()
      .eq("id", id);

    return { error };
  },
};
