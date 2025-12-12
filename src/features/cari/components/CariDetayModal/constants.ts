/**
 * CariDetayModal Constants
 * Renkler, labellar ve helper fonksiyonlar
 */

import {
  ShoppingCart,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";

// İşlem tip renkleri
export const islemColors: Record<string, string> = {
  gider: "#ef4444",
  gelir: "#f59e0b",
  odeme: "#3b82f6",
  tahsilat: "#10b981",
};

// İşlem tip labelları
export const islemLabels: Record<string, string> = {
  gider: "ALIŞ",
  gelir: "İADE",
  odeme: "ÖDEME",
  tahsilat: "TAHSİLAT",
};

// İşlem tip ikonları
export const islemIcons = {
  gider: { icon: ShoppingCart, color: "#ef4444" },
  gelir: { icon: RotateCcw, color: "#f59e0b" },
  odeme: { icon: ArrowUpRight, color: "#3b82f6" },
  tahsilat: { icon: ArrowDownLeft, color: "#10b981" },
};

// Helper fonksiyonlar
export const getIslemColor = (type: string): string => {
  return islemColors[type] || "#6b7280";
};

export const getIslemLabel = (type: string): string => {
  return islemLabels[type] || type.toUpperCase();
};

// Bakiye bilgisi hesaplama
export const getBalanceInfo = (
  balance: number,
  cariType: "tedarikci" | "musteri"
): { text: string; color: string } => {
  if (balance === 0) {
    return { text: "Borç yok", color: "#6b7280" };
  }

  if (cariType === "tedarikci") {
    if (balance > 0) {
      return { text: "Borcunuz", color: "#ef4444" };
    } else {
      return { text: "Alacağınız", color: "#10b981" };
    }
  } else {
    // Müşteri
    if (balance > 0) {
      return { text: "Alacağınız", color: "#10b981" };
    } else {
      return { text: "Borcunuz", color: "#ef4444" };
    }
  }
};

// Tarih key'i (gruplamak için)
export const getDateKey = (dateStr: string): string => {
  return dateStr.split("T")[0];
};
