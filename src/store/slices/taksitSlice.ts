/**
 * Taksit Slice
 *
 * Taksitli alışverişleri ve ödeme planlarını yönetir.
 * Ödeme işlemlerinde kasa balance güncellenir.
 */

import type { Taksit, TaksitOdemesi, Kasa, Kategori } from "../../types";
import type { StoreSlice } from "../types";
import { taksitService, profileService } from "../../services/supabase";
import { getRestaurantId } from "../helpers";
import { ledger } from "../domain";

// ============================================
// SLICE INTERFACE
// ============================================

export interface TaksitSlice {
  // State
  taksitler: Taksit[];
  loadingTaksitler: boolean;

  // Actions
  fetchTaksitler: () => Promise<void>;
  addTaksit: (
    taksit: Omit<
      Taksit,
      | "id"
      | "created_at"
      | "updated_at"
      | "paid_count"
      | "remaining_amount"
      | "is_completed"
    >
  ) => Promise<{ error: any }>;
  updateTaksit: (
    id: string,
    updates: Partial<Taksit>
  ) => Promise<{ error: any }>;
  payTaksitOdemesi: (
    odemesiId: string,
    kasaId: string
  ) => Promise<{ error: any }>;
}

// ============================================
// SLICE IMPLEMENTATION
// ============================================

export const createTaksitSlice: StoreSlice<TaksitSlice> = (set, get) => ({
  // Initial State
  taksitler: [],
  loadingTaksitler: false,

  // Actions
  fetchTaksitler: async () => {
    const restaurantId = getRestaurantId(get().profile);

    if (!restaurantId) {
      return;
    }

    set({ loadingTaksitler: true });

    try {
      const { data: taksitData } = await taksitService.fetchAll(restaurantId);
      const { kasalar, kategoriler } = get();

      // Taksitler ve ödemeleri birlikte getir
      const taksitlerWithJoins = await Promise.all(
        (taksitData || []).map(async (taksit: Taksit) => {
          const { data: odemeler } = await taksitService.fetchOdemeler(
            taksit.id
          );

          return {
            ...taksit,
            kasa: kasalar.find((k: Kasa) => k.id === taksit.kasa_id),
            kategori: kategoriler.find(
              (k: Kategori) => k.id === taksit.kategori_id
            ),
            odemeler: odemeler || [],
          };
        })
      );

      set({ taksitler: taksitlerWithJoins, loadingTaksitler: false });
    } catch (error) {
      console.error("fetchTaksitler error:", error);
      set({ loadingTaksitler: false });
    }
  },

  addTaksit: async (taksit) => {
    const { profile } = get();
    const restaurantId = getRestaurantId(profile);

    if (!restaurantId) {
      return { error: "No restaurant" };
    }

    const user = await profileService.getCurrentUser();

    // 1. Taksit kaydı oluştur
    const { data, error } = await taksitService.create({
      ...taksit,
      restaurant_id: restaurantId,
      created_by: user?.id,
    });

    if (error || !data) {
      return { error: error || "Taksit oluşturulamadı" };
    }

    // 2. Ödeme planı oluştur
    const odemeler: any[] = [];
    const startDate = new Date(taksit.start_date);

    for (let i = 0; i < taksit.installment_count; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      odemeler.push({
        taksit_id: data.id,
        restaurant_id: restaurantId,
        installment_no: i + 1,
        amount: taksit.installment_amount,
        due_date: dueDate.toISOString().split("T")[0],
        is_paid: false,
      });
    }

    await taksitService.createOdemeler(odemeler);

    // 3. Gider işlemi oluştur
    await get().addIslem({
      type: "gider",
      amount: taksit.total_amount,
      description: `Taksitli alım: ${taksit.title}`,
      date: taksit.start_date,
      kategori_id: taksit.kategori_id,
    });

    get().fetchTaksitler();

    return { error: null };
  },

  updateTaksit: async (id, updates) => {
    const { error } = await taksitService.update(id, updates);

    if (!error) {
      get().fetchTaksitler();
    }

    return { error };
  },

  payTaksitOdemesi: async (odemesiId, kasaId) => {
    const { taksitler } = get();

    // Ödemeyi bul
    let odeme: TaksitOdemesi | undefined;
    let taksit: Taksit | undefined;

    for (const t of taksitler) {
      const found = t.odemeler?.find((o: TaksitOdemesi) => o.id === odemesiId);
      if (found) {
        odeme = found;
        taksit = t;
        break;
      }
    }

    if (!odeme || !taksit) {
      return { error: "Ödeme bulunamadı" };
    }

    // Ledger üzerinden ödeme yap
    const result = await ledger.payTaksitOdemesi(
      odemesiId,
      kasaId,
      odeme.amount
    );

    if (result.success) {
      // Taksit bilgilerini güncelle
      const newPaidCount = taksit.paid_count + 1;
      const newRemainingAmount = taksit.remaining_amount - odeme.amount;
      const isCompleted = newPaidCount >= taksit.installment_count;

      // Sonraki ödemeyi bul
      const nextOdeme = taksit.odemeler?.find(
        (o: TaksitOdemesi) => !o.is_paid && o.id !== odemesiId
      );

      await taksitService.update(taksit.id, {
        paid_count: newPaidCount,
        remaining_amount: newRemainingAmount,
        is_completed: isCompleted,
        next_payment_date: nextOdeme?.due_date,
      });

      get().fetchTaksitler();
      get().fetchKasalar();
    }

    return { error: result.success ? null : result.error };
  },
});
