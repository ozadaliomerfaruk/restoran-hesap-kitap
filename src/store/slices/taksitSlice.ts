/**
 * Taksit Slice
 */

import { StateCreator } from "zustand";
import { Taksit, TaksitOdemesi, Profile, Kasa, Kategori } from "../../types";
import {
  taksitService,
  kasaService,
  profileService,
} from "../../services/supabase";

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

type TaksitSliceState = TaksitSlice & {
  profile: Profile | null;
  kasalar: Kasa[];
  kategoriler: Kategori[];
  fetchKasalar: () => Promise<void>;
  addIslem: (islem: any) => Promise<{ error: any }>;
};

export const createTaksitSlice: StateCreator<
  TaksitSliceState,
  [],
  [],
  TaksitSlice
> = (set, get) => ({
  // State
  taksitler: [],
  loadingTaksitler: false,

  // Actions
  fetchTaksitler: async () => {
    set({ loadingTaksitler: true });
    const { profile, kasalar, kategoriler } = get();
    if (profile?.restaurant_id) {
      const { data: taksitData } = await taksitService.fetchAll(
        profile.restaurant_id
      );

      const taksitlerWithJoins = await Promise.all(
        taksitData.map(async (taksit: Taksit) => {
          const { data: odemeler } = await taksitService.fetchOdemeler(
            taksit.id
          );

          return {
            ...taksit,
            kasa: kasalar.find((k) => k.id === taksit.kasa_id),
            kategori: kategoriler.find((k) => k.id === taksit.kategori_id),
            odemeler: odemeler || [],
          };
        })
      );

      set({ taksitler: taksitlerWithJoins });
    }
    set({ loadingTaksitler: false });
  },

  addTaksit: async (taksit) => {
    const { profile } = get();
    if (!profile?.restaurant_id) return { error: "No restaurant" };

    const user = await profileService.getCurrentUser();

    const { data, error } = await taksitService.create({
      ...taksit,
      restaurant_id: profile.restaurant_id,
      created_by: user?.id,
    });

    if (!error && data) {
      // Taksit ödemelerini oluştur
      const odemeler: Partial<TaksitOdemesi>[] = [];
      const startDate = new Date(taksit.start_date);

      for (let i = 0; i < taksit.installment_count; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        odemeler.push({
          taksit_id: data.id,
          restaurant_id: profile.restaurant_id,
          installment_no: i + 1,
          amount: taksit.installment_amount,
          due_date: dueDate.toISOString().split("T")[0],
          is_paid: false,
        });
      }

      await taksitService.createOdemeler(odemeler);

      // İlk gider kaydını oluştur
      await get().addIslem({
        type: "gider",
        amount: taksit.total_amount,
        description: `Taksitli alım: ${taksit.title}`,
        date: taksit.start_date,
        kategori_id: taksit.kategori_id,
      });

      get().fetchTaksitler();
    }
    return { error };
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

    let odeme: TaksitOdemesi | undefined;
    let taksit: Taksit | undefined;

    for (const t of taksitler) {
      const found = t.odemeler?.find((o) => o.id === odemesiId);
      if (found) {
        odeme = found;
        taksit = t;
        break;
      }
    }

    if (!odeme || !taksit) return { error: "Ödeme bulunamadı" };

    const { error } = await taksitService.payOdeme(odemesiId);

    if (!error) {
      await kasaService.updateBalance(kasaId, -odeme.amount);

      const newPaidCount = taksit.paid_count + 1;
      const newRemainingAmount = taksit.remaining_amount - odeme.amount;
      const isCompleted = newPaidCount >= taksit.installment_count;

      const nextOdeme = taksit.odemeler?.find(
        (o) => !o.is_paid && o.id !== odemesiId
      );

      await taksitService.update(taksit.id, {
        paid_count: newPaidCount,
        remaining_amount: newRemainingAmount,
        is_completed: isCompleted,
        next_payment_date: nextOdeme?.due_date || undefined,
      });

      get().fetchTaksitler();
      get().fetchKasalar();
    }
    return { error };
  },
});
