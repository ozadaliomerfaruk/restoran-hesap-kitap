/**
 * Taksit Service
 */

import { supabase } from "../../lib/supabase";
import { Taksit, TaksitOdemesi } from "../../types";

export const taksitService = {
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: Taksit[]; error: any }> {
    const { data, error } = await supabase
      .from("taksitler")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("next_payment_date", { ascending: true });

    return { data: data || [], error };
  },

  async fetchOdemeler(
    taksitId: string
  ): Promise<{ data: TaksitOdemesi[]; error: any }> {
    const { data, error } = await supabase
      .from("taksit_odemeleri")
      .select("*")
      .eq("taksit_id", taksitId)
      .order("installment_no", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    taksit: Partial<Taksit> & { restaurant_id: string }
  ): Promise<{ data: Taksit | null; error: any }> {
    const { data, error } = await supabase
      .from("taksitler")
      .insert({
        ...taksit,
        paid_count: 0,
        remaining_amount: (taksit as any).total_amount,
        is_completed: false,
      })
      .select()
      .single();

    return { data, error };
  },

  async createOdemeler(
    odemeler: Partial<TaksitOdemesi>[]
  ): Promise<{ error: any }> {
    const { error } = await supabase.from("taksit_odemeleri").insert(odemeler);

    return { error };
  },

  async update(id: string, updates: Partial<Taksit>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("taksitler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async payOdeme(odemesiId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("taksit_odemeleri")
      .update({
        is_paid: true,
        paid_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", odemesiId);

    return { error };
  },
};
