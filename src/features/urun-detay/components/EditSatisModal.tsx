// EditSatisModal Component - Satış düzenleme modal

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { formatCurrency } from "../../../shared/utils";

interface EditSatisModalProps {
  visible: boolean;
  adet: string;
  fiyat: string;
  date: Date;
  loading: boolean;
  onAdetChange: (value: string) => void;
  onFiyatChange: (value: string) => void;
  onDateChange: (date: Date) => void;
  onDatePress: () => void;
  onSave: () => void;
  onClose: () => void;
}

export const EditSatisModal: React.FC<EditSatisModalProps> = ({
  visible,
  adet,
  fiyat,
  date,
  loading,
  onAdetChange,
  onFiyatChange,
  onDateChange,
  onDatePress,
  onSave,
  onClose,
}) => {
  const toplam =
    (parseFloat(adet.replace(",", ".")) || 0) *
    (parseFloat(fiyat.replace(",", ".")) || 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.editSatisModal}>
          <Text style={styles.modalTitle}>Satışı Düzenle</Text>

          <View style={styles.editSatisRow}>
            <Text style={styles.editSatisLabel}>Adet</Text>
            <TextInput
              style={styles.editSatisInput}
              value={adet}
              onChangeText={onAdetChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.editSatisRow}>
            <Text style={styles.editSatisLabel}>Birim Fiyat (₺)</Text>
            <TextInput
              style={styles.editSatisInput}
              value={fiyat}
              onChangeText={onFiyatChange}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.editSatisRow}>
            <Text style={styles.editSatisLabel}>Tarih</Text>
            <TouchableOpacity
              style={styles.editSatisDateBtn}
              onPress={onDatePress}
            >
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.editSatisDateText}>
                {date.toLocaleDateString("tr-TR")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.editSatisToplam}>
            <Text style={styles.editSatisToplamLabel}>Toplam:</Text>
            <Text style={styles.editSatisToplamValue}>
              {formatCurrency(toplam)}
            </Text>
          </View>

          <View style={styles.editSatisActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading ? "..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

interface DatePickerModalProps {
  visible: boolean;
  date: Date;
  onDateChange: (date: Date) => void;
  onSave: () => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  date,
  onDateChange,
  onSave,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.datePickerModal}>
          <Text style={styles.modalTitle}>Satış Tarihi</Text>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              if (selectedDate) onDateChange(selectedDate);
            }}
            locale="tr-TR"
          />
          <View style={styles.datePickerActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  editSatisModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 20,
  },
  editSatisRow: {
    marginBottom: 16,
  },
  editSatisLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  editSatisInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  editSatisDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
  },
  editSatisDateText: {
    fontSize: 15,
    color: "#111827",
  },
  editSatisToplam: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  editSatisToplamLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  editSatisToplamValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  editSatisActions: {
    flexDirection: "row",
    gap: 12,
  },
  datePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 16,
  },
  datePickerActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
