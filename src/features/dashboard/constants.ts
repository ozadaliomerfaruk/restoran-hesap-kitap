/**
 * Dashboard Constants
 */

import { Wallet, Building2, CreditCard, PiggyBank } from "lucide-react-native";
import { colors } from "@/shared/constants";

export const kasaTypeConfig = {
  nakit: {
    icon: Wallet,
    color: colors.kasa.nakit.icon,
    bgColor: colors.kasa.nakit.bg,
    label: "Nakit",
  },
  banka: {
    icon: Building2,
    color: colors.kasa.banka.icon,
    bgColor: colors.kasa.banka.bg,
    label: "Banka",
  },
  kredi_karti: {
    icon: CreditCard,
    color: colors.kasa.krediKarti.icon,
    bgColor: colors.kasa.krediKarti.bg,
    label: "Kredi Kartı",
  },
  birikim: {
    icon: PiggyBank,
    color: colors.kasa.birikim.icon,
    bgColor: colors.kasa.birikim.bg,
    label: "Birikim",
  },
} as const;

export type KasaType = keyof typeof kasaTypeConfig;
export type IslemTipi = "gelir" | "gider" | "odeme" | "tahsilat" | "transfer";

export const islemTipiConfig = {
  gelir: { color: colors.success.main, label: "Gelir" },
  gider: { color: colors.error.main, label: "Gider" },
  odeme: { color: colors.info.main, label: "Ödeme" },
  tahsilat: { color: colors.secondary[500], label: "Tahsilat" },
  transfer: { color: colors.warning.main, label: "Transfer" },
} as const;
