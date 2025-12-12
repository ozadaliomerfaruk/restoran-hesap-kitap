/**
 * Profile & Subscription Slice
 */

import { StateCreator } from "zustand";
import { Profile, Subscription } from "../../types";
import { profileService } from "../../services/supabase";

export interface ProfileSlice {
  // State
  profile: Profile | null;
  loadingProfile: boolean;
  subscription: Subscription | null;
  loadingSubscription: boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
}

export const createProfileSlice: StateCreator<
  ProfileSlice & { profile: Profile | null }
> = (set, get) => ({
  // State
  profile: null,
  loadingProfile: false,
  subscription: null,
  loadingSubscription: false,

  // Actions
  fetchProfile: async () => {
    set({ loadingProfile: true });
    const { data } = await profileService.fetchProfile();
    set({ profile: data, loadingProfile: false });
  },

  fetchSubscription: async () => {
    set({ loadingSubscription: true });
    const { profile } = get();
    if (profile?.restaurant_id) {
      const { data } = await profileService.fetchSubscription(
        profile.restaurant_id
      );
      set({ subscription: data });
    }
    set({ loadingSubscription: false });
  },
});
