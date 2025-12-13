/**
 * Profil Bilgileri Bölümü
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { User, Phone, Mail } from "lucide-react-native";
import { FormInput } from "../../../shared/components/forms";
import { colors, spacing, borderRadius } from "../../../shared/constants";
import type { ProfileFormData, ProfileFormErrors } from "../types";

interface Props {
  data: ProfileFormData;
  errors: ProfileFormErrors;
  email?: string;
  loading: boolean;
  onChange: (data: ProfileFormData) => void;
  onSave: () => void;
}

export function ProfileInfoSection({
  data,
  errors,
  email,
  loading,
  onChange,
  onSave,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profil Bilgileri</Text>

      <View style={styles.card}>
        <FormInput
          label="Ad Soyad"
          value={data.name}
          onChangeText={(text) => onChange({ ...data, name: text })}
          error={errors.name}
          placeholder="Adınızı girin"
          leftIcon={<User size={20} color={colors.text.tertiary} />}
          autoCapitalize="words"
        />

        <FormInput
          label="Telefon"
          value={data.phone}
          onChangeText={(text) => onChange({ ...data, phone: text })}
          error={errors.phone}
          placeholder="5XX XXX XX XX"
          leftIcon={<Phone size={20} color={colors.text.tertiary} />}
          keyboardType="phone-pad"
        />

        <FormInput
          label="E-posta"
          value={email || ""}
          editable={false}
          leftIcon={<Mail size={20} color={colors.text.tertiary} />}
          hint="E-posta değiştirmek için destek ile iletişime geçin"
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={onSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
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
