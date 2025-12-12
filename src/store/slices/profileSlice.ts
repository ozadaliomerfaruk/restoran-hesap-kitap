/**
 * Profile Slice
 *
 * Kullanıcı profil bilgilerini yönetir.
 * Tüm diğer slice'lar profile.restaurant_id'ye bağımlıdır.
 */

import type { Profile } from "../../types";
import type { StoreSlice } from "../types";
import { profileService } from "../../services/supabase";

// ============================================
// SLICE INTERFACE
// ============================================

export interface ProfileSlice {
  // State
  profile: Profile | null;
  loadingProfile: boolean;

  // Actions
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createProfileSlice: StoreSlice<ProfileSlice> = (set) => ({
  // Initial State
  profile: null,
  loadingProfile: false,

  // Actions
  fetchProfile: async () => {
    set({ loadingProfile: true });

    try {
      const { data } = await profileService.fetchProfile();
      set({ profile: data, loadingProfile: false });
    } catch (error) {
      console.error("fetchProfile error:", error);
      set({ profile: null, loadingProfile: false });
    }
  },

  clearProfile: () => {
    set({ profile: null });
  },
});
