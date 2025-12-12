/**
 * SearchInput - Arama input bileşeni
 */

import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Search, X } from "lucide-react-native";
import {
  colors,
  spacing,
  borderRadius,
  iconSize,
  textStyles,
} from "../../constants";

export interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Ara...",
  onClear,
  containerStyle,
  autoFocus,
}: SearchInputProps) {
  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Search size={iconSize.input} color={colors.text.tertiary} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.disabled}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={iconSize.sm} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
});

export default SearchInput;
