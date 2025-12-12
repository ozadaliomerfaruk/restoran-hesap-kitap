/**
 * Balance Effect Definitions
 *
 * Tüm işlem tiplerinin kasa/cari/personel bakiyelerine
 * etkisini tanımlar. Bu dosya ledger.ts tarafından kullanılır.
 *
 * MULTIPLIER KURALLARI:
 * - Pozitif (+1): Bakiyeyi artırır
 * - Negatif (-1): Bakiyeyi azaltır
 * - Sıfır (0): Etkilemez
 */

// ============================================
// İŞLEM ETKİLERİ
// ============================================

export interface IslemEffect {
  /** Kasa bakiyesi çarpanı: +1 giriş, -1 çıkış, 0 etkilemez */
  kasaMultiplier: number;
  /** Cari bakiyesi çarpanı (cari tipine göre) */
  cariMultiplier: {
    tedarikci: number;
    musteri: number;
  };
}

/**
 * İşlem tipi → Balance etkileri haritası
 *
 * Örnek: gelir işlemi
 * - Kasa: +amount (para girişi)
 * - Tedarikçi cari: -amount (borç azalır)
 * - Müşteri cari: -amount (alacak azalır)
 */
export const ISLEM_EFFECTS: Record<string, IslemEffect> = {
  // === GELİR/GİDER ===
  gelir: {
    kasaMultiplier: 1,
    cariMultiplier: { tedarikci: -1, musteri: -1 },
  },
  gider: {
    kasaMultiplier: -1,
    cariMultiplier: { tedarikci: 1, musteri: 1 },
  },

  // === TAHSİLAT/ÖDEME ===
  tahsilat: {
    kasaMultiplier: 1,
    cariMultiplier: { tedarikci: 1, musteri: -1 },
  },
  odeme: {
    kasaMultiplier: -1,
    cariMultiplier: { tedarikci: -1, musteri: 1 },
  },

  // === SATIŞ/İADE (Kasa etkilemez, sadece cari) ===
  satis: {
    kasaMultiplier: 0,
    cariMultiplier: { tedarikci: 1, musteri: 1 },
  },
  iade: {
    kasaMultiplier: 0,
    cariMultiplier: { tedarikci: -1, musteri: -1 },
  },
  musteri_iade: {
    kasaMultiplier: 0,
    cariMultiplier: { tedarikci: -1, musteri: -1 },
  },

  // === TRANSFER (Özel handling - ledger'da ayrı) ===
  transfer: {
    kasaMultiplier: 0, // Kaynak: -amount, Hedef: +amount (ayrı hesaplanır)
    cariMultiplier: { tedarikci: 0, musteri: 0 },
  },

  // === KREDİ KARTI ÖDEME ===
  kredi_karti_odeme: {
    kasaMultiplier: -1, // Bankadan çıkış
    cariMultiplier: { tedarikci: 0, musteri: 0 },
  },
};

// ============================================
// PERSONEL İŞLEM ETKİLERİ
// ============================================

export interface PersonelIslemEffect {
  /** Personel bakiyesi çarpanı: +1 hak ediş, -1 ödeme/kesinti */
  personelMultiplier: number;
  /** Kasa bakiyesi çarpanı: -1 ödeme çıkışı, +1 kesinti girişi, 0 etkilemez */
  kasaMultiplier: number;
}

export const PERSONEL_ISLEM_EFFECTS: Record<string, PersonelIslemEffect> = {
  // === HAK EDİŞLER (Personel bakiyesi artar, kasa etkilenmez) ===
  maas: { personelMultiplier: 1, kasaMultiplier: 0 },
  prim: { personelMultiplier: 1, kasaMultiplier: 0 },
  mesai: { personelMultiplier: 1, kasaMultiplier: 0 },
  tazminat: { personelMultiplier: 1, kasaMultiplier: 0 },
  komisyon: { personelMultiplier: 1, kasaMultiplier: 0 },
  diger: { personelMultiplier: 1, kasaMultiplier: 0 },

  // === AVANS (Personelden düşer, kasa etkilenmez - ayrı ödenir) ===
  avans: { personelMultiplier: -1, kasaMultiplier: 0 },

  // === ÖDEME (Personelden düşer, kasadan çıkar) ===
  odeme: { personelMultiplier: -1, kasaMultiplier: -1 },

  // === KESİNTİ (Personelden düşer, kasaya girer) ===
  kesinti: { personelMultiplier: -1, kasaMultiplier: 1 },

  // === TAHSİLAT (Personelden alacak, özel durum) ===
  tahsilat: { personelMultiplier: 0, kasaMultiplier: 1 },
};

// ============================================
// ÇEK/SENET ETKİLERİ
// ============================================

export interface CekSenetStatusEffect {
  /** Kasa bakiyesi çarpanı */
  kasaMultiplier: number;
  /** Cari bakiyesi çarpanı */
  cariMultiplier: number;
}

/**
 * Çek/Senet status değişikliğine göre etkiler
 * Key format: `${newStatus}_${direction}`
 */
export const CEK_SENET_STATUS_EFFECTS: Record<string, CekSenetStatusEffect> = {
  // Alacak çek/senet tahsil edildi → Kasa +, Cari -
  tahsil_edildi_alacak: {
    kasaMultiplier: 1,
    cariMultiplier: -1,
  },
  // Borç çek/senet ödendi → Kasa -, Cari +
  odendi_borc: {
    kasaMultiplier: -1,
    cariMultiplier: 1,
  },
};

/**
 * Çek/Senet status değişikliği için effect döndürür
 */
export function getCekSenetEffect(
  newStatus: string,
  direction: string
): CekSenetStatusEffect | null {
  const key = `${newStatus}_${direction}`;
  return CEK_SENET_STATUS_EFFECTS[key] ?? null;
}
