/**
 * ScreenContainer - Tutarlı ekran container
 */

import React from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../constants";

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollEnabled?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export function ScreenContainer({
  children,
  scrollEnabled = true,
  refreshing,
  onRefresh,
  padded = false,
  keyboardAvoiding = true,
  backgroundColor = colors.background.secondary,
  style,
  contentStyle,
  edges = ["top", "bottom"],
}: ScreenContainerProps) {
  const content = (
    <View style={[styles.content, padded && styles.padded, contentStyle]}>
      {children}
    </View>
  );

  const scrollContent = scrollEnabled ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        ) : undefined
      }
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  const mainContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {scrollContent}
    </KeyboardAvoidingView>
  ) : (
    scrollContent
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={edges}
    >
      {mainContent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1 },
  padded: { padding: spacing.screenPadding },
});

export default ScreenContainer;
