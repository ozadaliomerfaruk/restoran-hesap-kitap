/**
 * Personel Service
 */

import { supabase } from "../../lib/supabase";
import { Personel, PersonelIslem, Izin } from "../../types";

export const personelService = {
  // Personel
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: Personel[]; error: any }> {
    const { data, error } = await supabase
      .from("personel")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_archived", false)
      .order("name", { ascending: true });

    return { data: data || [], error };
  },

  async create(
    personel: Partial<Personel> & { restaurant_id: string }
  ): Promise<{ data: Personel | null; error: any }> {
    const { data, error } = await supabase
      .from("personel")
      .insert({
        ...personel,
        balance: 0,
        annual_leave_days: personel.annual_leave_days || 0,
        used_leave_days: 0,
      })
      .select()
      .single();

    return { data, error };
  },

  async update(
    id: string,
    updates: Partial<Personel>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("personel")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async archive(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("personel")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  async updateBalance(
    personelId: string,
    amount: number
  ): Promise<{ error: any }> {
    const { error } = await supabase.rpc("update_personel_balance", {
      personel_id: personelId,
      amount: amount,
    });

    return { error };
  },

  async updateUsedLeave(
    personelId: string,
    days: number
  ): Promise<{ error: any }> {
    const { error } = await supabase.rpc("update_personel_used_leave", {
      personel_id: personelId,
      days: days,
    });

    return { error };
  },

  // Personel İşlemleri
  async fetchIslemler(
    restaurantId: string,
    limit: number = 100
  ): Promise<{ data: PersonelIslem[]; error: any }> {
    // Önce işlemleri al
    const { data: islemler, error } = await supabase
      .from("personel_islemler")
      .select(
        `
        *,
        personel:personel(id, name),
        kasa:kasalar(id, name)
      `
      )
      .eq("restaurant_id", restaurantId)
      .order("date", { ascending: false })
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

  async createIslem(
    islem: Partial<PersonelIslem> & {
      restaurant_id: string;
      created_by: string;
    }
  ): Promise<{ data: PersonelIslem | null; error: any }> {
    const { data, error } = await supabase
      .from("personel_islemler")
      .insert(islem)
      .select()
      .single();

    return { data, error };
  },

  // İzinler
  async fetchIzinler(
    restaurantId: string,
    limit: number = 100
  ): Promise<{ data: Izin[]; error: any }> {
    const { data, error } = await supabase
      .from("izinler")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("start_date", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  async createIzin(
    izin: Partial<Izin> & { restaurant_id: string }
  ): Promise<{ data: Izin | null; error: any }> {
    const { data, error } = await supabase
      .from("izinler")
      .insert(izin)
      .select()
      .single();

    return { data, error };
  },

  async updateIzin(
    id: string,
    updates: Partial<Izin>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("izinler")
      .update(updates)
      .eq("id", id);

    return { error };
  },
};
