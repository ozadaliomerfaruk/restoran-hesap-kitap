/**
 * EmptyState - Boş liste durumu
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Inbox } from "lucide-react-native";
import { colors, spacing, textStyles } from "../../constants";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <View style={styles.iconContainer}>
        {icon || <Inbox size={compact ? 40 : 56} color={colors.gray[300]} />}
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[styles.description, compact && styles.descriptionCompact]}
        >
          {description}
        </Text>
      )}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

export function LoadingState({
  text = "Yükleniyor...",
  style,
}: {
  text?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

export function ErrorState({
  title = "Bir hata oluştu",
  message,
  onRetry,
  retryText = "Tekrar Dene",
  style,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
}) {
  const Button = require("./Button").Button;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.errorTitle}>{title}</Text>
      {message && <Text style={styles.description}>{message}</Text>}
      {onRetry && (
        <View style={styles.actionContainer}>
          <Button variant="outline" onPress={onRetry}>
            {retryText}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["3xl"],
    paddingVertical: spacing["4xl"],
  },
  compact: { paddingVertical: spacing["2xl"] },
  iconContainer: { marginBottom: spacing.lg },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  titleCompact: { ...textStyles.label },
  description: {
    ...textStyles.body,
    color: colors.text.tertiary,
    textAlign: "center",
    maxWidth: 280,
  },
  descriptionCompact: { ...textStyles.bodySmall },
  actionContainer: { marginTop: spacing.xl },
  loadingText: { ...textStyles.body, color: colors.text.tertiary },
  errorTitle: {
    ...textStyles.h4,
    color: colors.error.main,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});

export default EmptyState;
