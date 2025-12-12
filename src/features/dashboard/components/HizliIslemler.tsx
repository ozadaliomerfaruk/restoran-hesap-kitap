/**
 * Hızlı İşlemler
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TrendingUp, Banknote } from "lucide-react-native";
import { colors, spacing, borderRadius, textStyles } from "@/shared/constants";

interface HizliIslemlerProps {
  onCiroPress: () => void;
  onHakedisPress: () => void;
}

export function HizliIslemler({
  onCiroPress,
  onHakedisPress,
}: HizliIslemlerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hızlı İşlemler</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={onCiroPress}>
          <View
            style={[styles.iconBox, { backgroundColor: colors.success.light }]}
          >
            <TrendingUp size={22} color={colors.success.main} />
          </View>
          <Text style={styles.buttonText}>Günlük Ciro Gir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onHakedisPress}>
          <View
            style={[styles.iconBox, { backgroundColor: colors.secondary[50] }]}
          >
            <Banknote size={22} color={colors.secondary[500]} />
          </View>
          <Text style={styles.buttonText}>Personel Hakediş</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  button: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    textAlign: "center",
  },
});

export default HizliIslemler;
