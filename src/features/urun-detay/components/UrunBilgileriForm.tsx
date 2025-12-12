// UrunBilgileriForm Component - Ürün bilgileri düzenleme formu

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react-native";
import { MenuItem } from "../../../types";

interface UrunBilgileriFormProps {
  urun: MenuItem;
  editName: string;
  editPrice: string;
  editUnit: string;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
  onPriceChange: (price: string) => void;
  onPriceBlur: () => void;
  onUnitPress: () => void;
  onToggleInvoice: () => void;
}

export const UrunBilgileriForm: React.FC<UrunBilgileriFormProps> = ({
  urun,
  editName,
  editPrice,
  editUnit,
  onNameChange,
  onNameBlur,
  onPriceChange,
  onPriceBlur,
  onUnitPress,
  onToggleInvoice,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>

      {/* Ad */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Ürün Adı</Text>
        <View style={styles.fieldInputRow}>
          <TextInput
            style={styles.fieldInput}
            value={editName}
            onChangeText={onNameChange}
            onBlur={onNameBlur}
            placeholder="Ürün adı"
          />
          {editName !== urun.name && (
            <TouchableOpacity style={styles.saveFieldBtn} onPress={onNameBlur}>
              <Check size={18} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Fiyat */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Satış Fiyatı (KDV Dahil)</Text>
        <View style={styles.fieldInputRow}>
          <View style={styles.priceInputBox}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.priceInput}
              value={editPrice}
              onChangeText={onPriceChange}
              onBlur={onPriceBlur}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          {editPrice !== urun.price?.toString() && (
            <TouchableOpacity style={styles.saveFieldBtn} onPress={onPriceBlur}>
              <Check size={18} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.fieldHint}>
          Fiyat değişikliği eski satışları etkilemez
        </Text>
      </View>

      {/* Birim */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Birim</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={onUnitPress}>
          <Text style={styles.pickerBtnText}>{editUnit || "Seçin"}</Text>
          <ChevronDown size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Kategori */}
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Kategori</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{urun.category}</Text>
        </View>
      </View>

      {/* Faturada Göster */}
      <TouchableOpacity style={styles.toggleRow} onPress={onToggleInvoice}>
        <View style={styles.toggleLeft}>
          {urun.include_in_invoice !== false ? (
            <Eye size={20} color="#10b981" />
          ) : (
            <EyeOff size={20} color="#9ca3af" />
          )}
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Satış Faturasında Göster</Text>
            <Text style={styles.toggleHint}>
              {urun.include_in_invoice !== false
                ? "Kalemli satış ekranında görünür"
                : "Kalemli satış ekranında gizli"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.toggleSwitch,
            urun.include_in_invoice !== false && styles.toggleSwitchActive,
          ]}
        >
          <View
            style={[
              styles.toggleKnob,
              urun.include_in_invoice !== false && styles.toggleKnobActive,
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  fieldInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  saveFieldBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  priceInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 12,
  },
  fieldHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerBtnText: {
    fontSize: 15,
    color: "#111827",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8b5cf6",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  toggleHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#10b981",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleKnobActive: {
    marginLeft: "auto",
  },
});
