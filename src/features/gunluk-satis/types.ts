// Günlük Satış Types

export type FilterType = "kategori" | "en_cok_satan" | "en_cok_ciro" | null;

export interface UrunStats {
  toplamAdet: number;
  toplamCiro: number;
}

export const VARSAYILAN_KATEGORILER = [
  "Ana Yemek",
  "Çorba",
  "Salata",
  "Tatlı",
  "İçecek",
  "Kahvaltı",
  "Aperatif",
  "Diğer",
];

export const BIRIMLER = [
  "Adet",
  "Porsiyon",
  "Kg",
  "Gram",
  "Litre",
  "Bardak",
  "Dilim",
  "Paket",
];
