// OdemeSummary Component

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RefreshCw, Calendar, AlertCircle } from "lucide-react-native";
import { formatCurrency } from "../../../shared/utils";

interface OdemeSummaryProps {
  activeCount: number;
  totalMonthly: number;
  overdueCount: number;
}

export const OdemeSummary: React.FC<OdemeSummaryProps> = ({
  activeCount,
  totalMonthly,
  overdueCount,
}) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryItem}>
        <RefreshCw size={20} color="#8b5cf6" />
        <Text style={styles.summaryValue}>{activeCount}</Text>
        <Text style={styles.summaryLabel}>Aktif Ödeme</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Calendar size={20} color="#10b981" />
        <Text style={styles.summaryValue}>{formatCurrency(totalMonthly)}</Text>
        <Text style={styles.summaryLabel}>Aylık Toplam</Text>
      </View>
      {overdueCount > 0 && (
        <>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {overdueCount}
            </Text>
            <Text style={styles.summaryLabel}>Gecikmiş</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
});
