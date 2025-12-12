/**
 * Günlük Satış Detay Service
 * Satış kalemlerini yönetmek için
 */

import { supabase } from "../../lib/supabase";
import { GunlukSatisDetay } from "../../types";

export const gunlukSatisDetayService = {
  // Bir günlük satışa ait detayları getir
  async fetchBySatisId(
    gunlukSatisId: string
  ): Promise<{ data: GunlukSatisDetay[]; error: any }> {
    const { data, error } = await supabase
      .from("gunluk_satis_detay")
      .select("*, menu_item:menu_items(*)")
      .eq("gunluk_satis_id", gunlukSatisId)
      .order("created_at", { ascending: true });

    return { data: data || [], error };
  },

  // Toplu detay ekleme
  async createBatch(
    detaylar: Partial<GunlukSatisDetay>[]
  ): Promise<{ data: GunlukSatisDetay[] | null; error: any }> {
    const { data, error } = await supabase
      .from("gunluk_satis_detay")
      .insert(detaylar)
      .select();

    return { data, error };
  },

  // Tek detay ekleme
  async create(
    detay: Partial<GunlukSatisDetay>
  ): Promise<{ data: GunlukSatisDetay | null; error: any }> {
    const { data, error } = await supabase
      .from("gunluk_satis_detay")
      .insert(detay)
      .select()
      .single();

    return { data, error };
  },

  // Detay güncelleme
  async update(
    id: string,
    updates: Partial<GunlukSatisDetay>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("gunluk_satis_detay")
      .update(updates)
      .eq("id", id);

    return { error };
  },

  // Detay silme
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("gunluk_satis_detay")
      .delete()
      .eq("id", id);

    return { error };
  },
};
