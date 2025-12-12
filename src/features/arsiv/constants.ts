// Arşiv Constants

import {
  Building2,
  Users,
  UserCheck,
  Wallet,
  CreditCard,
  PiggyBank,
  Archive,
  LucideIcon,
} from "lucide-react-native";
import { ArchivedItem, ArsivTabType } from "./types";

interface IconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const getIconConfig = (
  item: ArchivedItem,
  tabType: ArsivTabType
): IconConfig => {
  if (tabType === "cariler") {
    return item.type === "tedarikci"
      ? { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" }
      : { icon: Users, color: "#10b981", bgColor: "#dcfce7" };
  }

  if (tabType === "personel") {
    return { icon: UserCheck, color: "#8b5cf6", bgColor: "#ede9fe" };
  }

  if (tabType === "hesaplar") {
    if (item.type === "banka") {
      return { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" };
    }
    if (item.type === "kredi_karti") {
      return { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" };
    }
    if (item.type === "birikim") {
      return { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" };
    }
    return { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" };
  }

  return { icon: Archive, color: "#6b7280", bgColor: "#f3f4f6" };
};

export const getSubtitle = (
  item: ArchivedItem,
  tabType: ArsivTabType
): string => {
  if (tabType === "cariler") {
    return item.type === "tedarikci" ? "Tedarikçi" : "Müşteri";
  }
  if (tabType === "personel") {
    return "Personel";
  }
  if (tabType === "hesaplar") {
    if (item.type === "banka") return "Banka Hesabı";
    if (item.type === "kredi_karti") return "Kredi Kartı";
    if (item.type === "birikim") return "Birikim";
    return "Nakit";
  }
  return "";
};

export const tabConfig: Record<
  ArsivTabType,
  { table: string; emptyText: string }
> = {
  cariler: { table: "cariler", emptyText: "Arşivlenmiş cari yok" },
  personel: { table: "personel", emptyText: "Arşivlenmiş personel yok" },
  hesaplar: { table: "kasalar", emptyText: "Arşivlenmiş hesap yok" },
};
