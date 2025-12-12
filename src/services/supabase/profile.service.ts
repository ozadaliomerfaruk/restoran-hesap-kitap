/**
 * Profile & Subscription Service
 */

import { supabase } from "../../lib/supabase";
import { Profile, Subscription } from "../../types";

export const profileService = {
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
};
