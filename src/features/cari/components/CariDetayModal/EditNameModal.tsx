/**
 * EditNameModal Component
 * Cari isim düzenleme modalı
 */

import React from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import { styles } from "./styles";

interface EditNameModalProps {
  visible: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  visible,
  name,
  onNameChange,
  onClose,
  onSave,
  loading,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.editModalOverlay}>
        <View style={styles.editModalContainer}>
          <Text style={styles.editModalTitle}>Cari İsmini Düzenle</Text>
          <TextInput
            style={styles.editInput}
            value={name}
            onChangeText={onNameChange}
            placeholder="Cari adı"
            placeholderTextColor="#9ca3af"
            autoFocus
          />
          <View style={styles.editModalButtons}>
            <TouchableOpacity
              style={[styles.editModalBtn, styles.editModalCancelBtn]}
              onPress={onClose}
            >
              <Text style={styles.editModalCancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editModalBtn, styles.editModalSaveBtn]}
              onPress={onSave}
              disabled={loading}
            >
              <Text style={styles.editModalSaveText}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
