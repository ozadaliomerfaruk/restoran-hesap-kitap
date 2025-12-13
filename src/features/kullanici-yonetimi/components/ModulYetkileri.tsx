/**
 * Modül Yetkileri Checkbox Listesi
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { colors, spacing } from "../../../shared/constants";
import { MODULES } from "../types";
import type { UserPermissions } from "../../../types";

interface Props {
  permissions: UserPermissions;
  onChange: (permissions: UserPermissions) => void;
  disabled?: boolean;
}

export function ModulYetkileri({ permissions, onChange, disabled }: Props) {
  const toggleModule = (key: keyof UserPermissions["modules"]) => {
    if (disabled) return;

    onChange({
      ...permissions,
      modules: {
        ...permissions.modules,
        [key]: !permissions.modules[key],
      },
    });
  };

  const selectAll = () => {
    if (disabled) return;

    const allSelected = MODULES.every((m) => permissions.modules[m.key]);
    const newModules = {} as UserPermissions["modules"];

    MODULES.forEach((m) => {
      newModules[m.key] = !allSelected;
    });

    onChange({ ...permissions, modules: newModules });
  };

  const selectedCount = MODULES.filter(
    (m) => permissions.modules[m.key]
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modül Erişimleri</Text>
        <TouchableOpacity onPress={selectAll} disabled={disabled}>
          <Text style={[styles.selectAll, disabled && styles.disabled]}>
            {selectedCount === MODULES.length ? "Tümünü Kaldır" : "Tümünü Seç"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {MODULES.map((module) => {
          const isChecked = permissions.modules[module.key];

          return (
            <TouchableOpacity
              key={module.key}
              style={[
                styles.item,
                isChecked && styles.itemChecked,
                disabled && styles.itemDisabled,
              ]}
              onPress={() => toggleModule(module.key)}
              disabled={disabled}
            >
              <View
                style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              >
                {isChecked && <Check size={14} color="#fff" />}
              </View>
              <Text style={[styles.label, isChecked && styles.labelChecked]}>
                {module.label}
              </Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectAll: {
    fontSize: 13,
    color: colors.primary[500],
    fontWeight: "500",
  },
  disabled: {
    opacity: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    backgroundColor: colors.background.primary,
  },
  itemChecked: {
    borderColor: colors.primary[500],
    backgroundColor: `${colors.primary[500]}08`,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  label: {
    fontSize: 14,
    color: colors.text.primary,
  },
  labelChecked: {
    fontWeight: "500",
    color: colors.primary[500],
  },
});
