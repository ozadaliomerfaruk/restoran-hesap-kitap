/**
 * Kasa İşlem Form - Gelir/Gider/Ödeme/Tahsilat/Transfer formu
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react-native";
import { colors, spacing, borderRadius } from "@/shared/constants";
import { formatDate } from "@/shared/utils";
import { Kasa, Kategori } from "@/types";
import { IslemTipi, kasaTypeConfig } from "../constants";

interface KasaIslemFormProps {
  islemTipi: IslemTipi;
  kasa: Kasa;
  otherKasalar: Kasa[];
  kategoriler: Kategori[];
  // Form state
  date: string;
  onDateChange: (date: string) => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  targetKasaId: string | null;
  onTargetKasaChange: (id: string) => void;
  kategoriId: string;
  onKategoriPress: () => void;
  targetName: string;
  onTargetPress: () => void;
  // Actions
  onSubmit: () => void;
  loading: boolean;
}

export function KasaIslemForm({
  islemTipi,
  kasa,
  otherKasalar,
  kategoriler,
  date,
  onDateChange,
  amount,
  onAmountChange,
  description,
  onDescriptionChange,
  targetKasaId,
  onTargetKasaChange,
  kategoriId,
  onKategoriPress,
  targetName,
  onTargetPress,
  onSubmit,
  loading,
}: KasaIslemFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getButtonColor = () => {
    switch (islemTipi) {
      case "gelir":
        return "#10b981";
      case "gider":
        return "#ef4444";
      case "odeme":
        return "#3b82f6";
      case "tahsilat":
        return "#8b5cf6";
      case "transfer":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  const selectedKategori = kategoriler.find((k) => k.id === kategoriId);

  return (
    <View style={styles.container}>
      {/* Tarih */}
      <TouchableOpacity
        style={styles.dateRow}
        onPress={() => setShowDatePicker(true)}
      >
        <Calendar size={16} color="#6b7280" />
        <Text style={styles.dateText}>{formatDateShort(date)}</Text>
        <ChevronDown size={16} color="#6b7280" />
      </TouchableOpacity>

      {/* iOS Date Picker */}
      {showDatePicker && Platform.OS === "ios" && (
        <View style={styles.iosDatePicker}>
          <DateTimePicker
            value={new Date(date)}
            mode="date"
            display="spinner"
            onChange={(_, d) =>
              d && onDateChange(d.toISOString().split("T")[0])
            }
            locale="tr-TR"
          />
          <TouchableOpacity
            style={styles.datePickerDone}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.datePickerDoneText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display="default"
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) onDateChange(d.toISOString().split("T")[0]);
          }}
        />
      )}

      {/* Ödeme/Tahsilat Hedef Seçimi */}
      {(islemTipi === "odeme" || islemTipi === "tahsilat") && (
        <View>
          <Text style={styles.label}>
            {islemTipi === "odeme" ? "Kime Ödeme?" : "Kimden Tahsilat?"}
          </Text>
          <TouchableOpacity style={styles.selectBtn} onPress={onTargetPress}>
            <Text style={styles.selectBtnText}>{targetName}</Text>
            <ChevronRight size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Transfer Hedef Kasa */}
      {islemTipi === "transfer" && (
        <View>
          <Text style={styles.label}>Hedef Kasa</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {otherKasalar.map((k) => {
                const kConfig = kasaTypeConfig[k.type] || kasaTypeConfig.nakit;
                const KIcon = kConfig.icon;
                const isSelected = targetKasaId === k.id;
                return (
                  <TouchableOpacity
                    key={k.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => onTargetKasaChange(k.id)}
                  >
                    <KIcon
                      size={14}
                      color={isSelected ? "#fff" : kConfig.color}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {k.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Kategori (Gelir/Gider için) */}
      {(islemTipi === "gelir" || islemTipi === "gider") && (
        <TouchableOpacity style={styles.selectBtn} onPress={onKategoriPress}>
          <Text
            style={[styles.selectBtnText, !kategoriId && { color: "#9ca3af" }]}
          >
            {selectedKategori?.name || "Kategori (opsiyonel)"}
          </Text>
          <ChevronDown size={18} color="#6b7280" />
        </TouchableOpacity>
      )}

      {/* Açıklama */}
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Açıklama (opsiyonel)"
        placeholderTextColor="#9ca3af"
      />

      {/* Tutar ve Kaydet */}
      <View style={styles.amountRow}>
        <View style={styles.amountBox}>
          <Text style={styles.currency}>₺</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={onAmountChange}
            placeholder="0"
            placeholderTextColor="#d1d5db"
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: getButtonColor() },
            loading && { opacity: 0.6 },
          ]}
          onPress={onSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? "..." : "Kaydet"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    gap: 10,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  iosDatePicker: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  datePickerDone: {
    backgroundColor: "#3b82f6",
    padding: 12,
    alignItems: "center",
  },
  datePickerDoneText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  selectBtnText: {
    fontSize: 14,
    color: "#111827",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  chipActive: {
    backgroundColor: "#f59e0b",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  chipTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  amountRow: {
    flexDirection: "row",
    gap: 10,
  },
  amountBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 10,
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});

export default KasaIslemForm;
