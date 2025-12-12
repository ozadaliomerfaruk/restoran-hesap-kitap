// FilterModal Component

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { X, TrendingUp, BarChart3, Tag, Trash2 } from "lucide-react-native";
import { FilterType } from "../types";
import { UrunKategorisi } from "../../../types";

interface FilterModalProps {
  visible: boolean;
  filterType: FilterType;
  selectedKategori: string | null;
  tumKategoriler: string[];
  urunKategorileri: UrunKategorisi[];
  onClose: () => void;
  onSelectFilter: (type: FilterType) => void;
  onSelectKategori: (kategori: string) => void;
  onKategoriSil: (kategori: UrunKategorisi) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filterType,
  selectedKategori,
  tumKategoriler,
  urunKategorileri,
  onClose,
  onSelectFilter,
  onSelectKategori,
  onKategoriSil,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtrele & Sırala</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Sıralama */}
            <Text style={styles.sectionTitle}>Sıralama</Text>
            <TouchableOpacity
              style={[
                styles.option,
                filterType === "en_cok_satan" && styles.optionActive,
              ]}
              onPress={() => {
                onSelectFilter("en_cok_satan");
                onClose();
              }}
            >
              <TrendingUp
                size={20}
                color={filterType === "en_cok_satan" ? "#8b5cf6" : "#6b7280"}
              />
              <Text
                style={[
                  styles.optionText,
                  filterType === "en_cok_satan" && styles.optionTextActive,
                ]}
              >
                En Çok Satan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.option,
                filterType === "en_cok_ciro" && styles.optionActive,
              ]}
              onPress={() => {
                onSelectFilter("en_cok_ciro");
                onClose();
              }}
            >
              <BarChart3
                size={20}
                color={filterType === "en_cok_ciro" ? "#8b5cf6" : "#6b7280"}
              />
              <Text
                style={[
                  styles.optionText,
                  filterType === "en_cok_ciro" && styles.optionTextActive,
                ]}
              >
                En Çok Ciro
              </Text>
            </TouchableOpacity>

            {/* Kategoriler */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Kategoriye Göre
            </Text>
            {tumKategoriler.map((kat) => {
              const isActive =
                filterType === "kategori" && selectedKategori === kat;
              const dbKat = urunKategorileri.find((k) => k.name === kat);
              return (
                <View key={kat} style={styles.kategoriRow}>
                  <TouchableOpacity
                    style={[
                      styles.option,
                      styles.kategoriOption,
                      isActive && styles.optionActive,
                    ]}
                    onPress={() => {
                      onSelectFilter("kategori");
                      onSelectKategori(kat);
                      onClose();
                    }}
                  >
                    <Tag size={18} color={isActive ? "#8b5cf6" : "#6b7280"} />
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {kat}
                    </Text>
                  </TouchableOpacity>
                  {dbKat && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => onKategoriSil(dbKat)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {filterType && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                onSelectFilter(null);
                onClose();
              }}
            >
              <Text style={styles.clearBtnText}>Filtreyi Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827" },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
  },
  optionActive: { backgroundColor: "#f3e8ff" },
  optionText: { fontSize: 15, color: "#374151" },
  optionTextActive: { color: "#8b5cf6", fontWeight: "600" },
  kategoriRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  kategoriOption: { flex: 1 },
  deleteBtn: { padding: 14, marginLeft: 8 },
  clearBtn: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  clearBtnText: { fontSize: 15, fontWeight: "600", color: "#ef4444" },
});
