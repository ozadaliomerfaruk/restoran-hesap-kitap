/**
 * Kredi Kartı Özet
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "lucide-react-native";
import { colors, spacing, borderRadius } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { Kasa } from "@/types";

interface KrediKartiOzetProps {
  kasa: Kasa;
}

export function KrediKartiOzet({ kasa }: KrediKartiOzetProps) {
  if (kasa.type !== "kredi_karti") return null;

  const usagePercent = Math.min(
    (kasa.balance / (kasa.credit_limit || 1)) * 100,
    100
  );
  const isHighUsage = usagePercent > 80;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kredi Kartı Özeti</Text>

      {/* Limit Çubuğu */}
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              {
                width: `${usagePercent}%`,
                backgroundColor: isHighUsage ? "#ef4444" : "#f59e0b",
              },
            ]}
          />
        </View>
        <Text style={styles.barText}>
          {Math.round(usagePercent)}% kullanıldı
        </Text>
      </View>

      {/* İstatistikler */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Toplam Limit</Text>
          <Text style={styles.statValue}>
            {formatCurrency(kasa.credit_limit || 0)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Kullanılan</Text>
          <Text style={[styles.statValue, { color: "#ef4444" }]}>
            {formatCurrency(kasa.balance)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Kullanılabilir</Text>
          <Text style={[styles.statValue, { color: "#10b981" }]}>
            {formatCurrency((kasa.credit_limit || 0) - kasa.balance)}
          </Text>
        </View>
      </View>

      {/* Tarihler */}
      <View style={styles.dates}>
        <View style={styles.dateItem}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.dateLabel}>Ekstre Kesim:</Text>
          <Text style={styles.dateValue}>
            Her ayın {kasa.billing_day || 1}. günü
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.dateLabel}>Son Ödeme:</Text>
          <Text style={styles.dateValue}>
            Her ayın {kasa.due_day || 15}. günü
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  barContainer: {
    marginBottom: 16,
  },
  barBackground: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 6,
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  barText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
  stats: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  dates: {
    gap: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});

export default KrediKartiOzet;
