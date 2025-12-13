/**
 * Islem Service
 */

import { supabase } from "../../lib/supabase";
import { Islem } from "../../types";

export const islemService = {
  async fetchAll(
    restaurantId: string,
    limit: number = 100
  ): Promise<{ data: Islem[]; error: any }> {
    // Önce işlemleri al
    const { data: islemler, error } = await supabase
      .from("islemler")
      .select(
        `
        *,
        kasa:kasalar!islemler_kasa_id_fkey(id, name, type),
        cari:cariler(id, name, type),
        kategori:kategoriler(id, name, type)
      `
      )
      .eq("restaurant_id", restaurantId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !islemler) {
      return { data: [], error };
    }

    // created_by user'ları ayrı sorgula
    const createdByIds = [
      ...new Set(islemler.map((i) => i.created_by).filter(Boolean)),
    ];

    let profilesMap: Record<
      string,
      { id: string; name?: string; email?: string }
    > = {};

    if (createdByIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", createdByIds);

      if (profiles) {
        profiles.forEach((p) => {
          profilesMap[p.id] = p;
        });
      }
    }

    // İşlemlere created_by_user ekle
    const islemlerWithUser = islemler.map((islem) => ({
      ...islem,
      created_by_user: islem.created_by
        ? profilesMap[islem.created_by]
        : undefined,
    }));

    return { data: islemlerWithUser, error: null };
  },

  async create(
    islem: Partial<Islem> & { restaurant_id: string; created_by: string }
  ): Promise<{ data: Islem | null; error: any }> {
    const { data, error } = await supabase
      .from("islemler")
      .insert(islem)
      .select()
      .single();

    return { data, error };
  },

  async update(id: string, updates: Partial<Islem>): Promise<{ error: any }> {
    const { error } = await supabase
      .from("islemler")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase.from("islemler").delete().eq("id", id);

    return { error };
  },
};
