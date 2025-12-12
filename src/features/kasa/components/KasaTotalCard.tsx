// KasaTotalCard Component

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatCurrency } from "../../../shared/utils";

interface KasaTotalCardProps {
  total: number;
}

export const KasaTotalCard: React.FC<KasaTotalCardProps> = ({ total }) => {
  return (
    <View style={styles.totalCard}>
      <Text style={styles.totalLabel}>Hesap Toplamı</Text>
      <Text
        style={[styles.totalAmount, total < 0 && styles.totalAmountNegative]}
      >
        {formatCurrency(total)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  totalCard: {
    backgroundColor: "#111827",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  totalAmountNegative: {
    color: "#f87171",
  },
});
