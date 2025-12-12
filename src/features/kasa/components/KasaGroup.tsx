// KasaGroup Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import { KasaGroupConfig, KasaGroupData } from "../types";
import { KasaItem } from "./KasaItem";
import { formatCurrency } from "../../../shared/utils";
import { Kasa } from "../../../types";

interface KasaGroupProps {
  group: KasaGroupConfig;
  data: KasaGroupData;
  isExpanded: boolean;
  onToggle: () => void;
  onKasaPress: (kasa: Kasa) => void;
}

export const KasaGroup: React.FC<KasaGroupProps> = ({
  group,
  data,
  isExpanded,
  onToggle,
  onKasaPress,
}) => {
  const IconComponent = group.icon;

  // Grup boşsa gösterme
  if (data.kasalar.length === 0) return null;

  return (
    <View style={styles.groupContainer}>
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.groupLeft}>
          <View style={[styles.groupIcon, { backgroundColor: group.bgColor }]}>
            <IconComponent size={20} color={group.color} />
          </View>
          <Text style={styles.groupTitle}>{group.label}</Text>
          <View style={styles.groupCount}>
            <Text style={styles.groupCountText}>{data.kasalar.length}</Text>
          </View>
        </View>
        <View style={styles.groupRight}>
          <Text
            style={[
              styles.groupTotal,
              data.total < 0 && styles.groupTotalNegative,
            ]}
          >
            {formatCurrency(data.total)}
          </Text>
          {isExpanded ? (
            <ChevronUp size={20} color="#6b7280" />
          ) : (
            <ChevronDown size={20} color="#6b7280" />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.groupContent}>
          {data.kasalar.map((kasa) => (
            <KasaItem
              key={kasa.id}
              kasa={kasa}
              onPress={() => onKasaPress(kasa)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  groupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  groupCount: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  groupRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  groupTotalNegative: {
    color: "#ef4444",
  },
  groupContent: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
});
