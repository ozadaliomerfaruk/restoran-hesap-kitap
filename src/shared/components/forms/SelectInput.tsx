/**
 * SelectInput - Seçim input bileşeni (Modal açar)
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import {
  colors,
  spacing,
  borderRadius,
  iconSize,
  textStyles,
} from "../../constants";

export interface SelectInputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
}

export function SelectInput({
  label,
  value,
  placeholder = "Seçiniz",
  onPress,
  error,
  containerStyle,
  required,
  disabled,
  leftIcon,
}: SelectInputProps) {
  const hasError = !!error;
  const hasValue = !!value;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <Text
          style={[styles.value, !hasValue && styles.placeholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        <ChevronDown size={iconSize.input} color={colors.text.tertiary} />
      </TouchableOpacity>

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
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputContainerError: {
    borderColor: colors.error.main,
  },
  inputContainerDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  value: {
    flex: 1,
    ...textStyles.input,
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.text.disabled,
  },
  error: {
    ...textStyles.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});

export default SelectInput;
