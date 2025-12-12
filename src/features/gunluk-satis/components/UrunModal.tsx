// UrunModal Component - Yeni ürün ekleme

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Check, ChevronDown, Plus } from "lucide-react-native";
import { BIRIMLER } from "../types";

interface UrunModalProps {
  visible: boolean;
  tumKategoriler: string[];
  loading: boolean;
  onClose: () => void;
  onSave: (
    name: string,
    category: string,
    price: string,
    unit: string
  ) => Promise<boolean>;
  onKategoriEkle: () => void;
}

export const UrunModal: React.FC<UrunModalProps> = ({
  visible,
  tumKategoriler,
  loading,
  onClose,
  onSave,
  onKategoriEkle,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Adet");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const handleSave = async () => {
    const success = await onSave(name, category, price, unit);
    if (success) {
      setName("");
      setCategory("");
      setPrice("");
      setUnit("Adet");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Yeni Ürün Ekle</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Check size={24} color={loading ? "#d1d5db" : "#8b5cf6"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Ürün Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: Adana Kebap"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Kategori *</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text
              style={[styles.selectText, !category && styles.selectPlaceholder]}
            >
              {category || "Kategori seçin"}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={styles.addKatBtn}
                onPress={onKategoriEkle}
              >
                <Plus size={18} color="#8b5cf6" />
                <Text style={styles.addKatText}>Yeni Kategori Ekle</Text>
              </TouchableOpacity>
              {tumKategoriler.map((kat) => (
                <TouchableOpacity
                  key={kat}
                  style={[
                    styles.pickerItem,
                    category === kat && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setCategory(kat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      category === kat && styles.pickerItemTextActive,
                    ]}
                  >
                    {kat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Satış Fiyatı</Text>
          <View style={styles.priceBox}>
            <Text style={styles.currency}>₺</Text>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <Text style={styles.label}>Birim</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowUnitPicker(!showUnitPicker)}
          >
            <Text style={styles.selectText}>{unit}</Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>
          {showUnitPicker && (
            <View style={styles.pickerContainer}>
              {BIRIMLER.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[
                    styles.pickerItem,
                    unit === b && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setUnit(b);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      unit === b && styles.pickerItemTextActive,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827" },
  content: { flex: 1, padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectText: { fontSize: 16, color: "#111827" },
  selectPlaceholder: { color: "#9ca3af" },
  pickerContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
  },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  pickerItemActive: { backgroundColor: "#8b5cf6" },
  pickerItemText: { fontSize: 15, color: "#374151" },
  pickerItemTextActive: { color: "#fff", fontWeight: "600" },
  addKatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 8,
  },
  addKatText: { fontSize: 14, color: "#8b5cf6", fontWeight: "500" },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currency: { fontSize: 18, fontWeight: "600", color: "#6b7280" },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 8,
    fontSize: 16,
    color: "#111827",
  },
});
