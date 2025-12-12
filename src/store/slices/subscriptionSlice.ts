/**
 * Subscription Slice
 *
 * Restoran abonelik bilgilerini yönetir.
 * Plan limitleri burada tutulur.
 */

import type { Subscription } from "../../types";
import type { StoreSlice } from "../types";
import { profileService } from "../../services/supabase";

// ============================================
// SLICE INTERFACE
// ============================================

export interface SubscriptionSlice {
  // State
  subscription: Subscription | null;
  loadingSubscription: boolean;

  // Actions
  fetchSubscription: () => Promise<void>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createSubscriptionSlice: StoreSlice<SubscriptionSlice> = (
  set,
  get
) => ({
  // Initial State
  subscription: null,
  loadingSubscription: false,

  // Actions
  fetchSubscription: async () => {
    const { profile } = get();

    if (!profile?.restaurant_id) {
      return;
    }

    set({ loadingSubscription: true });

    try {
      const { data } = await profileService.fetchSubscription(
        profile.restaurant_id
      );
      set({ subscription: data, loadingSubscription: false });
    } catch (error) {
      console.error("fetchSubscription error:", error);
      set({ subscription: null, loadingSubscription: false });
    }
  },
});
