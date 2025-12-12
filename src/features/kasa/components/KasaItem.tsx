// KasaItem Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Kasa } from "../../../types";
import { formatCurrency } from "../../../shared/utils";

interface KasaItemProps {
  kasa: Kasa;
  onPress: () => void;
}

export const KasaItem: React.FC<KasaItemProps> = ({ kasa, onPress }) => {
  return (
    <TouchableOpacity style={styles.kasaItem} onPress={onPress}>
      <View style={styles.kasaItemLeft}>
        <Text style={styles.kasaItemName}>{kasa.name}</Text>
      </View>
      <View style={styles.kasaItemRight}>
        <Text
          style={[
            styles.kasaItemBalance,
            kasa.balance < 0 && styles.kasaItemBalanceNegative,
          ]}
        >
          {formatCurrency(kasa.balance)}
        </Text>
        <ChevronRight size={18} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  kasaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kasaItemLeft: {
    flex: 1,
  },
  kasaItemName: {
    fontSize: 15,
    color: "#374151",
  },
  kasaItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kasaItemBalance: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  kasaItemBalanceNegative: {
    color: "#ef4444",
  },
});
