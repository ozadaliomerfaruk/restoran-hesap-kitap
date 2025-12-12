/**
 * Günlük Satış Service
 */

import { supabase } from "../../lib/supabase";
import { GunlukSatis } from "../../types";

export const gunlukSatisService = {
  async fetchAll(
    restaurantId: string,
    limit: number = 30
  ): Promise<{ data: GunlukSatis[]; error: any }> {
    const { data, error } = await supabase
      .from("gunluk_satis")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("date", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  async create(
    satis: Partial<GunlukSatis> & { restaurant_id: string; created_by: string }
  ): Promise<{ data: GunlukSatis | null; error: any }> {
    const total_amount =
      ((satis as any).cash_amount || 0) +
      ((satis as any).card_amount || 0) +
      ((satis as any).online_amount || 0);

    const { data, error } = await supabase
      .from("gunluk_satis")
      .insert({
        ...satis,
        total_amount,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<GunlukSatis>,
    currentSatis?: GunlukSatis
  ): Promise<{ error: any }> {
    let total_amount;
    if (
      updates.cash_amount !== undefined ||
      updates.card_amount !== undefined ||
      updates.online_amount !== undefined
    ) {
      if (currentSatis) {
        total_amount =
          (updates.cash_amount ?? currentSatis.cash_amount) +
          (updates.card_amount ?? currentSatis.card_amount) +
          (updates.online_amount ?? currentSatis.online_amount);
      }
    }

    const { error } = await supabase
      .from("gunluk_satis")
      .update({
        ...updates,
        ...(total_amount !== undefined && { total_amount }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return { error };
  },
};
