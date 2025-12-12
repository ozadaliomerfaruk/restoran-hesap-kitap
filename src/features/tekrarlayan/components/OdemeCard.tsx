// OdemeCard Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { RefreshCw, Calendar, AlertCircle } from "lucide-react-native";
import { TekrarlayanOdeme } from "../../../types";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { periodLabels, isOverdue, isDueSoon } from "../constants";

interface OdemeCardProps {
  item: TekrarlayanOdeme;
  onPress?: () => void;
}

export const OdemeCard: React.FC<OdemeCardProps> = ({ item, onPress }) => {
  const overdue = isOverdue(item.next_date);
  const dueSoon = isDueSoon(item.next_date);

  return (
    <TouchableOpacity
      style={[
        styles.odemeCard,
        overdue && styles.odemeCardOverdue,
        dueSoon && !overdue && styles.odemeCardDueSoon,
      ]}
      onPress={onPress}
    >
      <View style={styles.odemeLeft}>
        <View
          style={[
            styles.odemeIcon,
            overdue && styles.odemeIconOverdue,
            dueSoon && !overdue && styles.odemeIconDueSoon,
          ]}
        >
          {overdue ? (
            <AlertCircle size={24} color="#ef4444" />
          ) : (
            <RefreshCw size={24} color={dueSoon ? "#f59e0b" : "#8b5cf6"} />
          )}
        </View>
        <View style={styles.odemeInfo}>
          <Text style={styles.odemeName}>{item.title}</Text>
          <View style={styles.odemeMeta}>
            <Calendar size={12} color="#6b7280" />
            <Text
              style={[styles.odemeDate, overdue && styles.odemeDateOverdue]}
            >
              {overdue ? "Gecikti: " : ""}
              {formatDate(item.next_date, "dayMonth")}
            </Text>
            <Text style={styles.odemeFrequency}>
              • {periodLabels[item.period] || item.period}
            </Text>
          </View>
          {item.cari && <Text style={styles.odemeCari}>{item.cari.name}</Text>}
        </View>
      </View>
      <Text style={[styles.odemeAmount, overdue && styles.odemeAmountOverdue]}>
        {formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  odemeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  odemeCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  odemeCardDueSoon: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  odemeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  odemeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  odemeIconOverdue: {
    backgroundColor: "#fee2e2",
  },
  odemeIconDueSoon: {
    backgroundColor: "#fef3c7",
  },
  odemeInfo: {
    flex: 1,
    gap: 2,
  },
  odemeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  odemeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  odemeDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  odemeDateOverdue: {
    color: "#ef4444",
    fontWeight: "500",
  },
  odemeFrequency: {
    fontSize: 13,
    color: "#9ca3af",
  },
  odemeCari: {
    fontSize: 13,
    color: "#8b5cf6",
    marginTop: 2,
  },
  odemeAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
  odemeAmountOverdue: {
    color: "#ef4444",
  },
});
