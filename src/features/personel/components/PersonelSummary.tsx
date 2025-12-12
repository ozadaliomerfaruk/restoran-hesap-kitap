// PersonelSummary Component - Özet kartları

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatCurrency } from "../../../shared/utils";

interface PersonelSummaryProps {
  personelCount: number;
  toplamBorcumuz: number;
  toplamAlacagimiz: number;
}

export const PersonelSummary: React.FC<PersonelSummaryProps> = ({
  personelCount,
  toplamBorcumuz,
  toplamAlacagimiz,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.card, { borderLeftColor: "#3b82f6" }]}>
          <Text style={styles.label}>Toplam Personel</Text>
          <Text style={styles.value}>{personelCount} kişi</Text>
        </View>

        {toplamBorcumuz > 0 && (
          <View style={[styles.card, { borderLeftColor: "#ef4444" }]}>
            <Text style={styles.label}>Personele Borç</Text>
            <Text style={[styles.value, { color: "#ef4444" }]}>
              {formatCurrency(toplamBorcumuz)}
            </Text>
          </View>
        )}

        {toplamAlacagimiz > 0 && (
          <View style={[styles.card, { borderLeftColor: "#10b981" }]}>
            <Text style={styles.label}>Personelden Alacak</Text>
            <Text style={[styles.value, { color: "#10b981" }]}>
              {formatCurrency(toplamAlacagimiz)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
});
