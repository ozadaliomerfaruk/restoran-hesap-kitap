/**
 * İşlem Slice
 *
 * Tüm finansal işlemleri (gelir, gider, tahsilat, ödeme, transfer) yönetir.
 * Balance güncellemeleri ledger üzerinden yapılır.
 *
 * NOT: Transfer işlemi de bu slice içinde (ayrı slice yok).
 */

import type { Islem, Kasa, Cari, Kategori } from "../../types";
import type { StoreSlice } from "../types";
import {
  islemService,
  cariService,
  profileService,
} from "../../services/supabase";
import { getRestaurantId } from "../helpers";
import { ledger } from "../domain";

// ============================================
// SLICE INTERFACE
// ============================================

export interface IslemSlice {
  // State
  islemler: Islem[];
  loadingIslemler: boolean;

  // Actions
  fetchIslemler: (limit?: number) => Promise<void>;
  addIslem: (
    islem: Omit<
      Islem,
      "id" | "created_at" | "updated_at" | "created_by" | "restaurant_id"
    >
  ) => Promise<{ error: any }>;
  updateIslem: (id: string, updates: Partial<Islem>) => Promise<{ error: any }>;
  deleteIslem: (id: string) => Promise<{ error: any }>;

  // Transfer
  transferBetweenKasalar: (
    fromKasaId: string,
    toKasaId: string,
    amount: number,
    description?: string
  ) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createIslemSlice: StoreSlice<IslemSlice> = (set, get) => ({
  // Initial State
  islemler: [],
  loadingIslemler: false,

  // Actions
  fetchIslemler: async (limit = 100) => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingIslemler: true });

    try {
      const { data } = await islemService.fetchAll(restaurantId, limit);
      const { kasalar, cariler, kategoriler } = get();

      // Join işlemleri
      const islemlerWithJoins = (data || []).map((islem: Islem) => ({
        ...islem,
        kasa: kasalar.find((k: Kasa) => k.id === islem.kasa_id),
        kasa_hedef: kasalar.find((k: Kasa) => k.id === islem.kasa_hedef_id),
        cari: cariler.find((c: Cari) => c.id === islem.cari_id),
        kategori: kategoriler.find((k: Kategori) => k.id === islem.kategori_id),
      }));

      set({ islemler: islemlerWithJoins, loadingIslemler: false });
    } catch (error) {
      console.error("fetchIslemler error:", error);
      set({ loadingIslemler: false });
    }
  },

  addIslem: async (islem) => {
    const { profile } = get();
    const restaurantId = getRestaurantId(profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();
    if (!user) {
      return { error: "No user" };
    }

    // Cari tipini al (eğer cari varsa)
    let cariType: "tedarikci" | "musteri" | undefined;
    if (islem.cari_id) {
      const { type } = await cariService.getType(islem.cari_id);
      cariType = type as "tedarikci" | "musteri" | undefined;
    }

    // Ledger üzerinden işlem oluştur (balance'ları da günceller)
    const result = await ledger.createIslem(
      {
        ...islem,
        restaurant_id: restaurantId,
        created_by: user.id,
      },
      cariType
    );

    if (result.success) {
      // İlgili verileri yenile
      get().fetchIslemler();
      get().fetchKasalar();
      if (islem.cari_id) {
        get().fetchCariler();
      }
    }

    return { error: result.success ? null : result.error };
  },

  updateIslem: async (id, updates) => {
    const { error } = await islemService.update(id, updates);

    if (!error) {
      get().fetchIslemler();
      get().fetchKasalar();
      get().fetchCariler();
    }

    return { error };
  },

  deleteIslem: async (id) => {
    const { islemler } = get();
    const islem = islemler.find((i: Islem) => i.id === id);

    if (!islem) {
      return { error: "İşlem bulunamadı" };
    }

    // Cari tipini al
    let cariType: "tedarikci" | "musteri" | undefined;
    if (islem.cari_id) {
      const { type } = await cariService.getType(islem.cari_id);
      cariType = type as "tedarikci" | "musteri" | undefined;
    }

    // Ledger üzerinden sil (balance'ları geri alır)
    const result = await ledger.deleteIslem(islem, cariType);

    if (result.success) {
      get().fetchIslemler();
      get().fetchKasalar();
      if (islem.cari_id) {
        get().fetchCariler();
      }
    }

    return { error: result.success ? null : result.error };
  },

  // Transfer
  transferBetweenKasalar: async (fromKasaId, toKasaId, amount, description) => {
    const { profile } = get();
    const restaurantId = getRestaurantId(profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();
    if (!user) {
      return { error: "No user" };
    }

    // Ledger üzerinden transfer yap
    const result = await ledger.createTransfer(
      fromKasaId,
      toKasaId,
      amount,
      restaurantId,
      user.id,
      description
    );

    if (result.success) {
      get().fetchKasalar();
      get().fetchIslemler();
    }

    return { error: result.success ? null : result.error };
  },
});
