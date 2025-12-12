// ArchivedItemCard Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArchiveRestore, Trash2 } from "lucide-react-native";
import { ArchivedItem, ArsivTabType } from "../types";
import { getIconConfig, getSubtitle } from "../constants";
import { formatCurrency, formatDate } from "../../../shared/utils";

interface ArchivedItemCardProps {
  item: ArchivedItem;
  tabType: ArsivTabType;
  loading: boolean;
  onRestore: () => void;
  onDelete: () => void;
}

export const ArchivedItemCard: React.FC<ArchivedItemCardProps> = ({
  item,
  tabType,
  loading,
  onRestore,
  onDelete,
}) => {
  const iconConfig = getIconConfig(item, tabType);
  const IconComponent = iconConfig.icon;
  const subtitle = getSubtitle(item, tabType);

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <View
          style={[styles.itemIcon, { backgroundColor: iconConfig.bgColor }]}
        >
          <IconComponent size={22} color={iconConfig.color} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
          <Text style={styles.itemDate}>
            Arşivlenme: {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.itemBalance,
            item.balance < 0 && styles.negativeBalance,
          ]}
        >
          {formatCurrency(item.balance)}
        </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={onRestore}
            disabled={loading}
          >
            <ArchiveRestore size={18} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            disabled={loading}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  itemDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  itemBalance: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  negativeBalance: {
    color: "#ef4444",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  restoreBtn: {
    backgroundColor: "#dcfce7",
    padding: 8,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 8,
  },
});
