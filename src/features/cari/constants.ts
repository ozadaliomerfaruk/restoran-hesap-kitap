// Cari Feature Constants

import {
  ShoppingCart,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react-native";
import { CariIslemTipi } from "./types";

// Tedarikçi işlem tipleri
export const TEDARIKCI_ISLEM_TIPLERI = [
  {
    key: "alis" as CariIslemTipi,
    label: "ALIŞ",
    icon: ShoppingCart,
    color: "#ef4444",
    bgColor: "#fef2f2",
  },
  {
    key: "iade" as CariIslemTipi,
    label: "İADE",
    icon: RotateCcw,
    color: "#f59e0b",
    bgColor: "#fffbeb",
  },
  {
    key: "odeme" as CariIslemTipi,
    label: "ÖDEME",
    icon: ArrowUpRight,
    color: "#3b82f6",
    bgColor: "#eff6ff",
  },
  {
    key: "tahsilat" as CariIslemTipi,
    label: "TAHSİLAT",
    icon: ArrowDownLeft,
    color: "#10b981",
    bgColor: "#ecfdf5",
  },
];

// Müşteri işlem tipleri
export const MUSTERI_ISLEM_TIPLERI = [
  {
    key: "satis" as CariIslemTipi,
    label: "SATIŞ",
    icon: ShoppingCart,
    color: "#10b981",
    bgColor: "#ecfdf5",
  },
  {
    key: "musteri_iade" as CariIslemTipi,
    label: "İADE",
    icon: RotateCcw,
    color: "#f59e0b",
    bgColor: "#fffbeb",
  },
  {
    key: "odeme" as CariIslemTipi,
    label: "ÖDEME",
    icon: ArrowUpRight,
    color: "#ef4444",
    bgColor: "#fef2f2",
  },
  {
    key: "tahsilat" as CariIslemTipi,
    label: "TAHSİLAT",
    icon: ArrowDownLeft,
    color: "#3b82f6",
    bgColor: "#eff6ff",
  },
];

// İşlem tipine göre config al
export const getIslemTipiConfig = (cariType: "tedarikci" | "musteri") => {
  return cariType === "tedarikci"
    ? TEDARIKCI_ISLEM_TIPLERI
    : MUSTERI_ISLEM_TIPLERI;
};

// Balance text hesapla
export const getBalanceText = (
  balance: number,
  cariType: "tedarikci" | "musteri",
  formatCurrency: (amount: number) => string
) => {
  if (cariType === "tedarikci") {
    if (balance > 0)
      return { text: `Borcumuz: ${formatCurrency(balance)}`, color: "#ef4444" };
    if (balance < 0)
      return {
        text: `Alacağımız: ${formatCurrency(Math.abs(balance))}`,
        color: "#10b981",
      };
  } else {
    if (balance > 0)
      return {
        text: `Alacağımız: ${formatCurrency(balance)}`,
        color: "#10b981",
      };
    if (balance < 0)
      return {
        text: `Borcumuz: ${formatCurrency(Math.abs(balance))}`,
        color: "#ef4444",
      };
  }
  return { text: "Borç yok", color: "#6b7280" };
};
