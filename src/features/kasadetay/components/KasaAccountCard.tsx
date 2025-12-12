/**
 * Kasa Account Card
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Edit3,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
} from "lucide-react-native";
import { colors, spacing, borderRadius } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { Kasa } from "@/types";

const kasaIcons = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
  kredi_karti: { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" },
  birikim: { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" },
};

const kasaTypeLabels = {
  nakit: "Nakit",
  banka: "Banka",
  kredi_karti: "Kredi Kartı",
  birikim: "Birikim",
};

interface KasaAccountCardProps {
  kasa: Kasa;
  onEditName: () => void;
}

export function KasaAccountCard({ kasa, onEditName }: KasaAccountCardProps) {
  const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
  const IconComponent = iconConfig.icon;

  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: iconConfig.bgColor }]}>
        <IconComponent size={32} color={iconConfig.color} />
      </View>
      <View style={styles.info}>
        <TouchableOpacity onPress={onEditName}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{kasa.name}</Text>
            <Edit3 size={16} color="#9ca3af" />
          </View>
        </TouchableOpacity>
        <Text style={styles.type}>{kasaTypeLabels[kasa.type]}</Text>
      </View>
      <Text style={[styles.balance, kasa.balance < 0 && styles.negative]}>
        {formatCurrency(kasa.balance)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  type: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  balance: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  negative: {
    color: "#ef4444",
  },
});

export default KasaAccountCard;
