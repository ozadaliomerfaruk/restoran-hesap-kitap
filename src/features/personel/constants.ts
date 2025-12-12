// Personel Feature Constants

import {
  Briefcase,
  Clock,
  Award,
  Banknote,
  MoreHorizontal,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
} from "lucide-react-native";
import { GiderKategori, IzinTipiValue } from "./types";

// Gider kategorileri
export const GIDER_KATEGORILERI: {
  value: GiderKategori;
  label: string;
  icon: typeof Briefcase;
}[] = [
  { value: "maas", label: "Maaş", icon: Briefcase },
  { value: "mesai", label: "Mesai", icon: Clock },
  { value: "prim", label: "Prim", icon: Award },
  { value: "komisyon", label: "Komisyon", icon: Banknote },
  { value: "diger", label: "Diğer", icon: MoreHorizontal },
];

// İzin tipleri
export const IZIN_TIPLERI: { value: IzinTipiValue; label: string }[] = [
  { value: "yillik", label: "Yıllık İzin" },
  { value: "hastalik", label: "Hastalık" },
  { value: "mazeret", label: "Mazeret" },
  { value: "ucretsiz", label: "Ücretsiz İzin" },
];

// İşlem tipi konfigürasyonu
export const ISLEM_TIPI_CONFIG = {
  gider: {
    label: "GİDER",
    color: "#ef4444",
    icon: Wallet,
  },
  odeme: {
    label: "ÖDEME",
    color: "#3b82f6",
    icon: ArrowUpRight,
  },
  tahsilat: {
    label: "TAHSİLAT",
    color: "#10b981",
    icon: ArrowDownLeft,
  },
} as const;

// İşlem type info getter
export const getIslemTypeInfo = (type: string) => {
  const giderTypes = [
    "maas",
    "mesai",
    "prim",
    "avans",
    "diger",
    "tazminat",
    "komisyon",
    "kesinti",
  ];

  if (giderTypes.includes(type)) {
    const labels: Record<string, string> = {
      maas: "MAAŞ",
      mesai: "MESAİ",
      prim: "PRİM",
      avans: "AVANS",
      diger: "DİĞER",
      tazminat: "TAZMİNAT",
      komisyon: "KOMİSYON",
      kesinti: "KESİNTİ",
    };
    return { label: labels[type] || "GİDER", color: "#ef4444", icon: Wallet };
  }

  switch (type) {
    case "odeme":
      return { label: "ÖDEME", color: "#3b82f6", icon: ArrowUpRight };
    case "tahsilat":
      return { label: "TAHSİLAT", color: "#10b981", icon: ArrowDownLeft };
    default:
      return { label: type.toUpperCase(), color: "#6b7280", icon: FileText };
  }
};

// Balance info getter
export const getBalanceInfo = (balance: number) => {
  if (balance > 0) {
    return {
      text: `Borcumuz`,
      color: "#ef4444",
      bgColor: "#fef2f2",
    };
  } else if (balance < 0) {
    return {
      text: `Alacağımız`,
      color: "#10b981",
      bgColor: "#ecfdf5",
    };
  }
  return { text: "Bakiye", color: "#6b7280", bgColor: "#f3f4f6" };
};
