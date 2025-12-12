// ArsivTabs Component

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Building2, UserCheck, Wallet } from "lucide-react-native";
import { ArsivTabType } from "../types";

interface ArsivTabsProps {
  activeTab: ArsivTabType;
  counts: {
    cariler: number;
    personel: number;
    hesaplar: number;
  };
  onTabChange: (tab: ArsivTabType) => void;
}

export const ArsivTabs: React.FC<ArsivTabsProps> = ({
  activeTab,
  counts,
  onTabChange,
}) => {
  const tabs = [
    {
      key: "cariler" as ArsivTabType,
      label: "Cariler",
      icon: Building2,
      count: counts.cariler,
    },
    {
      key: "personel" as ArsivTabType,
      label: "Personel",
      icon: UserCheck,
      count: counts.personel,
    },
    {
      key: "hesaplar" as ArsivTabType,
      label: "Hesaplar",
      icon: Wallet,
      count: counts.hesaplar,
    },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.icon;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(tab.key)}
          >
            <IconComponent size={18} color={isActive ? "#3b82f6" : "#6b7280"} />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tabActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});
