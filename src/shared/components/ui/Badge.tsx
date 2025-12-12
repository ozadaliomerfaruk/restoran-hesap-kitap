/**
 * Badge - Status badge bileşeni
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors, spacing, borderRadius, typography } from "../../constants";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const getBgColor = () => {
    const bgColors: Record<BadgeVariant, string> = {
      default: colors.gray[100],
      primary: colors.primary[50],
      secondary: colors.secondary[50],
      success: colors.success.light,
      warning: colors.warning.light,
      error: colors.error.light,
      info: colors.info.light,
    };
    return bgColors[variant];
  };

  const getTextColor = () => {
    const textColors: Record<BadgeVariant, string> = {
      default: colors.gray[700],
      primary: colors.primary[700],
      secondary: colors.secondary[700],
      success: colors.success.text,
      warning: colors.warning.text,
      error: colors.error.text,
      info: colors.info.text,
    };
    return textColors[variant];
  };

  const getPadding = () => {
    if (size === "sm")
      return { paddingHorizontal: spacing.xs, paddingVertical: 2 };
    if (size === "lg")
      return { paddingHorizontal: spacing.md, paddingVertical: spacing.sm };
    return { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs };
  };

  const getFontSize = () => {
    if (size === "sm") return typography.size.xs;
    if (size === "lg") return typography.size.md;
    return typography.size.sm;
  };

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: getBgColor() },
        getPadding(),
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { color: getTextColor(), fontSize: getFontSize() },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function StatusDot({
  variant = "default",
  size = 8,
  style,
}: {
  variant?: BadgeVariant;
  size?: number;
  style?: ViewStyle;
}) {
  const dotColors: Record<BadgeVariant, string> = {
    default: colors.gray[400],
    primary: colors.primary[500],
    secondary: colors.secondary[500],
    success: colors.success.main,
    warning: colors.warning.main,
    error: colors.error.main,
    info: colors.info.main,
  };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColors[variant],
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: borderRadius.badge,
  },
  iconContainer: { marginRight: spacing.xs },
  text: { fontWeight: typography.weight.semibold },
});

export default Badge;
