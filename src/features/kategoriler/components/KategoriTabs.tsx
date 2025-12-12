// KategoriTabs Component - Gelir/Gider tab seçici

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { KategoriTab } from "../types";

interface KategoriTabsProps {
  activeTab: KategoriTab;
  onTabChange: (tab: KategoriTab) => void;
}

export const KategoriTabs: React.FC<KategoriTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "gider" && styles.tabActiveGider]}
        onPress={() => onTabChange("gider")}
      >
        <ArrowUpRight
          size={18}
          color={activeTab === "gider" ? "#fff" : "#ef4444"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "gider" && styles.tabTextActive,
          ]}
        >
          Gider Kategorileri
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "gelir" && styles.tabActiveGelir]}
        onPress={() => onTabChange("gelir")}
      >
        <ArrowDownLeft
          size={18}
          color={activeTab === "gelir" ? "#fff" : "#10b981"}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === "gelir" && styles.tabTextActive,
          ]}
        >
          Gelir Kategorileri
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  tabActiveGider: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  tabActiveGelir: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  tabTextActive: {
    color: "#fff",
  },
});
