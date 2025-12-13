/**
 * Kullanıcı Davet Modal
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, Mail } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormInput } from "../../../shared/components/forms";
import { colors, spacing } from "../../../shared/constants";
import { RolSecimi } from "./RolSecimi";
import { ModulYetkileri } from "./ModulYetkileri";
import { IslemYetkileri } from "./IslemYetkileri";
import { DEFAULT_PERMISSIONS } from "../../../types";
import type { RestaurantUser, UserPermissions } from "../../../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onInvite: (
    email: string,
    role: RestaurantUser["role"],
    permissions: UserPermissions
  ) => Promise<boolean>;
}

export function KullaniciDavetModal({ visible, onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RestaurantUser["role"]>("kasiyer");
  const [permissions, setPermissions] =
    useState<UserPermissions>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setEmail("");
    setRole("kasiyer");
    setPermissions(DEFAULT_PERMISSIONS);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInvite = async () => {
    // Validasyon
    if (!email.trim()) {
      setError("E-posta adresi zorunludur");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Geçerli bir e-posta adresi girin");
      return;
    }

    setError("");
    setLoading(true);

    const success = await onInvite(email.trim(), role, permissions);

    setLoading(false);

    if (success) {
      handleClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <X size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Kullanıcı Ekle</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* E-posta */}
          <FormInput
            label="E-posta Adresi"
            value={email}
            onChangeText={setEmail}
            error={error}
            placeholder="kullanici@example.com"
            leftIcon={<Mail size={20} color={colors.text.tertiary} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.hint}>
            Kullanıcı uygulamaya kayıtlı olmalıdır. Kayıtlı e-posta adresini
            girin.
          </Text>

          {/* Rol Seçimi */}
          <RolSecimi value={role} onChange={setRole} />

          {/* Modül Yetkileri */}
          <ModulYetkileri permissions={permissions} onChange={setPermissions} />

          {/* İşlem Yetkileri */}
          <IslemYetkileri permissions={permissions} onChange={setPermissions} />

          {/* Davet Et Butonu */}
          <TouchableOpacity
            style={[styles.inviteButton, loading && styles.buttonDisabled]}
            onPress={handleInvite}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.inviteButtonText}>Kullanıcıyı Ekle</Text>
            )}
          </TouchableOpacity>

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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  hint: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    marginTop: -spacing.md,
  },
  inviteButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
