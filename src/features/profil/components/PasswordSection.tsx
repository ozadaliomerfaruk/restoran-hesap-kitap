/**
 * Şifre Değiştirme Bölümü
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Lock, Eye, EyeOff } from "lucide-react-native";
import { FormInput } from "../../../shared/components/forms";
import { colors, spacing, borderRadius } from "../../../shared/constants";
import type { PasswordFormData, PasswordFormErrors } from "../types";

interface Props {
  data: PasswordFormData;
  errors: PasswordFormErrors;
  loading: boolean;
  onChange: (data: PasswordFormData) => void;
  onSave: () => void;
}

export function PasswordSection({
  data,
  errors,
  loading,
  onChange,
  onSave,
}: Props) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const EyeIcon = ({
    visible,
    onToggle,
  }: {
    visible: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity onPress={onToggle}>
      {visible ? (
        <EyeOff size={20} color={colors.text.tertiary} />
      ) : (
        <Eye size={20} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Şifre Değiştir</Text>

      <View style={styles.card}>
        <FormInput
          label="Mevcut Şifre"
          value={data.currentPassword}
          onChangeText={(text) => onChange({ ...data, currentPassword: text })}
          error={errors.currentPassword}
          placeholder="••••••••"
          secureTextEntry={!showCurrent}
          leftIcon={<Lock size={20} color={colors.text.tertiary} />}
          rightIcon={
            <EyeIcon
              visible={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
            />
          }
        />

        <FormInput
          label="Yeni Şifre"
          value={data.newPassword}
          onChangeText={(text) => onChange({ ...data, newPassword: text })}
          error={errors.newPassword}
          placeholder="••••••••"
          secureTextEntry={!showNew}
          leftIcon={<Lock size={20} color={colors.text.tertiary} />}
          rightIcon={
            <EyeIcon visible={showNew} onToggle={() => setShowNew(!showNew)} />
          }
          hint="En az 6 karakter"
        />

        <FormInput
          label="Yeni Şifre (Tekrar)"
          value={data.confirmPassword}
          onChangeText={(text) => onChange({ ...data, confirmPassword: text })}
          error={errors.confirmPassword}
          placeholder="••••••••"
          secureTextEntry={!showConfirm}
          leftIcon={<Lock size={20} color={colors.text.tertiary} />}
          rightIcon={
            <EyeIcon
              visible={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />
          }
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Şifreyi Değiştir</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
