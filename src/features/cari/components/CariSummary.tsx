// CariSummary Component - Özet kartları

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatCurrency } from "../../../shared/utils";

interface CariSummaryProps {
  toplamTedarikciBorc: number;
  toplamMusteriAlacak: number;
}

export const CariSummary: React.FC<CariSummaryProps> = ({
  toplamTedarikciBorc,
  toplamMusteriAlacak,
}) => {
  if (toplamTedarikciBorc <= 0 && toplamMusteriAlacak <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {toplamTedarikciBorc > 0 && (
        <View style={[styles.card, { borderLeftColor: "#ef4444" }]}>
          <Text style={styles.label}>Tedarikçi Borcu</Text>
          <Text style={[styles.amount, { color: "#ef4444" }]}>
            {formatCurrency(toplamTedarikciBorc)}
          </Text>
        </View>
      )}
      {toplamMusteriAlacak > 0 && (
        <View style={[styles.card, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.label}>Müşteri Alacağı</Text>
          <Text style={[styles.amount, { color: "#10b981" }]}>
            {formatCurrency(toplamMusteriAlacak)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
