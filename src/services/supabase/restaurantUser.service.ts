/**
 * Restaurant User Service
 * Kullanıcı yönetimi işlemleri
 */

import { supabase } from "../../lib/supabase";
import { RestaurantUser, UserPermissions } from "../../types";

export const restaurantUserService = {
  // Tüm kullanıcıları getir
  async fetchAll(
    restaurantId: string
  ): Promise<{ data: RestaurantUser[]; error: any }> {
    // Önce restaurant_users'ı al
    const { data: users, error } = await supabase
      .from("restaurant_users")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (error || !users) {
      return { data: [], error };
    }

    // Sonra profiles'ı ayrı al
    const userIds = users.map((u) => u.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email, phone")
      .in("id", userIds);

    // Manuel join
    const usersWithProfiles = users.map((user) => ({
      ...user,
      user: profiles?.find((p) => p.id === user.user_id) || null,
    }));

    return { data: usersWithProfiles, error: null };
  },

  // Tek kullanıcı getir
  async fetchOne(
    id: string
  ): Promise<{ data: RestaurantUser | null; error: any }> {
    const { data: user, error } = await supabase
      .from("restaurant_users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return { data: null, error };
    }

    // Profile'ı ayrı al
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, phone")
      .eq("id", user.user_id)
      .single();

    return {
      data: { ...user, user: profile },
      error: null,
    };
  },

  // Kullanıcı güncelle
  async update(
    id: string,
    updates: Partial<Pick<RestaurantUser, "role" | "permissions" | "is_active">>
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from("restaurant_users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return { error };
  },

  // Kullanıcı davet et (email ile)
  async invite(
    restaurantId: string,
    email: string,
    role: RestaurantUser["role"],
    permissions: UserPermissions
  ): Promise<{ error: any }> {
    // Önce kullanıcıyı email ile bul
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      return { error: "Bu e-posta ile kayıtlı kullanıcı bulunamadı" };
    }

    // Zaten ekli mi kontrol et
    const { data: existing } = await supabase
      .from("restaurant_users")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("user_id", profile.id)
      .single();

    if (existing) {
      return { error: "Bu kullanıcı zaten ekli" };
    }

    // Kullanıcıyı ekle
    const { error } = await supabase.from("restaurant_users").insert({
      restaurant_id: restaurantId,
      user_id: profile.id,
      role,
      permissions,
      is_active: true,
    });

    return { error };
  },

  // Kullanıcı erişimini kaldır (soft delete)
  async remove(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("restaurant_users")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    return { error };
  },

  // Kullanıcıyı tamamen sil (hard delete)
  async delete(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from("restaurant_users")
      .delete()
      .eq("id", id);

    return { error };
  },
};
