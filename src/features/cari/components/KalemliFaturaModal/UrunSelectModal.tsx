/**
 * UrunSelectModal Component
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Plus, Search, Tag, Package } from "lucide-react-native";
import { formatCurrency } from "../../../../shared/utils";
import { Urun, Kategori } from "../../../../types";
import { styles } from "./styles";
import { AddUrunForm } from "./AddUrunForm";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectUrun: (urun: Urun) => void;
  urunler: Urun[];
  kategoriler: Kategori[];
  onAddUrun: (data: any) => Promise<{ error: any }>;
  onRefreshUrunler: () => void;
}

export const UrunSelectModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelectUrun,
  urunler,
  kategoriler,
  onAddUrun,
  onRefreshUrunler,
}) => {
  const [searchText, setSearchText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const getGroupedUrunler = () => {
    const filtered = urunler.filter(
      (u) =>
        u.is_active && u.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const grouped: {
      title: string;
      data: Urun[];
      kategoriId: string | null;
    }[] = [];

    // Kategorisiz ürünler
    const kategorisiz = filtered.filter((u) => !u.kategori_id);
    if (kategorisiz.length > 0) {
      grouped.push({
        title: "Kategorisiz",
        data: kategorisiz,
        kategoriId: null,
      });
    }

    // Kategorili ürünler
    kategoriler.forEach((kat) => {
      const katUrunler = filtered.filter((u) => u.kategori_id === kat.id);
      if (katUrunler.length > 0) {
        grouped.push({
          title: kat.name,
          data: katUrunler,
          kategoriId: kat.id,
        });
      }
    });

    return grouped;
  };

  const handleClose = () => {
    setSearchText("");
    setShowAddForm(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView
        style={styles.urunModalContainer}
        edges={["top", "left", "right"]}
      >
        {/* Header */}
        <View style={styles.urunModalHeader}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.urunModalTitle}>Ürün Seç</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={24} color={showAddForm ? "#ef4444" : "#10b981"} />
          </TouchableOpacity>
        </View>

        {/* Add Form */}
        {showAddForm && (
          <AddUrunForm
            kategoriler={kategoriler}
            onAdd={async (data) => {
              const result = await onAddUrun(data);
              if (!result.error) {
                await onRefreshUrunler();
                setShowAddForm(false);
              }
              return result;
            }}
          />
        )}

        {/* Search */}
        <View style={styles.urunSearchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.urunSearchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Ürün ara..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* List */}
        <SectionList
          sections={getGroupedUrunler()}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Tag size={14} color="#6b7280" />
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
              <Text style={styles.sectionHeaderCount}>
                ({section.data.length})
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.urunItem}
              onPress={() => {
                onSelectUrun(item);
                handleClose();
              }}
            >
              <View style={styles.urunItemIcon}>
                <Package size={20} color="#3b82f6" />
              </View>
              <View style={styles.urunItemInfo}>
                <Text style={styles.urunItemName}>{item.name}</Text>
                <Text style={styles.urunItemMeta}>
                  {item.unit}
                  {item.default_price
                    ? ` • ${formatCurrency(item.default_price)}`
                    : ""}
                  {item.kdv_rate !== undefined
                    ? ` • %${item.kdv_rate} KDV`
                    : ""}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyUrun}>
              <Text style={styles.emptyUrunText}>
                {searchText ? "Ürün bulunamadı" : "Henüz ürün tanımlı değil"}
              </Text>
              {!showAddForm && (
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setShowAddForm(true)}
                >
                  <Plus size={16} color="#10b981" />
                  <Text style={styles.emptyAddBtnText}>Ürün Ekle</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};
