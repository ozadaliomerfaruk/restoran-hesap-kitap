/**
 * MoneyInput - Para girişi için özel input
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  typography,
  textStyles,
} from "../../constants";

export interface MoneyInputProps {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  currency?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
}

export function MoneyInput({
  value,
  onChangeText,
  label,
  error,
  placeholder = "0,00",
  currency = "₺",
  containerStyle,
  required,
  editable = true,
  autoFocus,
}: MoneyInputProps) {
  const hasError = !!error;

  // Sadece sayı ve virgül kabul et
  const handleChange = (text: string) => {
    // Sadece rakam ve virgül
    const cleaned = text.replace(/[^0-9,]/g, "");

    // Birden fazla virgül varsa sadece ilkini al
    const parts = cleaned.split(",");
    if (parts.length > 2) {
      onChangeText(parts[0] + "," + parts.slice(1).join(""));
    } else {
      onChangeText(cleaned);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        <Text style={styles.currency}>{currency}</Text>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          keyboardType="decimal-pad"
          editable={editable}
          autoFocus={autoFocus}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...textStyles.inputLabel,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.error.main,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.input,
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: colors.error.main,
  },
  inputContainerDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  currency: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.semibold,
    color: colors.text.tertiary,
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  error: {
    ...textStyles.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});

export default MoneyInput;
