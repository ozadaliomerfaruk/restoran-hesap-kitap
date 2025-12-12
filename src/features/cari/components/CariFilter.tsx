// CariFilter Component - Filtre butonları

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CariFilter as FilterType } from "../types";

interface CariFilterProps {
  filter: FilterType;
  counts: {
    all: number;
    tedarikci: number;
    musteri: number;
  };
  onFilterChange: (filter: FilterType) => void;
}

export const CariFilter: React.FC<CariFilterProps> = ({
  filter,
  counts,
  onFilterChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, filter === "all" && styles.btnActive]}
        onPress={() => onFilterChange("all")}
      >
        <Text style={[styles.text, filter === "all" && styles.textActive]}>
          Tümü ({counts.all})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, filter === "tedarikci" && styles.btnActive]}
        onPress={() => onFilterChange("tedarikci")}
      >
        <Text
          style={[styles.text, filter === "tedarikci" && styles.textActive]}
        >
          Tedarikçi ({counts.tedarikci})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, filter === "musteri" && styles.btnActive]}
        onPress={() => onFilterChange("musteri")}
      >
        <Text style={[styles.text, filter === "musteri" && styles.textActive]}>
          Müşteri ({counts.musteri})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  btnActive: {
    backgroundColor: "#3b82f6",
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  textActive: {
    color: "#fff",
  },
});
