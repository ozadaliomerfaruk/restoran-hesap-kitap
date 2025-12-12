/**
 * BaseModal - Tüm modallar için temel bileşen
 */

import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
  ScrollView,
} from "react-native";
import { colors, spacing, borderRadius, shadows } from "../../constants";
import { ModalHeader } from "../layout/ModalHeader";

export interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showHeader?: boolean;
  fullScreen?: boolean;
  scrollable?: boolean;
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function BaseModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  showHeader = true,
  fullScreen = false,
  scrollable = true,
  contentStyle,
  footer,
  showBack,
  onBack,
  rightAction,
}: BaseModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={fullScreen ? "fullScreen" : "pageSheet"}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container, fullScreen && styles.fullScreen]}>
            {showHeader && (
              <ModalHeader
                title={title}
                subtitle={subtitle}
                onClose={onClose}
                showBack={showBack}
                onBack={onBack}
                rightAction={rightAction}
              />
            )}

            {scrollable ? (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, contentStyle]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.content, contentStyle]}>{children}</View>
            )}

            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.modal,
    borderTopRightRadius: borderRadius.modal,
  },
  fullScreen: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.modalPadding,
    paddingBottom: spacing["3xl"],
  },
  footer: {
    padding: spacing.modalPadding,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
});

export default BaseModal;
