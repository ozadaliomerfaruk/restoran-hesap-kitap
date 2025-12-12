/**
 * Finansal Özet Panel
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Wallet, Scale } from "lucide-react-native";
import { colors, spacing, borderRadius, textStyles } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";

interface FinansalOzetPanelProps {
  toplamHesaplar: number;
  tedarikcidenAlacak: number;
  musterilerdenAlacak: number;
  personeldenAlacak: number;
  tedarikciyeBorcumuz: number;
  musterilereBorcumuz: number;
  personeleBorcumuz: number;
  toplamAlacaklar: number;
  toplamBorclar: number;
  netDurum: number;
}

export function FinansalOzetPanel({
  toplamHesaplar,
  tedarikcidenAlacak,
  musterilerdenAlacak,
  personeldenAlacak,
  tedarikciyeBorcumuz,
  musterilereBorcumuz,
  personeleBorcumuz,
  toplamAlacaklar,
  toplamBorclar,
  netDurum,
}: FinansalOzetPanelProps) {
  return (
    <View style={styles.container}>
      {/* Üst Satır */}
      <View style={styles.row}>
        {/* Varlıklar */}
        <View style={styles.column}>
          <View style={styles.header}>
            <TrendingUp size={16} color={colors.success.main} />
            <Text style={[styles.headerText, { color: colors.success.main }]}>
              Varlıklar
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Wallet size={16} color={colors.info.main} />
            <Text style={styles.itemLabel}>Hesaplarım</Text>
            <Text
              style={[styles.itemValue, toplamHesaplar < 0 && styles.negative]}
            >
              {formatCurrency(toplamHesaplar)}
            </Text>
          </View>

          {tedarikcidenAlacak > 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Tedarikçilerden</Text>
              <Text style={styles.subValue}>
                {formatCurrency(tedarikcidenAlacak)}
              </Text>
            </View>
          )}

          {musterilerdenAlacak > 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Müşterilerden</Text>
              <Text style={styles.subValue}>
                {formatCurrency(musterilerdenAlacak)}
              </Text>
            </View>
          )}

          {personeldenAlacak > 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Personelden</Text>
              <Text style={styles.subValue}>
                {formatCurrency(personeldenAlacak)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={[styles.totalValue, { color: colors.success.main }]}>
              {formatCurrency(toplamHesaplar + toplamAlacaklar)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Borçlar */}
        <View style={styles.column}>
          <View style={styles.header}>
            <TrendingDown size={16} color={colors.error.main} />
            <Text style={[styles.headerText, { color: colors.error.main }]}>
              Borçlar
            </Text>
          </View>

          {tedarikciyeBorcumuz > 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Tedarikçilere</Text>
              <Text style={[styles.subValue, styles.negative]}>
                {formatCurrency(tedarikciyeBorcumuz)}
              </Text>
            </View>
          )}

          {personeleBorcumuz > 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Personele</Text>
              <Text style={[styles.subValue, styles.negative]}>
                {formatCurrency(personeleBorcumuz)}
              </Text>
            </View>
          )}

          {musterilereBorcumuz > 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Müşterilere</Text>
              <Text style={[styles.subValue, styles.negative]}>
                {formatCurrency(musterilereBorcumuz)}
              </Text>
            </View>
          )}

          {toplamBorclar === 0 && (
            <View style={styles.subItem}>
              <Text style={styles.subLabel}>Borcunuz yok</Text>
              <Text style={styles.subValue}>₺0</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={[styles.totalValue, { color: colors.error.main }]}>
              {toplamBorclar > 0 ? "-" : ""}
              {formatCurrency(toplamBorclar)}
            </Text>
          </View>
        </View>
      </View>

      {/* Net Durum */}
      <View
        style={[
          styles.netBox,
          netDurum >= 0 ? styles.netPositive : styles.netNegative,
        ]}
      >
        <View style={styles.netLeft}>
          <Scale
            size={20}
            color={netDurum >= 0 ? colors.success.main : colors.error.main}
          />
          <Text style={styles.netLabel}>Net Durum</Text>
        </View>
        <Text
          style={[
            styles.netValue,
            { color: netDurum >= 0 ? colors.success.main : colors.error.main },
          ]}
        >
          {netDurum >= 0 ? "+" : ""}
          {formatCurrency(netDurum)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.md,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  mainItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 22,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  subValue: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.success.main,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  negative: {
    color: colors.error.main,
  },
  netBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: borderRadius.md,
    padding: 14,
    marginTop: spacing.md,
  },
  netPositive: {
    backgroundColor: colors.success.light,
  },
  netNegative: {
    backgroundColor: colors.error.light,
  },
  netLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  netLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  netValue: {
    fontSize: 20,
    fontWeight: "700",
  },
});

export default FinansalOzetPanel;
