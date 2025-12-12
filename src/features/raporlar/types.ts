// Raporlar Types

export type ReportType =
  | "ozet"
  | "gelir-gider"
  | "kasa"
  | "cari-borc"
  | "personel-borc";

export interface RaporHesaplamalar {
  toplamGelir: number;
  toplamGider: number;
  netKar: number;
  toplamKasa: number;
  tedarikciBorc: number;
  musteriAlacak: number;
  personelBorc: number;
}
