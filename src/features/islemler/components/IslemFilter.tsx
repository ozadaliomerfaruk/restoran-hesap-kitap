// IslemFilter Component

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { IslemFilterType } from "../types";

interface IslemFilterProps {
  filter: IslemFilterType;
  onFilterChange: (filter: IslemFilterType) => void;
}

export const IslemFilter: React.FC<IslemFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <View>
      {/* Search Row */}
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <Text style={styles.searchText}>İşlem ara...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "all" && styles.filterChipActive,
          ]}
          onPress={() => onFilterChange("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "all" && styles.filterChipTextActive,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "gelir" && styles.filterChipActiveGreen,
          ]}
          onPress={() => onFilterChange("gelir")}
        >
          <ArrowDownLeft
            size={14}
            color={filter === "gelir" ? "#fff" : "#10b981"}
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "gelir" && styles.filterChipTextActive,
            ]}
          >
            Gelirler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "gider" && styles.filterChipActiveRed,
          ]}
          onPress={() => onFilterChange("gider")}
        >
          <ArrowUpRight
            size={14}
            color={filter === "gider" ? "#fff" : "#ef4444"}
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "gider" && styles.filterChipTextActive,
            ]}
          >
            Giderler
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchText: {
    color: "#9ca3af",
    fontSize: 15,
  },
  filterButton: {
    backgroundColor: "#fff",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersContainer: {
    marginTop: 16,
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    gap: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  filterChipActiveGreen: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  filterChipActiveRed: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  filterChipText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
});
