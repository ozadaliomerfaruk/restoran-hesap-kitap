// Personel Feature Types

export type IslemTipi = "gider" | "odeme" | "tahsilat";
export type GiderKategori = "maas" | "mesai" | "prim" | "komisyon" | "diger";
export type IzinTipiValue = "yillik" | "hastalik" | "mazeret" | "ucretsiz";

export interface GiderKategoriConfig {
  value: GiderKategori;
  label: string;
  icon: string;
}

export interface IzinTipiConfig {
  value: IzinTipiValue;
  label: string;
}

// İşlem type labels
export const giderTypes = [
  "maas",
  "mesai",
  "prim",
  "avans",
  "diger",
  "tazminat",
  "komisyon",
  "kesinti",
] as const;

export const islemTypeLabels: Record<string, string> = {
  maas: "MAAŞ",
  mesai: "MESAİ",
  prim: "PRİM",
  avans: "AVANS",
  diger: "DİĞER",
  tazminat: "TAZMİNAT",
  komisyon: "KOMİSYON",
  kesinti: "KESİNTİ",
  odeme: "ÖDEME",
  tahsilat: "TAHSİLAT",
};

export const islemTypeColors: Record<string, string> = {
  maas: "#ef4444",
  mesai: "#ef4444",
  prim: "#ef4444",
  avans: "#ef4444",
  diger: "#ef4444",
  tazminat: "#ef4444",
  komisyon: "#ef4444",
  kesinti: "#ef4444",
  odeme: "#3b82f6",
  tahsilat: "#10b981",
};

export const izinTypeLabels: Record<IzinTipiValue, string> = {
  yillik: "Yıllık İzin",
  hastalik: "Hastalık İzni",
  mazeret: "Mazeret İzni",
  ucretsiz: "Ücretsiz İzin",
};
