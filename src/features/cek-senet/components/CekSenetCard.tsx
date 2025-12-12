// CekSenetCard Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { CekSenet } from "../../../types";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { statusLabels, statusColors, COLORS } from "../constants";

interface CekSenetCardProps {
  item: CekSenet;
  onPress?: () => void;
}

export const CekSenetCard: React.FC<CekSenetCardProps> = ({
  item,
  onPress,
}) => {
  const isAlacak = item.direction === "alacak";
  const colors = isAlacak ? COLORS.alacak : COLORS.borc;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardLeft}>
        <View style={[styles.cardIcon, { backgroundColor: colors.bg }]}>
          {isAlacak ? (
            <ArrowDownLeft size={24} color={colors.icon} />
          ) : (
            <ArrowUpRight size={24} color={colors.icon} />
          )}
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardType}>
              {item.type === "cek" ? "Çek" : "Senet"}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[item.status] + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColors[item.status] },
                ]}
              >
                {statusLabels[item.status]}
              </Text>
            </View>
          </View>
          {item.cari && <Text style={styles.cardCari}>{item.cari.name}</Text>}
          <View style={styles.cardMeta}>
            <Calendar size={12} color="#6b7280" />
            <Text style={styles.cardDate}>
              Vade: {formatDate(item.due_date)}
            </Text>
          </View>
          {item.document_no && (
            <Text style={styles.cardSerial}>No: {item.document_no}</Text>
          )}
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.cardAmount, { color: colors.text }]}>
          {isAlacak ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
        <Text style={styles.cardDirection}>{isAlacak ? "Alacak" : "Borç"}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardCari: {
    fontSize: 14,
    color: "#6366f1",
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  cardSerial: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDirection: {
    fontSize: 12,
    color: "#9ca3af",
  },
});
