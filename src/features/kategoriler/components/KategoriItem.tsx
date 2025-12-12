// KategoriItem Component - Recursive kategori listesi

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  ChevronRight,
  ChevronDown,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react-native";
import { Kategori } from "../../../types";
import { HierarchicalKategori } from "../types";

interface KategoriItemProps {
  kategori: HierarchicalKategori;
  level?: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (kategori: Kategori) => void;
  onDelete: (kategori: Kategori) => void;
  onAddChild: (parentId: string) => void;
}

export const KategoriItem: React.FC<KategoriItemProps> = ({
  kategori,
  level = 0,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const hasChildren = kategori.children && kategori.children.length > 0;

  return (
    <View>
      <View style={[styles.kategoriItem, { paddingLeft: 16 + level * 24 }]}>
        {hasChildren ? (
          <TouchableOpacity
            style={styles.expandBtn}
            onPress={() => onToggleExpand(kategori.id)}
          >
            {isExpanded ? (
              <ChevronDown size={18} color="#6b7280" />
            ) : (
              <ChevronRight size={18} color="#6b7280" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.expandBtnPlaceholder} />
        )}

        <View style={styles.kategoriInfo}>
          <Text style={styles.kategoriName}>{kategori.name}</Text>
          {kategori.is_default && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Varsayılan</Text>
            </View>
          )}
        </View>

        <View style={styles.kategoriActions}>
          {!kategori.is_default && (
            <>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onEdit(kategori)}
              >
                <Edit3 size={16} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => onDelete(kategori)}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </>
          )}
          {level === 0 && (
            <TouchableOpacity
              style={styles.addChildBtn}
              onPress={() => onAddChild(kategori.id)}
            >
              <Plus size={14} color="#10b981" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Children - Recursive render */}
      {isExpanded &&
        kategori.children?.map((child) => (
          <KategoriChildItem
            key={child.id}
            kategori={child}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </View>
  );
};

// Alt kategori item (children olmadığı için basit)
interface KategoriChildItemProps {
  kategori: Kategori;
  level: number;
  onEdit: (kategori: Kategori) => void;
  onDelete: (kategori: Kategori) => void;
}

const KategoriChildItem: React.FC<KategoriChildItemProps> = ({
  kategori,
  level,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={[styles.kategoriItem, { paddingLeft: 16 + level * 24 }]}>
      <View style={styles.expandBtnPlaceholder} />

      <View style={styles.kategoriInfo}>
        <Text style={styles.kategoriName}>{kategori.name}</Text>
        {kategori.is_default && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Varsayılan</Text>
          </View>
        )}
      </View>

      <View style={styles.kategoriActions}>
        {!kategori.is_default && (
          <>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onEdit(kategori)}
            >
              <Edit3 size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onDelete(kategori)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  kategoriItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  expandBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  expandBtnPlaceholder: {
    width: 28,
  },
  kategoriInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kategoriName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  defaultBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  kategoriActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  addChildBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
});
