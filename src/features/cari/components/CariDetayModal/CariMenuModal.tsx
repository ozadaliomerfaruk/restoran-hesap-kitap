/**
 * CariMenuModal Component
 * Hamburger menü modalı
 */

import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { X, Edit3, Eye, EyeOff, Archive, Trash2 } from "lucide-react-native";
import { styles } from "./styles";
import { CariMenuModalProps } from "./types";

export const CariMenuModal: React.FC<CariMenuModalProps> = ({
  visible,
  cariName,
  includeInReports,
  onClose,
  onEditName,
  onToggleReports,
  onArchive,
  onDelete,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>{cariName}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* İsim Düzenle */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onClose();
              setTimeout(onEditName, 300);
            }}
          >
            <Edit3 size={20} color="#374151" />
            <Text style={styles.menuItemText}>İsmi Düzenle</Text>
          </TouchableOpacity>

          {/* Raporlara Dahil Et/Etme */}
          <TouchableOpacity style={styles.menuItem} onPress={onToggleReports}>
            {includeInReports ? (
              <>
                <EyeOff size={20} color="#374151" />
                <Text style={styles.menuItemText}>Raporlardan Gizle</Text>
              </>
            ) : (
              <>
                <Eye size={20} color="#374151" />
                <Text style={styles.menuItemText}>Raporlara Dahil Et</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Arşive Al */}
          <TouchableOpacity style={styles.menuItem} onPress={onArchive}>
            <Archive size={20} color="#f59e0b" />
            <Text style={[styles.menuItemText, { color: "#f59e0b" }]}>
              Arşive Al
            </Text>
          </TouchableOpacity>

          {/* Sil */}
          <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
            <Trash2 size={20} color="#ef4444" />
            <Text style={[styles.menuItemText, styles.menuItemDanger]}>
              Cariyi Sil
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
