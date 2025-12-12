/**
 * Card - Tutarlı kart bileşeni
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, borderRadius, shadows } from "../../constants";

export type CardVariant = "elevated" | "outlined" | "filled";

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  noPadding?: boolean;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "elevated",
  onPress,
  noPadding = false,
  style,
}: CardProps) {
  const getStyles = () => {
    const base: ViewStyle = {
      borderRadius: borderRadius.card,
      overflow: "hidden",
    };
    if (!noPadding) base.padding = spacing.cardPadding;

    if (variant === "elevated")
      return {
        ...base,
        backgroundColor: colors.background.primary,
        ...shadows.sm,
      };
    if (variant === "outlined")
      return {
        ...base,
        backgroundColor: colors.background.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
      };
    return { ...base, backgroundColor: colors.background.secondary };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getStyles(), style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getStyles(), style]}>{children}</View>;
}

export function CardHeader({
  children,
  style,
  noBorder = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.header, !noBorder && styles.headerBorder, style]}>
      {children}
    </View>
  );
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={style}>{children}</View>;
}

export function CardFooter({
  children,
  style,
  noBorder = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  noBorder?: boolean;
}) {
  return (
    <View style={[styles.footer, !noBorder && styles.footerBorder, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.md, marginBottom: spacing.md },
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  footer: { paddingTop: spacing.md, marginTop: spacing.md },
  footerBorder: { borderTopWidth: 1, borderTopColor: colors.border.light },
});

export default Card;
