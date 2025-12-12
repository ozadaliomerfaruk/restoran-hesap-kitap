/**
 * Cari Service
 */

import { supabase } from "../../lib/supabase";
import { Cari } from "../../types";

export const cariService = {
  async fetchAll(restaurantId: string): Promise<{ data: Cari[]; error: any }> {
    const { data, error } = await supabase
      .from("cariler")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_archived", false)
      .order("name", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    cari: Partial<Cari> & { restaurant_id: string }
  ): Promise<{ data: Cari | null; error: any }> {
    const { data, error } = await supabase
      .from("cariler")
      .insert({
        ...cari,
        balance: (cari as any).initial_balance || 0,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Cari>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("cariler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async archive(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("cariler")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async updateBalance(cariId: string, amount: number): Promise<{ error: any }> {
    const { error } = await supabase.rpc("update_cari_balance", {
      cari_id: cariId,
      amount: amount,
    });

    return { error };
  },

  async getType(cariId: string): Promise<{ type: string | null; error: any }> {
    const { data, error } = await supabase
      .from("cariler")
      .select("type")
      .eq("id", cariId)
      .single();

    return { type: data?.type || null, error };
  },
};
