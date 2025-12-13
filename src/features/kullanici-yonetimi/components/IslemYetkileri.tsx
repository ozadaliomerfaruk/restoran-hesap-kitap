/**
 * İşlem Yetki Seviyesi Seçimi
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Eye, Edit, Trash2, Check } from "lucide-react-native";
import { colors, spacing } from "../../../shared/constants";
import { PERMISSION_LEVELS } from "../types";
import type { UserPermissions, PermissionLevel } from "../../../types";

interface Props {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
  disabled?: boolean;
}

const LEVEL_ICONS = {
  readonly: Eye,
  own: Edit,
  full: Trash2,
};

export function IslemYetkileri({ permissions, onChange, disabled }: Props) {
  const selectLevel = (level: PermissionLevel) => {
    if (disabled) return;
    onChange({ ...permissions, level });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İşlem Yetki Seviyesi</Text>

      <View style={styles.options}>
        {PERMISSION_LEVELS.map((level) => {
          const isSelected = permissions.level === level.value;
          const Icon = LEVEL_ICONS[level.value];

          return (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => selectLevel(level.value)}
              disabled={disabled}
            >
              <View style={styles.optionHeader}>
                <View
                  style={[
                    styles.iconWrap,
                    isSelected && styles.iconWrapSelected,
                  ]}
                >
                  <Icon
                    size={18}
                    color={
                      isSelected ? colors.primary[500] : colors.text.tertiary
                    }
                  />
                </View>
                <View style={styles.optionInfo}>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text style={styles.optionDesc}>{level.description}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Check size={18} color={colors.primary[500]} />
                  </View>
                )}
              </View>
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
    gap: spacing.sm,
  },
  option: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 10,
    backgroundColor: colors.background.primary,
  },
  optionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: `${colors.primary[500]}08`,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapSelected: {
    backgroundColor: `${colors.primary[500]}15`,
  },
  optionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.primary,
  },
  optionLabelSelected: {
    color: colors.primary[500],
  },
  optionDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
});
