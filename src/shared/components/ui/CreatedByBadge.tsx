/**
 * İşlemi Yapan Kullanıcı Etiketi
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { User } from "lucide-react-native";
import { colors, spacing } from "../../constants";

interface CreatedByUser {
  id: string;
  name?: string;
  email?: string;
}

interface Props {
  user?: CreatedByUser | null;
  size?: "small" | "medium";
  showIcon?: boolean;
}

export function CreatedByBadge({
  user,
  size = "small",
  showIcon = true,
}: Props) {
  if (!user) return null;

  // İsmin baş harflerini al veya email'den kullanıcı adını çıkar
  const displayName = user.name
    ? getShortName(user.name)
    : user.email?.split("@")[0] || "?";

  const isSmall = size === "small";

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      {showIcon && (
        <User size={isSmall ? 10 : 12} color={colors.text.tertiary} />
      )}
      <Text style={[styles.text, isSmall && styles.textSmall]}>
        {displayName}
      </Text>
    </View>
  );
}

// İsmi kısalt: "Ahmet Yılmaz" -> "Ahmet Y."
function getShortName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0];

  return `${firstName} ${lastInitial}.`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  containerSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  textSmall: {
    fontSize: 11,
  },
});
