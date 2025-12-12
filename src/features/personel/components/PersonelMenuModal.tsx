// PersonelMenuModal Component - Hamburger menü

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { X, Edit3, Archive, Trash2, EyeOff, Eye } from "lucide-react-native";
import { Personel } from "../../../types";

interface PersonelMenuModalProps {
  visible: boolean;
  personel: Personel;
  onClose: () => void;
  onUpdateName: (name: string) => Promise<boolean>;
  onArchive: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onToggleIncludeInReports: () => Promise<boolean>;
}

export const PersonelMenuModal: React.FC<PersonelMenuModalProps> = ({
  visible,
  personel,
  onClose,
  onUpdateName,
  onArchive,
  onDelete,
  onToggleIncludeInReports,
}) => {
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editName, setEditName] = useState(personel.name);
  const [loading, setLoading] = useState(false);

  const handleSaveName = async () => {
    setLoading(true);
    const success = await onUpdateName(editName);
    setLoading(false);
    if (success) {
      setShowNameEdit(false);
    }
  };

  // İsim düzenleme modal
  if (showNameEdit) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.nameEditOverlay}>
          <View style={styles.nameEditModal}>
            <Text style={styles.nameEditTitle}>İsmi Düzenle</Text>
            <Text style={styles.nameEditLabel}>Personel Adı</Text>
            <TextInput
              style={styles.nameEditInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Personel adı"
              autoFocus
            />
            <View style={styles.nameEditBtns}>
              <TouchableOpacity
                style={styles.nameEditCancelBtn}
                onPress={() => {
                  setShowNameEdit(false);
                  setEditName(personel.name);
                }}
              >
                <Text style={styles.nameEditCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nameEditSaveBtn}
                onPress={handleSaveName}
                disabled={loading}
              >
                <Text style={styles.nameEditSaveText}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Ayarlar</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowNameEdit(true)}
          >
            <Edit3 size={20} color="#3b82f6" />
            <Text style={styles.menuItemText}>İsmi Düzenle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onToggleIncludeInReports}
          >
            {personel.include_in_reports ? (
              <>
                <EyeOff size={20} color="#f59e0b" />
                <Text style={styles.menuItemText}>Raporlara Dahil Etme</Text>
              </>
            ) : (
              <>
                <Eye size={20} color="#10b981" />
                <Text style={styles.menuItemText}>Raporlara Dahil Et</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onArchive}>
            <Archive size={20} color="#8b5cf6" />
            <Text style={styles.menuItemText}>Arşive Al</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
            <Trash2 size={20} color="#ef4444" />
            <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
              Personeli Sil
            </Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#374151",
  },
  // Name edit modal styles
  nameEditOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  nameEditModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
  },
  nameEditTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  nameEditLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  nameEditInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  nameEditBtns: {
    flexDirection: "row",
    gap: 12,
  },
  nameEditCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  nameEditCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  nameEditSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  nameEditSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
