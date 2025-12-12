/**
 * Kasa Service
 */

import { supabase } from "../../lib/supabase";
import { Kasa } from "../../types";

export const kasaService = {
  async fetchAll(restaurantId: string): Promise<{ data: Kasa[]; error: any }> {
    const { data, error } = await supabase
      .from("kasalar")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    kasa: Partial<Kasa> & { restaurant_id: string }
  ): Promise<{ data: Kasa | null; error: any }> {
    const kasaData = kasa as any;
    const initialBalance = kasaData.initial_balance ?? 0;
    const { initial_balance, ...kasaWithoutInitialBalance } = kasaData;

    const { data, error } = await supabase
      .from("kasalar")
      .insert({
        ...kasaWithoutInitialBalance,
        balance: initialBalance,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Kasa>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("kasalar")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async archive(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("kasalar")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async updateBalance(kasaId: string, amount: number): Promise<{ error: any }> {
    const { error } = await supabase.rpc("update_kasa_balance", {
      kasa_id: kasaId,
      amount: amount,
    });

    return { error };
  },
};
