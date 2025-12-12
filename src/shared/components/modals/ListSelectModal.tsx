/**
 * ListSelectModal - Liste seçim modalı
 * Kasa, Cari, Kategori vb. seçimlerde kullanılır
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Check } from "lucide-react-native";
import {
  colors,
  spacing,
  borderRadius,
  textStyles,
  iconSize,
} from "../../constants";
import { BaseModal } from "./BaseModal";
import { SearchInput } from "../forms/SearchInput";
import { EmptyState } from "../ui/EmptyState";

export interface ListSelectItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ListSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: ListSelectItem) => void;
  title: string;
  items: ListSelectItem[];
  selectedId?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;
}

export function ListSelectModal({
  visible,
  onClose,
  onSelect,
  title,
  items,
  selectedId,
  searchable = true,
  searchPlaceholder = "Ara...",
  emptyTitle = "Sonuç bulunamadı",
  emptyDescription,
  loading = false,
}: ListSelectModalProps) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.subtitle?.toLowerCase().includes(searchLower)
    );
  }, [items, search]);

  const handleSelect = (item: ListSelectItem) => {
    if (item.disabled) return;
    onSelect(item);
    onClose();
    setSearch("");
  };

  const renderItem = ({ item }: { item: ListSelectItem }) => {
    const isSelected = item.id === selectedId;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          isSelected && styles.itemSelected,
          item.disabled && styles.itemDisabled,
        ]}
        onPress={() => handleSelect(item)}
        disabled={item.disabled}
        activeOpacity={0.7}
      >
        {item.icon && <View style={styles.itemIcon}>{item.icon}</View>}

        <View style={styles.itemContent}>
          <Text
            style={[
              styles.itemTitle,
              isSelected && styles.itemTitleSelected,
              item.disabled && styles.itemTitleDisabled,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          {item.subtitle && (
            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
        </View>

        {isSelected && <Check size={iconSize.md} color={colors.primary[500]} />}
      </TouchableOpacity>
    );
  };

  return (
    <BaseModal
      visible={visible}
      onClose={() => {
        onClose();
        setSearch("");
      }}
      title={title}
      scrollable={false}
      contentStyle={styles.content}
    >
      {searchable && items.length > 5 && (
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder={searchPlaceholder}
          containerStyle={styles.search}
        />
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            compact
          />
        }
      />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 0,
    flex: 1,
  },
  search: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    padding: spacing.sm,
    paddingBottom: spacing["3xl"],
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
  },
  itemSelected: {
    backgroundColor: colors.primary[50],
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...textStyles.body,
    color: colors.text.primary,
  },
  itemTitleSelected: {
    color: colors.primary[700],
    fontWeight: "600",
  },
  itemTitleDisabled: {
    color: colors.text.disabled,
  },
  itemSubtitle: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

export default ListSelectModal;
