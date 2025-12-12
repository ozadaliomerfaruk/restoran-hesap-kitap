// Ürün Detay Feature - Types

import { MenuItem, SatisKaydi } from "../../types";

// Birim sabitleri
export const BIRIMLER = [
  "Adet",
  "Porsiyon",
  "Kg",
  "Gram",
  "Litre",
  "Bardak",
  "Dilim",
  "Paket",
] as const;

export type BirimType = (typeof BIRIMLER)[number];

// Ürün istatistikleri
export interface UrunStats {
  toplamAdet: number;
  toplamCiro: number;
}

// Satış düzenleme form state
export interface EditSatisForm {
  adet: string;
  fiyat: string;
  date: Date;
}

// Ürün düzenleme form state
export interface UrunEditForm {
  name: string;
  price: string;
  unit: string;
}

// Grouped sales by date
export interface GroupedSatis {
  date: string;
  dateFormatted: string;
  satislar: SatisKaydi[];
}
