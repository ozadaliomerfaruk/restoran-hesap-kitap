/**
 * Activity Log Service
 * Kullanıcı aktivite takibi için
 */

import { supabase } from "../../lib/supabase";
import { ActivityLog } from "../../types";

export const activityLogService = {
  // Son aktiviteleri getir
  async fetchRecent(
    restaurantId: string,
    limit: number = 50
  ): Promise<{ data: ActivityLog[]; error: any }> {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*, user:profiles(*)")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  // Belirli bir tablodaki aktiviteleri getir
  async fetchByTable(
    restaurantId: string,
    tableName: string,
    limit: number = 50
  ): Promise<{ data: ActivityLog[]; error: any }> {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*, user:profiles(*)")
      .eq("restaurant_id", restaurantId)
      .eq("table_name", tableName)
      .order("created_at", { ascending: false })
      .limit(limit);

    return { data: data || [], error };
  },

  // Belirli bir kaydın geçmişini getir
  async fetchByRecordId(
    recordId: string
  ): Promise<{ data: ActivityLog[]; error: any }> {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*, user:profiles(*)")
      .eq("record_id", recordId)
      .order("created_at", { ascending: false });

    return { data: data || [], error };
  },

  // Aktivite logu oluştur
  async create(
    log: Partial<ActivityLog> & { restaurant_id: string; user_id: string }
  ): Promise<{ data: ActivityLog | null; error: any }> {
    const { data, error } = await supabase
      .from("activity_log")
      .insert(log)
      .select()
      .single();

    return { data, error };
  },

  // Yardımcı: Log oluşturma kısayolu
  async log(
    restaurantId: string,
    userId: string,
    action: "create" | "update" | "delete" | "archive",
    tableName: string,
    recordId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<{ error: any }> {
    const { error } = await supabase.from("activity_log").insert({
      restaurant_id: restaurantId,
      user_id: userId,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
    });

    return { error };
  },
};
