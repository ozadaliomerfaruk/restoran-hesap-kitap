/**
 * Button - Tutarlı buton bileşeni
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  colors,
  spacing,
  borderRadius,
  componentSize,
  textStyles,
} from "../../constants";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (variant === "outline" || variant === "ghost") return "transparent";
    if (variant === "danger") return colors.error.main;
    if (variant === "success") return colors.success.main;
    if (variant === "secondary") return colors.secondary[500];
    return colors.primary[500];
  };

  const getBorderColor = () => {
    if (variant === "outline") return colors.primary[500];
    if (variant === "ghost") return "transparent";
    return getBackgroundColor();
  };

  const getTextColor = () => {
    if (variant === "outline" || variant === "ghost")
      return colors.primary[500];
    return colors.text.inverse;
  };

  const getHeight = () => {
    if (size === "sm") return componentSize.buttonSmall;
    if (size === "lg") return componentSize.buttonLarge;
    return componentSize.buttonMedium;
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.5 },
  text: { ...textStyles.button },
});

export default Button;
