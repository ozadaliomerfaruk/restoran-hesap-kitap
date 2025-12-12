import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { formatDate } from "../shared/utils";

interface DatePickerFieldProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

export default function DatePickerField({
  value,
  onChange,
  label,
  placeholder = "Tarih seçin",
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  // String'den Date'e çevir
  const dateValue = value ? new Date(value) : new Date();

  // Tarihi formatla
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    return formatDate(dateStr, "full");
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    }

    if (Platform.OS === "ios" && event.type === "dismissed") {
      setShowPicker(false);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Calendar size={20} color="#6b7280" />
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {formatDisplayDate(value)}
        </Text>
      </TouchableOpacity>

      {/* Android için direkt picker */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}

      {/* iOS için modal içinde picker */}
      {Platform.OS === "ios" && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tarih Seçin</Text>
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={styles.doneButton}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="inline"
                onChange={handleChange}
                locale="tr-TR"
                style={styles.picker}
                themeVariant="light"
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  placeholder: {
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
  },
  picker: {
    height: 350,
  },
});
