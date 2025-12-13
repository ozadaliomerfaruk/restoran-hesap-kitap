/**
 * KasaDetay Types
 */

export interface BirlesikIslem {
  id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  kasa_hedef_id?: string;
  source: "islem" | "personel";
  cari?: { id: string; name: string; type: string };
  personel?: { id: string; name: string };
  kategori?: { id: string; name: string };
  kategori_id?: string;
  target_kasa?: { id: string; name: string };
  isTransferIn?: boolean;
  created_by_user?: { id: string; name?: string; email?: string };
}

export type IslemTipi = "gelir" | "gider" | "odeme" | "tahsilat" | "transfer";

export const islemTipiLabels: Record<string, string> = {
  gelir: "GELİR",
  gider: "GİDER",
  odeme: "CARİ ÖDEME",
  tahsilat: "CARİ TAHSİLAT",
  personel_odeme: "PERSONEL ÖDEME",
  personel_tahsilat: "PERSONEL TAHSİLAT",
  transfer: "TRANSFER",
};

export const islemTipiColors: Record<string, string> = {
  gelir: "#10b981",
  gider: "#ef4444",
  odeme: "#3b82f6",
  tahsilat: "#8b5cf6",
  personel_odeme: "#ec4899",
  personel_tahsilat: "#14b8a6",
  transfer: "#f59e0b",
};
