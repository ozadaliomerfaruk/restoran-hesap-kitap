// UrunOzetCard Component - Ürün özet istatistikleri

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Package, Hash, TrendingUp } from "lucide-react-native";
import { UrunStats } from "../types";
import { formatCurrency } from "../../../shared/utils";

interface UrunOzetCardProps {
  stats: UrunStats;
}

export const UrunOzetCard: React.FC<UrunOzetCardProps> = ({ stats }) => {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIconBox}>
        <Package size={32} color="#8b5cf6" />
      </View>
      <View style={styles.summaryStats}>
        <View style={styles.statItem}>
          <Hash size={16} color="#6b7280" />
          <Text style={styles.statValue}>{stats.toplamAdet}</Text>
          <Text style={styles.statLabel}>Toplam Satış</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <TrendingUp size={16} color="#6b7280" />
          <Text style={styles.statValue}>
            {formatCurrency(stats.toplamCiro)}
          </Text>
          <Text style={styles.statLabel}>Toplam Ciro</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  summaryStats: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
});
