// CekSenetSummary Component - Özet kartlar

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { formatCurrency } from "../../../shared/utils";

interface CekSenetSummaryProps {
  bekleyenAlacak: number;
  bekleyenBorc: number;
}

export const CekSenetSummary: React.FC<CekSenetSummaryProps> = ({
  bekleyenAlacak,
  bekleyenBorc,
}) => {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryCard, styles.summaryCardGreen]}>
        <ArrowDownLeft size={20} color="#10b981" />
        <Text style={styles.summaryLabel}>Bekleyen Alacak</Text>
        <Text style={[styles.summaryValue, { color: "#10b981" }]}>
          {formatCurrency(bekleyenAlacak)}
        </Text>
      </View>
      <View style={[styles.summaryCard, styles.summaryCardRed]}>
        <ArrowUpRight size={20} color="#ef4444" />
        <Text style={styles.summaryLabel}>Bekleyen Borç</Text>
        <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
          {formatCurrency(bekleyenBorc)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCardGreen: {
    borderTopWidth: 3,
    borderTopColor: "#10b981",
  },
  summaryCardRed: {
    borderTopWidth: 3,
    borderTopColor: "#ef4444",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
