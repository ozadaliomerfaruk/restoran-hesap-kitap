/**
 * Store Type Definitions
 *
 * Tüm store slice'ları için ortak tipler.
 */

import { StateCreator } from "zustand";

// ============================================
// ERROR HANDLING
// ============================================

export interface AppError {
  code: string;
  message: string;
  source?: string;
  details?: unknown;
}

export type Result<T> =
  | { data: T; error?: never }
  | { data?: never; error: AppError };

// ============================================
// STORE SLICE TYPE
// ============================================

/**
 * Generic Slice Creator Type
 *
 * Her slice bu pattern'ı kullanır:
 * export const createXSlice: StoreSlice<XSlice> = (set, get) => ({...})
 *
 * NOT: StoreState tüm slice'lar tamamlandıktan sonra useStore.ts'de tanımlanacak.
 * Şimdilik 'any' kullanıyoruz, final aşamada düzeltilecek.
 */
export type StoreSlice<T> = StateCreator<any, [], [], T>;
