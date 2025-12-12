// IslemSummary Component

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { formatCurrency } from "../../../shared/utils";

interface IslemSummaryProps {
  totalGelir: number;
  totalGider: number;
  netAmount: number;
}

export const IslemSummary: React.FC<IslemSummaryProps> = ({
  totalGelir,
  totalGider,
  netAmount,
}) => {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryItem}>
        <ArrowDownLeft size={16} color="#10b981" />
        <Text style={styles.summaryLabel}>Gelir</Text>
        <Text style={styles.summaryAmountPositive}>
          {formatCurrency(totalGelir)}
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <ArrowUpRight size={16} color="#ef4444" />
        <Text style={styles.summaryLabel}>Gider</Text>
        <Text style={styles.summaryAmountNegative}>
          {formatCurrency(totalGider)}
        </Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Net</Text>
        <Text
          style={[
            styles.summaryAmountNet,
            { color: netAmount >= 0 ? "#10b981" : "#ef4444" },
          ]}
        >
          {formatCurrency(netAmount)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryAmountPositive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10b981",
  },
  summaryAmountNegative: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ef4444",
  },
  summaryAmountNet: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
});
