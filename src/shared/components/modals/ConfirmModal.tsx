/**
 * ConfirmModal - Onay modalı
 */

import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AlertTriangle, Trash2, Info } from "lucide-react-native";
import {
  colors,
  spacing,
  borderRadius,
  textStyles,
  iconSize,
} from "../../constants";
import { Button } from "../ui/Button";

export type ConfirmModalVariant = "danger" | "warning" | "info";

export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  loading?: boolean;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const getIcon = () => {
    const iconProps = { size: 32 };
    switch (variant) {
      case "danger":
        return <Trash2 {...iconProps} color={colors.error.main} />;
      case "warning":
        return <AlertTriangle {...iconProps} color={colors.warning.main} />;
      case "info":
        return <Info {...iconProps} color={colors.info.main} />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return colors.error.light;
      case "warning":
        return colors.warning.light;
      case "info":
        return colors.info.light;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "danger";
      case "warning":
        return "primary";
      case "info":
        return "primary";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.container}>
          <View
            style={[styles.iconContainer, { backgroundColor: getIconBg() }]}
          >
            {getIcon()}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <Button
              variant="outline"
              onPress={onClose}
              style={styles.button}
              disabled={loading}
            >
              {cancelText}
            </Button>

            <Button
              variant={getButtonVariant() as any}
              onPress={onConfirm}
              style={styles.button}
              loading={loading}
            >
              {confirmText}
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.modal,
    padding: spacing["2xl"],
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    ...textStyles.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
  },
});

export default ConfirmModal;
