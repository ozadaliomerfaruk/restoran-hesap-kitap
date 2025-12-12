/**
 * Store Guards
 *
 * Tekrarlanan guard pattern'larını merkezi hale getirir.
 * Her slice bu helper'ları kullanarak boilerplate'i azaltır.
 */

import type { Profile } from "../../types";
import type { AppError } from "../types";

// ============================================
// GUARD RESULTS
// ============================================

interface ProfileGuardSuccess {
  profile: Profile;
  restaurantId: string;
}

interface UserGuardSuccess extends ProfileGuardSuccess {
  userId: string;
}

type GuardResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

// ============================================
// GUARD FUNCTIONS
// ============================================

/**
 * Profile ve restaurant_id kontrolü
 * Çoğu fetch işlemi için kullanılır
 */
export function requireProfile(
  profile: Profile | null
): GuardResult<ProfileGuardSuccess> {
  if (!profile) {
    return {
      success: false,
      error: {
        code: "NO_PROFILE",
        message: "Kullanıcı profili bulunamadı",
        source: "guard",
      },
    };
  }

  if (!profile.restaurant_id) {
    return {
      success: false,
      error: {
        code: "NO_RESTAURANT",
        message: "Restoran bilgisi bulunamadı",
        source: "guard",
      },
    };
  }

  return {
    success: true,
    data: {
      profile,
      restaurantId: profile.restaurant_id,
    },
  };
}

/**
 * Profile + User ID kontrolü
 * Create işlemleri için kullanılır (created_by alanı gerektiğinde)
 */
export async function requireUser(
  profile: Profile | null,
  getCurrentUser: () => Promise<{ id: string } | null>
): Promise<GuardResult<UserGuardSuccess>> {
  const profileCheck = requireProfile(profile);

  if (!profileCheck.success) {
    return profileCheck;
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      error: {
        code: "NO_USER",
        message: "Kullanıcı oturumu bulunamadı",
        source: "guard",
      },
    };
  }

  return {
    success: true,
    data: {
      ...profileCheck.data,
      userId: user.id,
    },
  };
}

/**
 * Sadece restaurant_id döndüren basit guard
 * Hızlı kontrol için
 */
export function getRestaurantId(profile: Profile | null): string | null {
  return profile?.restaurant_id ?? null;
}
