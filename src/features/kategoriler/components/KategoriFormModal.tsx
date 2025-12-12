// KategoriFormModal Component - Kategori ekleme/düzenleme modalı

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Check, ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { Kategori } from "../../../types";
import { KategoriTab, KategoriFormState } from "../types";

interface KategoriFormModalProps {
  visible: boolean;
  editingKategori: Kategori | null;
  formState: KategoriFormState;
  parentCategories: Kategori[];
  loading: boolean;
  onNameChange: (name: string) => void;
  onTypeChange: (type: KategoriTab) => void;
  onParentChange: (parentId: string | null) => void;
  onSave: () => void;
  onClose: () => void;
}

export const KategoriFormModal: React.FC<KategoriFormModalProps> = ({
  visible,
  editingKategori,
  formState,
  parentCategories,
  loading,
  onNameChange,
  onTypeChange,
  onParentChange,
  onSave,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingKategori ? "Kategori Düzenle" : "Yeni Kategori"}
          </Text>
          <TouchableOpacity onPress={onSave} disabled={loading}>
            <Check size={24} color={loading ? "#9ca3af" : "#10b981"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Kategori Adı */}
          <Text style={styles.formLabel}>Kategori Adı</Text>
          <TextInput
            style={styles.input}
            value={formState.name}
            onChangeText={onNameChange}
            placeholder="Örn: Tedarikçi, Personel, Fatura"
            placeholderTextColor="#9ca3af"
          />

          {/* Tür */}
          <Text style={styles.formLabel}>Kategori Türü</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                formState.type === "gider" && styles.typeBtnActiveGider,
              ]}
              onPress={() => onTypeChange("gider")}
            >
              <ArrowUpRight
                size={18}
                color={formState.type === "gider" ? "#fff" : "#ef4444"}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  formState.type === "gider" && styles.typeBtnTextActive,
                ]}
              >
                Gider
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                formState.type === "gelir" && styles.typeBtnActiveGelir,
              ]}
              onPress={() => onTypeChange("gelir")}
            >
              <ArrowDownLeft
                size={18}
                color={formState.type === "gelir" ? "#fff" : "#10b981"}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  formState.type === "gelir" && styles.typeBtnTextActive,
                ]}
              >
                Gelir
              </Text>
            </TouchableOpacity>
          </View>

          {/* Üst Kategori */}
          <Text style={styles.formLabel}>Üst Kategori (Opsiyonel)</Text>
          <View style={styles.parentList}>
            <TouchableOpacity
              style={[
                styles.parentItem,
                !formState.parentId && styles.parentItemActive,
              ]}
              onPress={() => onParentChange(null)}
            >
              <Text
                style={[
                  styles.parentItemText,
                  !formState.parentId && styles.parentItemTextActive,
                ]}
              >
                Ana Kategori
              </Text>
            </TouchableOpacity>
            {parentCategories.map((parent) => (
              <TouchableOpacity
                key={parent.id}
                style={[
                  styles.parentItem,
                  formState.parentId === parent.id && styles.parentItemActive,
                ]}
                onPress={() => onParentChange(parent.id)}
              >
                <Text
                  style={[
                    styles.parentItemText,
                    formState.parentId === parent.id &&
                      styles.parentItemTextActive,
                  ]}
                >
                  {parent.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  typeBtnActiveGider: {
    backgroundColor: "#ef4444",
  },
  typeBtnActiveGelir: {
    backgroundColor: "#10b981",
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  typeBtnTextActive: {
    color: "#fff",
  },
  parentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  parentItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  parentItemActive: {
    backgroundColor: "#3b82f6",
  },
  parentItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  parentItemTextActive: {
    color: "#fff",
  },
});
