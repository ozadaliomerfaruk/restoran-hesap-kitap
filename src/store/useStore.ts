/**
 * Zustand Store - Composition
 *
 * Tüm slice'ları birleştirir ve tek bir store oluşturur.
 *
 * REFACTOR NOTES:
 * - Eski monolitik useStore.ts 1280+ satırdı
 * - Şimdi her slice kendi dosyasında (~50-120 satır)
 * - Bu dosya sadece composition yapıyor (~80 satır)
 *
 * MIGRATION:
 * - Tüm import'lar aynı kalıyor: import { useStore } from '@/store/useStore'
 * - API değişikliği yok, mevcut kullanımlar çalışmaya devam eder
 */

import { create } from "zustand";

// Slice imports
import {
  createProfileSlice,
  createSubscriptionSlice,
  createKasaSlice,
  createCariSlice,
  createKategoriSlice,
  createIslemSlice,
  createTekrarlayanOdemeSlice,
  createCekSenetSlice,
  createTaksitSlice,
  createPersonelSlice,
  createIzinSlice,
  createGunlukSatisSlice,
  createMenuItemSlice,
  createUrunKategoriSlice,
  createSatisKaydiSlice,
  createUrunSlice,
  createAnimsaticiSlice,
  type ProfileSlice,
  type SubscriptionSlice,
  type KasaSlice,
  type CariSlice,
  type KategoriSlice,
  type IslemSlice,
  type TekrarlayanOdemeSlice,
  type CekSenetSlice,
  type TaksitSlice,
  type PersonelSlice,
  type IzinSlice,
  type GunlukSatisSlice,
  type MenuItemSlice,
  type UrunKategoriSlice,
  type SatisKaydiSlice,
  type UrunSlice,
  type AnimsaticiSlice,
} from "./slices";

// ============================================
// STORE TYPE
// ============================================

export type StoreState = ProfileSlice &
  SubscriptionSlice &
  KasaSlice &
  CariSlice &
  KategoriSlice &
  IslemSlice &
  TekrarlayanOdemeSlice &
  CekSenetSlice &
  TaksitSlice &
  PersonelSlice &
  IzinSlice &
  GunlukSatisSlice &
  MenuItemSlice &
  UrunKategoriSlice &
  SatisKaydiSlice &
  UrunSlice &
  AnimsaticiSlice;

// ============================================
// STORE CREATION
// ============================================

export const useStore = create<StoreState>()((...args) => ({
  // Core
  ...createProfileSlice(...args),
  ...createSubscriptionSlice(...args),

  // Finans
  ...createKasaSlice(...args),
  ...createCariSlice(...args),
  ...createKategoriSlice(...args),
  ...createIslemSlice(...args),
  ...createTekrarlayanOdemeSlice(...args),
  ...createCekSenetSlice(...args),
  ...createTaksitSlice(...args),

  // Personel
  ...createPersonelSlice(...args),
  ...createIzinSlice(...args),

  // Satış
  ...createGunlukSatisSlice(...args),
  ...createMenuItemSlice(...args),
  ...createUrunKategoriSlice(...args),
  ...createSatisKaydiSlice(...args),
  ...createUrunSlice(...args),

  // Diğer
  ...createAnimsaticiSlice(...args),
}));

// ============================================
// SELECTOR HOOKS (Opsiyonel - Performance)
// ============================================

/**
 * Shallow comparison ile selector kullanımı
 *
 * Örnek:
 * const { kasalar, loadingKasalar } = useStoreShallow((state) => ({
 *   kasalar: state.kasalar,
 *   loadingKasalar: state.loadingKasalar,
 * }));
 */
// import { useShallow } from 'zustand/react/shallow';
// export const useStoreShallow = <T>(selector: (state: StoreState) => T) =>
//   useStore(useShallow(selector));

// ============================================
// DEFAULT EXPORT
// ============================================

export default useStore;
