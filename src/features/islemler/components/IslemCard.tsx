// IslemCard Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { Islem } from "../../../types";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { CreatedByBadge } from "../../../shared/components/ui/CreatedByBadge";
import { colors, spacing } from "../../../shared/constants";

interface IslemCardProps {
  item: Islem;
  onPress?: () => void;
}

export const IslemCard: React.FC<IslemCardProps> = ({ item, onPress }) => {
  const isIncome = item.type === "gelir" || item.type === "tahsilat";

  return (
    <TouchableOpacity style={styles.islemCard} onPress={onPress}>
      <View style={styles.islemLeft}>
        <View
          style={[
            styles.islemIcon,
            { backgroundColor: isIncome ? "#dcfce7" : "#fee2e2" },
          ]}
        >
          {isIncome ? (
            <ArrowDownLeft size={20} color="#10b981" />
          ) : (
            <ArrowUpRight size={20} color="#ef4444" />
          )}
        </View>
        <View style={styles.islemInfo}>
          <Text style={styles.islemDescription} numberOfLines={1}>
            {item.description || (isIncome ? "Gelir" : "Gider")}
          </Text>
          <Text style={styles.islemMeta}>
            {item.kasa?.name || "Kasa"} • {formatDate(item.date, "dayMonth")}
          </Text>
          {/* Kullanıcı Etiketi */}
          {item.created_by_user && (
            <View style={styles.userRow}>
              <CreatedByBadge user={item.created_by_user} size="small" />
            </View>
          )}
        </View>
      </View>
      <Text
        style={[
          styles.islemAmount,
          { color: isIncome ? "#10b981" : "#ef4444" },
        ]}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  islemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  islemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  islemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: {
    flex: 1,
  },
  islemDescription: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  islemMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  userRow: {
    marginTop: 4,
  },
  islemAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
});
