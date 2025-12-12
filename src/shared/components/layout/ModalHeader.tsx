/**
 * ModalHeader - Tüm modallar için tutarlı header
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { X, ChevronLeft } from "lucide-react-native";
import {
  colors,
  spacing,
  iconSize,
  componentSize,
  textStyles,
} from "../../constants";

export interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  subtitle?: string;
  style?: ViewStyle;
  showBorder?: boolean;
}

export function ModalHeader({
  title,
  onClose,
  showBack = false,
  onBack,
  rightAction,
  subtitle,
  style,
  showBorder = true,
}: ModalHeaderProps) {
  return (
    <View style={[styles.container, showBorder && styles.withBorder, style]}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft
              size={iconSize.closeButton}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightAction ? (
          rightAction
        ) : onClose ? (
          <TouchableOpacity
            onPress={onClose}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={iconSize.closeButton} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: componentSize.headerHeight,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.primary,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  leftSection: { width: 44, alignItems: "flex-start" },
  titleSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm,
  },
  rightSection: { width: 44, alignItems: "flex-end" },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  iconPlaceholder: { width: 44, height: 44 },
  title: {
    ...textStyles.modalTitle,
    color: colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: "center",
    marginTop: 2,
  },
});

export default ModalHeader;
