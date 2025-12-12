// CekSenetFilter Component

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { FilterType, DirectionFilter } from "../types";

interface CekSenetFilterProps {
  typeFilter: FilterType;
  directionFilter: DirectionFilter;
  onTypeChange: (type: FilterType) => void;
  onDirectionChange: (direction: DirectionFilter) => void;
}

export const CekSenetFilter: React.FC<CekSenetFilterProps> = ({
  typeFilter,
  directionFilter,
  onTypeChange,
  onDirectionChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {/* Type Filters */}
      <TouchableOpacity
        style={[
          styles.filterChip,
          typeFilter === "all" && styles.filterChipActive,
        ]}
        onPress={() => onTypeChange("all")}
      >
        <Text
          style={[
            styles.filterChipText,
            typeFilter === "all" && styles.filterChipTextActive,
          ]}
        >
          Tümü
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          typeFilter === "cek" && styles.filterChipActive,
        ]}
        onPress={() => onTypeChange("cek")}
      >
        <Text
          style={[
            styles.filterChipText,
            typeFilter === "cek" && styles.filterChipTextActive,
          ]}
        >
          Çekler
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          typeFilter === "senet" && styles.filterChipActive,
        ]}
        onPress={() => onTypeChange("senet")}
      >
        <Text
          style={[
            styles.filterChipText,
            typeFilter === "senet" && styles.filterChipTextActive,
          ]}
        >
          Senetler
        </Text>
      </TouchableOpacity>

      <View style={styles.filterDivider} />

      {/* Direction Filters */}
      <TouchableOpacity
        style={[
          styles.filterChip,
          directionFilter === "alacak" && styles.filterChipActiveGreen,
        ]}
        onPress={() =>
          onDirectionChange(directionFilter === "alacak" ? "all" : "alacak")
        }
      >
        <ArrowDownLeft
          size={14}
          color={directionFilter === "alacak" ? "#fff" : "#10b981"}
        />
        <Text
          style={[
            styles.filterChipText,
            directionFilter === "alacak" && styles.filterChipTextActive,
          ]}
        >
          Alacak
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterChip,
          directionFilter === "borc" && styles.filterChipActiveRed,
        ]}
        onPress={() =>
          onDirectionChange(directionFilter === "borc" ? "all" : "borc")
        }
      >
        <ArrowUpRight
          size={14}
          color={directionFilter === "borc" ? "#fff" : "#ef4444"}
        />
        <Text
          style={[
            styles.filterChipText,
            directionFilter === "borc" && styles.filterChipTextActive,
          ]}
        >
          Borç
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
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
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
  },
});
