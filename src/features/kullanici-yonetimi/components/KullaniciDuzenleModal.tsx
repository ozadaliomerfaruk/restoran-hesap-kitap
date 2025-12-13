/**
 * Kullanıcı Düzenleme Modal
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { X, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../../shared/constants";
import { RolSecimi } from "./RolSecimi";
import { ModulYetkileri } from "./ModulYetkileri";
import { IslemYetkileri } from "./IslemYetkileri";
import type {
  RestaurantUser,
  UserPermissions,
  DEFAULT_PERMISSIONS,
} from "../../../types";

interface Props {
  visible: boolean;
  user: RestaurantUser | null;
  onClose: () => void;
  onSave: (updates: {
    role: RestaurantUser["role"];
    permissions: UserPermissions;
  }) => Promise<boolean>;
  onRemove: () => Promise<boolean>;
  isCurrentUser: boolean;
}

export function KullaniciDuzenleModal({
  visible,
  user,
  onClose,
  onSave,
  onRemove,
  isCurrentUser,
}: Props) {
  const [role, setRole] = useState<RestaurantUser["role"]>("kasiyer");
  const [permissions, setPermissions] = useState<UserPermissions>({
    modules: {
      dashboard: true,
      kasalar: false,
      cariler: false,
      personel: false,
      islemler: false,
      raporlar: false,
      tekrarlayan_odemeler: false,
      cek_senet: false,
      gunluk_satis: false,
      ayarlar: false,
    },
    level: "readonly",
  });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // User değiştiğinde formu güncelle
  useEffect(() => {
    if (user) {
      setRole(user.role);
      if (user.permissions) {
        setPermissions(user.permissions);
      }
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave({ role, permissions });
    setSaving(false);
    if (success) onClose();
  };

  const handleRemove = async () => {
    setRemoving(true);
    const success = await onRemove();
    setRemoving(false);
    if (success) onClose();
  };

  if (!user) return null;

  // Admin kullanıcının yetkilerini değiştiremezsin
  const isAdmin = user.role === "admin";
  const canEdit = !isAdmin && !isCurrentUser;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Kullanıcı Yetkileri</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.user?.name || "İsimsiz"}</Text>
          <Text style={styles.userEmail}>{user.user?.email}</Text>
        </View>

        {isAdmin && (
          <View style={styles.adminWarning}>
            <Text style={styles.adminWarningText}>
              Yönetici kullanıcının yetkileri değiştirilemez
            </Text>
          </View>
        )}

        {isCurrentUser && !isAdmin && (
          <View style={styles.adminWarning}>
            <Text style={styles.adminWarningText}>
              Kendi yetkilerinizi değiştiremezsiniz
            </Text>
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Rol Seçimi */}
          <RolSecimi value={role} onChange={setRole} disabled={!canEdit} />

          {/* Modül Yetkileri */}
          <ModulYetkileri
            permissions={permissions}
            onChange={setPermissions}
            disabled={!canEdit}
          />

          {/* İşlem Yetkileri */}
          <IslemYetkileri
            permissions={permissions}
            onChange={setPermissions}
            disabled={!canEdit}
          />

          {/* Kaydet Butonu */}
          {canEdit && (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Erişimi Kaldır */}
          {canEdit && (
            <TouchableOpacity
              style={[styles.removeButton, removing && styles.buttonDisabled]}
              onPress={handleRemove}
              disabled={removing}
            >
              {removing ? (
                <ActivityIndicator color={colors.error.main} size="small" />
              ) : (
                <>
                  <Trash2 size={18} color={colors.error.main} />
                  <Text style={styles.removeButtonText}>Erişimi Kaldır</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.primary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
  },
  userInfo: {
    padding: spacing.lg,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  adminWarning: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  adminWarningText: {
    fontSize: 13,
    color: "#92400e",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error.main,
    borderRadius: 10,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  removeButtonText: {
    color: colors.error.main,
    fontSize: 16,
    fontWeight: "600",
  },
});
