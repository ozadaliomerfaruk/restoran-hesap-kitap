// Kasa Constants

import { Wallet, Building2, CreditCard, PiggyBank } from "lucide-react-native";
import { KasaGroupConfig } from "./types";

export const kasaGroups: KasaGroupConfig[] = [
  {
    type: "nakit",
    label: "Nakit",
    icon: Wallet,
    color: "#10b981",
    bgColor: "#dcfce7",
  },
  {
    type: "banka",
    label: "Banka Hesabı",
    icon: Building2,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  {
    type: "kredi_karti",
    label: "Kredi Kartı",
    icon: CreditCard,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  {
    type: "birikim",
    label: "Birikim",
    icon: PiggyBank,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
];
