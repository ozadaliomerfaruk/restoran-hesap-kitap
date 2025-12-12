/**
 * FaturaSummary Component
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formatCurrency } from "../../../../shared/utils";
import { styles } from "./styles";
import { FaturaSummaryProps } from "./types";

export const FaturaSummary: React.FC<FaturaSummaryProps> = ({
  araToplam,
  toplamKdv,
  genelToplam,
  loading,
  onSave,
  faturaTipi,
}) => {
  return (
    <>
      {/* Özet */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ara Toplam</Text>
          <Text style={styles.summaryValue}>{formatCurrency(araToplam)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Toplam KDV</Text>
          <Text style={styles.summaryValue}>{formatCurrency(toplamKdv)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryTotalRow}>
          <Text style={styles.summaryTotalLabel}>Genel Toplam</Text>
          <Text style={styles.summaryTotalValue}>
            {formatCurrency(genelToplam)}
          </Text>
        </View>
      </View>

      {/* Kaydet Butonu */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={onSave}
        disabled={loading}
      >
        <Text style={styles.saveBtnText}>
          {loading
            ? "Kaydediliyor..."
            : faturaTipi === "alis"
            ? "Alış Faturasını Kaydet"
            : "İade Faturasını Kaydet"}
        </Text>
      </TouchableOpacity>
    </>
  );
};
