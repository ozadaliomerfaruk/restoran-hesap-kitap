/**
 * LEDGER SERVICE
 *
 * Tüm balance-affecting işlemleri merkezi yönetir.
 * Slice'lar bu servis üzerinden finansal işlemleri gerçekleştirir.
 *
 * ⚠️ KNOWN LIMITATIONS (Technical Debt):
 *
 * 1. NOT ATOMIC: Multiple DB calls without transaction.
 *    If step 2 fails after step 1 succeeds, data becomes inconsistent.
 *    TODO: Migrate to single Supabase RPC with DB transaction.
 *
 * 2. NO IDEMPOTENCY: Double-click or retry can create duplicate entries.
 *    TODO: Add idempotency_key column to islemler table.
 *
 * 3. NO ROLLBACK: Partial failures are not automatically reversed.
 *    TODO: Implement compensating transactions or use DB-level atomicity.
 *
 * CURRENT BEHAVIOR: Same as existing useStore.ts (no regression)
 * TARGET BEHAVIOR: Full ACID compliance via Supabase RPC
 */

import {
  kasaService,
  cariService,
  islemService,
  personelService,
  cekSenetService,
  taksitService,
} from "../../services/supabase";
import type { Islem, PersonelIslem, CekSenet } from "../../types";
import type { AppError } from "../types";
import {
  ISLEM_EFFECTS,
  PERSONEL_ISLEM_EFFECTS,
  getCekSenetEffect,
} from "./effects";

// ============================================
// TYPES
// ============================================

type CariType = "tedarikci" | "musteri";

interface LedgerResult<T = void> {
  success: boolean;
  data?: T | null;
  error?: AppError;
}

// ============================================
// İŞLEM LEDGER FUNCTIONS
// ============================================

export const ledger = {
  /**
   * İşlem oluştur + tüm balance etkilerini uygula
   */
  async createIslem(
    islem: Omit<Islem, "id" | "created_at" | "updated_at">,
    cariType?: CariType
  ): Promise<LedgerResult<Islem>> {
    try {
      // 1. İşlemi oluştur
      const { data, error } = await islemService.create(islem);
      if (error || !data) {
        return {
          success: false,
          error: {
            code: "ISLEM_CREATE_FAILED",
            message: error?.message || "İşlem oluşturulamadı",
          },
        };
      }

      const effect = ISLEM_EFFECTS[islem.type];
      if (!effect) {
        return { success: true, data };
      }

      // 2. Kasa balance güncelle (transfer hariç)
      if (
        islem.kasa_id &&
        effect.kasaMultiplier !== 0 &&
        islem.type !== "transfer"
      ) {
        await kasaService.updateBalance(
          islem.kasa_id,
          islem.amount * effect.kasaMultiplier
        );
      }

      // 3. Cari balance güncelle
      if (islem.cari_id && cariType) {
        const cariMultiplier = effect.cariMultiplier[cariType];
        if (cariMultiplier !== 0) {
          await cariService.updateBalance(
            islem.cari_id,
            islem.amount * cariMultiplier
          );
        }
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: { code: "ISLEM_CREATE_ERROR", message: String(err) },
      };
    }
  },

  /**
   * İşlem sil + balance etkilerini geri al
   */
  async deleteIslem(islem: Islem, cariType?: CariType): Promise<LedgerResult> {
    try {
      const effect = ISLEM_EFFECTS[islem.type];

      // 1. İşlemi sil
      const { error } = await islemService.delete(islem.id);
      if (error) {
        return {
          success: false,
          error: {
            code: "ISLEM_DELETE_FAILED",
            message: error?.message || "İşlem silinemedi",
          },
        };
      }

      if (!effect) {
        return { success: true };
      }

      // 2. Kasa balance geri al (ters işaret)
      if (
        islem.kasa_id &&
        effect.kasaMultiplier !== 0 &&
        islem.type !== "transfer"
      ) {
        await kasaService.updateBalance(
          islem.kasa_id,
          islem.amount * -effect.kasaMultiplier
        );
      }

      // 3. Cari balance geri al
      if (islem.cari_id && cariType) {
        const cariMultiplier = effect.cariMultiplier[cariType];
        if (cariMultiplier !== 0) {
          await cariService.updateBalance(
            islem.cari_id,
            islem.amount * -cariMultiplier
          );
        }
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: { code: "ISLEM_DELETE_ERROR", message: String(err) },
      };
    }
  },

  /**
   * Kasalar arası transfer
   */
  async createTransfer(
    fromKasaId: string,
    toKasaId: string,
    amount: number,
    restaurantId: string,
    userId: string,
    description?: string
  ): Promise<LedgerResult<Islem>> {
    try {
      // 1. Transfer işlemi oluştur
      const { data, error } = await islemService.create({
        type: "transfer",
        amount,
        description: description || "Kasalar arası transfer",
        date: new Date().toISOString().split("T")[0],
        kasa_id: fromKasaId,
        kasa_hedef_id: toKasaId,
        restaurant_id: restaurantId,
        created_by: userId,
      });

      if (error || !data) {
        return {
          success: false,
          error: {
            code: "TRANSFER_CREATE_FAILED",
            message: error?.message || "Transfer oluşturulamadı",
          },
        };
      }

      // 2. Kaynak kasadan çıkar
      await kasaService.updateBalance(fromKasaId, -amount);

      // 3. Hedef kasaya ekle
      await kasaService.updateBalance(toKasaId, amount);

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: { code: "TRANSFER_ERROR", message: String(err) },
      };
    }
  },

  // ============================================
  // PERSONEL LEDGER FUNCTIONS
  // ============================================

  /**
   * Personel işlem oluştur + etkiler
   */
  async createPersonelIslem(
    islem: Omit<PersonelIslem, "id" | "created_at">
  ): Promise<LedgerResult<PersonelIslem>> {
    try {
      // 1. İşlemi oluştur
      const { data, error } = await personelService.createIslem(islem);
      if (error || !data) {
        return {
          success: false,
          error: {
            code: "PERSONEL_ISLEM_FAILED",
            message: error?.message || "Personel işlemi oluşturulamadı",
          },
        };
      }

      const effect = PERSONEL_ISLEM_EFFECTS[islem.type];
      if (!effect) {
        return { success: true, data };
      }

      // 2. Kasa etkisi
      if (islem.kasa_id && effect.kasaMultiplier !== 0) {
        await kasaService.updateBalance(
          islem.kasa_id,
          islem.amount * effect.kasaMultiplier
        );
      }

      // 3. Personel balance etkisi
      if (effect.personelMultiplier !== 0) {
        await personelService.updateBalance(
          islem.personel_id,
          islem.amount * effect.personelMultiplier
        );
      }

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: { code: "PERSONEL_ISLEM_ERROR", message: String(err) },
      };
    }
  },

  // ============================================
  // ÇEK/SENET LEDGER FUNCTIONS
  // ============================================

  /**
   * Çek/Senet status değişikliği + etkiler
   */
  async updateCekSenetStatus(
    cekSenet: CekSenet,
    newStatus: CekSenet["status"],
    kasaId?: string
  ): Promise<LedgerResult> {
    try {
      // Status değişikliği için effect al
      const effect = getCekSenetEffect(newStatus, cekSenet.direction);
      const targetKasaId = kasaId || cekSenet.kasa_id;

      // 1. Status güncelle
      const { error } = await cekSenetService.update(cekSenet.id, {
        status: newStatus,
        ...(kasaId && { kasa_id: kasaId }),
      });

      if (error) {
        return {
          success: false,
          error: {
            code: "CEK_SENET_UPDATE_FAILED",
            message: error?.message || "Çek/Senet güncellenemedi",
          },
        };
      }

      // 2. Eğer effect varsa balance'ları güncelle
      if (effect) {
        if (targetKasaId && effect.kasaMultiplier !== 0) {
          await kasaService.updateBalance(
            targetKasaId,
            cekSenet.amount * effect.kasaMultiplier
          );
        }

        if (cekSenet.cari_id && effect.cariMultiplier !== 0) {
          await cariService.updateBalance(
            cekSenet.cari_id,
            cekSenet.amount * effect.cariMultiplier
          );
        }
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: { code: "CEK_SENET_STATUS_ERROR", message: String(err) },
      };
    }
  },

  // ============================================
  // TAKSİT LEDGER FUNCTIONS
  // ============================================

  /**
   * Taksit ödemesi yap + kasa etkisi
   */
  async payTaksitOdemesi(
    odemesiId: string,
    kasaId: string,
    amount: number
  ): Promise<LedgerResult> {
    try {
      // 1. Ödemeyi işaretle
      const { error } = await taksitService.payOdeme(odemesiId);
      if (error) {
        return {
          success: false,
          error: {
            code: "TAKSIT_PAY_FAILED",
            message: error?.message || "Taksit ödemesi başarısız",
          },
        };
      }

      // 2. Kasadan düş
      await kasaService.updateBalance(kasaId, -amount);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: { code: "TAKSIT_PAY_ERROR", message: String(err) },
      };
    }
  },
};
