/**
 * Kullanıcı Kartı
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { User, ChevronRight, Shield } from "lucide-react-native";
import { colors, spacing } from "../../../shared/constants";
import { ROLES, PERMISSION_LEVELS } from "../types";
import type { RestaurantUser } from "../../../types";

interface Props {
  user: RestaurantUser;
  onPress: () => void;
  isCurrentUser: boolean;
}

export function KullaniciCard({ user, onPress, isCurrentUser }: Props) {
  const role = ROLES.find((r) => r.value === user.role);
  const level = PERMISSION_LEVELS.find(
    (l) => l.value === user.permissions?.level
  );

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: role?.color || colors.primary[500] },
        ]}
      >
        <User size={20} color="#fff" />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.user?.name || "İsimsiz Kullanıcı"}
          </Text>
          {isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youText}>Sen</Text>
            </View>
          )}
        </View>

        <Text style={styles.email} numberOfLines={1}>
          {user.user?.email}
        </Text>

        <View style={styles.badges}>
          <View
            style={[styles.roleBadge, { backgroundColor: `${role?.color}15` }]}
          >
            <Text style={[styles.roleText, { color: role?.color }]}>
              {role?.label}
            </Text>
          </View>

          <View style={styles.levelBadge}>
            <Shield size={12} color={colors.text.tertiary} />
            <Text style={styles.levelText}>{level?.label}</Text>
          </View>
        </View>
      </View>

      <ChevronRight size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  youBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  email: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  levelText: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
});
