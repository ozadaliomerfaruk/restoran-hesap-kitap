// BirimPickerModal Component - Birim seçici modal

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Check } from "lucide-react-native";
import { BIRIMLER } from "../types";

interface BirimPickerModalProps {
  visible: boolean;
  selectedUnit: string;
  onSelect: (unit: string) => void;
  onClose: () => void;
}

export const BirimPickerModal: React.FC<BirimPickerModalProps> = ({
  visible,
  selectedUnit,
  onSelect,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Birim Seçin</Text>
          <ScrollView style={styles.pickerList}>
            {BIRIMLER.map((birim) => (
              <TouchableOpacity
                key={birim}
                style={[
                  styles.pickerItem,
                  selectedUnit === birim && styles.pickerItemSelected,
                ]}
                onPress={() => onSelect(birim)}
              >
                <Text style={styles.pickerItemText}>{birim}</Text>
                {selectedUnit === birim && <Check size={20} color="#8b5cf6" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "60%",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerItemSelected: {
    backgroundColor: "#ede9fe",
  },
  pickerItemText: {
    fontSize: 15,
    color: "#111827",
  },
});
