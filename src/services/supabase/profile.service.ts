/**
 * Profile & Subscription Service
 */

import { supabase } from "../../lib/supabase";
import { Profile, Subscription } from "../../types";

export const profileService = {
  // Mevcut metodlar
  async fetchProfile(): Promise<{ data: Profile | null; error: any }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "No user" };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return { data, error };
  },

  async fetchSubscription(
    restaurantId: string
  ): Promise<{ data: Subscription | null; error: any }> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .single();

    return { data, error };
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  // YENİ: Profil güncelleme
  async updateProfile(
    updates: Partial<Pick<Profile, "name" | "phone">>
  ): Promise<{ error: any }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No user" };

    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return { error };
  },

  // YENİ: Şifre değiştirme
  async changePassword(newPassword: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  },

  // YENİ: Email güncelleme (opsiyonel - doğrulama gerektirir)
  async updateEmail(newEmail: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    return { error };
  },
};
