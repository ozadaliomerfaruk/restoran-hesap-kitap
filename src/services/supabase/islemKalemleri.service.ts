/**
 * İşlem Kalemleri Service
 * Kalemli fatura desteği için
 */

import { supabase } from "../../lib/supabase";
import { IslemKalemi } from "../../types";

export const islemKalemleriService = {
  // Bir işleme ait tüm kalemleri getir
  async fetchByIslemId(
    islemId: string
  ): Promise<{ data: IslemKalemi[]; error: any }> {
    const { data, error } = await supabase
      .from("islem_kalemleri")
      .select("*, urun:urunler(*), kategori:kategoriler(*)")
      .eq("islem_id", islemId)
      .order("created_at", { ascending: true });

    return { data: data || [], error };
  },

  // Toplu kalem ekleme
  async createBatch(
    kalemler: Partial<IslemKalemi>[]
  ): Promise<{ data: IslemKalemi[] | null; error: any }> {
    const { data, error } = await supabase
      .from("islem_kalemleri")
      .insert(kalemler)
      .select();

    return { data, error };
  },

  // Tek kalem ekleme
  async create(
    kalem: Partial<IslemKalemi>
  ): Promise<{ data: IslemKalemi | null; error: any }> {
    const { data, error } = await supabase
      .from("islem_kalemleri")
      .insert(kalem)
      .select()
      .single();

    return { data, error };
  },

  // Kalem güncelleme
  async update(
    id: string,
    updates: Partial<IslemKalemi>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("islem_kalemleri")
      .update(updates)
      .eq("id", id);

    return { error };
  },

  // Kalem silme
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("islem_kalemleri")
      .delete()
      .eq("id", id);

    return { error };
  },

  // İşleme ait tüm kalemleri sil
  async deleteByIslemId(islemId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("islem_kalemleri")
      .delete()
      .eq("islem_id", islemId);

    return { error };
  },
};
