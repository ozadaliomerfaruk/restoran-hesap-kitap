/**
 * Rol Seçimi
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { colors, spacing } from "../../../shared/constants";
import { ROLES } from "../types";
import type { RestaurantUser } from "../../../types";

interface Props {
  value: RestaurantUser["role"];
  onChange: (role: RestaurantUser["role"]) => void;
  disabled?: boolean;
}

export function RolSecimi({ value, onChange, disabled }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rol</Text>

      <View style={styles.options}>
        {ROLES.map((role) => {
          const isSelected = value === role.value;

          return (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.option,
                isSelected && {
                  borderColor: role.color,
                  backgroundColor: `${role.color}08`,
                },
                disabled && styles.optionDisabled,
              ]}
              onPress={() => onChange(role.value)}
              disabled={disabled}
            >
              <View style={[styles.dot, { backgroundColor: role.color }]} />
              <Text
                style={[
                  styles.label,
                  isSelected && { color: role.color, fontWeight: "600" },
                ]}
              >
                {role.label}
              </Text>
              {isSelected && <Check size={16} color={role.color} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 14,
    color: colors.text.primary,
  },
});
