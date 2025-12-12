/**
 * Kasa List - Kasaları gruplar halinde listeler
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  Plus,
} from "lucide-react-native";
import { colors, spacing, borderRadius } from "@/shared/constants";
import { Kasa } from "@/types";

interface KasaListProps {
  kasalar: Kasa[];
  onAddPress: () => void;
  renderKasaCard: (kasa: Kasa) => React.ReactNode;
}

const groupConfig = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7", label: "NAKİT" },
  banka: {
    icon: Building2,
    color: "#3b82f6",
    bgColor: "#dbeafe",
    label: "BANKA HESAPLARI",
  },
  kredi_karti: {
    icon: CreditCard,
    color: "#f59e0b",
    bgColor: "#fef3c7",
    label: "KREDİ KARTLARI",
  },
  birikim: {
    icon: PiggyBank,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    label: "BİRİKİM",
  },
};

export function KasaList({
  kasalar,
  onAddPress,
  renderKasaCard,
}: KasaListProps) {
  const nakitKasalar = kasalar.filter((k) => k.type === "nakit");
  const bankaKasalar = kasalar.filter((k) => k.type === "banka");
  const krediKartlari = kasalar.filter((k) => k.type === "kredi_karti");
  const birikimKasalar = kasalar.filter((k) => k.type === "birikim");

  const renderGroup = (type: keyof typeof groupConfig, items: Kasa[]) => {
    if (items.length === 0) return null;

    const config = groupConfig[type];
    const Icon = config.icon;

    return (
      <View key={type}>
        <View style={styles.groupHeader}>
          <View style={[styles.groupIcon, { backgroundColor: config.bgColor }]}>
            <Icon size={14} color={config.color} />
          </View>
          <Text style={styles.groupTitle}>{config.label}</Text>
          <View style={styles.groupLine} />
        </View>
        {items.map((kasa) => renderKasaCard(kasa))}
      </View>
    );
  };

  if (kasalar.length === 0) {
    return (
      <TouchableOpacity style={styles.emptyState} onPress={onAddPress}>
        <Wallet size={32} color="#9ca3af" />
        <Text style={styles.emptyText}>Kasa eklemek için tıklayın</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {renderGroup("nakit", nakitKasalar)}
      {renderGroup("banka", bankaKasalar)}
      {renderGroup("kredi_karti", krediKartlari)}
      {renderGroup("birikim", birikimKasalar)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginRight: 10,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
});

export default KasaList;
