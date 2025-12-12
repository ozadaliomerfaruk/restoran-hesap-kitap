// KategoriModal Component - Kategori seçim modal

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Check, Search, PlusCircle } from "lucide-react-native";
import { Kategori } from "../../../types";

interface KategoriModalProps {
  visible: boolean;
  kategoriler: Kategori[];
  selectedKategoriId: string;
  onClose: () => void;
  onSelect: (kategoriId: string) => void;
  onAddKategori: (
    name: string,
    parentId: string | null
  ) => Promise<string | null>;
}

export const KategoriModal: React.FC<KategoriModalProps> = ({
  visible,
  kategoriler,
  selectedKategoriId,
  onClose,
  onSelect,
  onAddKategori,
}) => {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");
  const [newKategoriParentId, setNewKategoriParentId] = useState<string | null>(
    null
  );
  const [adding, setAdding] = useState(false);

  const giderKategoriler = kategoriler.filter((k) => k.type === "gider");
  const anaKategoriler = giderKategoriler.filter((k) => !k.parent_id);

  const handleAddKategori = async () => {
    setAdding(true);
    const newId = await onAddKategori(newKategoriName, newKategoriParentId);
    setAdding(false);
    if (newId) {
      onSelect(newId);
      setShowAddForm(false);
      setNewKategoriName("");
      setNewKategoriParentId(null);
      onClose();
    }
  };

  const handleSelect = (kategoriId: string) => {
    onSelect(kategoriId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Kategori Seç</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Yeni Kategori Ekleme */}
        {!showAddForm ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddForm(true)}
          >
            <PlusCircle size={20} color="#3b82f6" />
            <Text style={styles.addBtnText}>Yeni Kategori Ekle</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.addForm}>
            <View style={styles.addFormHeader}>
              <Text style={styles.addFormTitle}>Yeni Kategori</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddForm(false);
                  setNewKategoriName("");
                  setNewKategoriParentId(null);
                }}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.addInput}
              placeholder="Kategori adı"
              placeholderTextColor="#9ca3af"
              value={newKategoriName}
              onChangeText={setNewKategoriName}
              autoFocus
            />

            <Text style={styles.addLabel}>Üst Kategori (Opsiyonel)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.parentScroll}
            >
              <TouchableOpacity
                style={[
                  styles.parentChip,
                  newKategoriParentId === null && styles.parentChipActive,
                ]}
                onPress={() => setNewKategoriParentId(null)}
              >
                <Text
                  style={[
                    styles.parentChipText,
                    newKategoriParentId === null && styles.parentChipTextActive,
                  ]}
                >
                  Ana Kategori
                </Text>
              </TouchableOpacity>
              {anaKategoriler.map((kat) => (
                <TouchableOpacity
                  key={kat.id}
                  style={[
                    styles.parentChip,
                    newKategoriParentId === kat.id && styles.parentChipActive,
                  ]}
                  onPress={() => setNewKategoriParentId(kat.id)}
                >
                  <Text
                    style={[
                      styles.parentChipText,
                      newKategoriParentId === kat.id &&
                        styles.parentChipTextActive,
                    ]}
                  >
                    {kat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.addSaveBtn, adding && styles.addSaveBtnDisabled]}
              onPress={handleAddKategori}
              disabled={adding}
            >
              <Text style={styles.addSaveText}>
                {adding ? "Ekleniyor..." : "Kategori Ekle"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Arama */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Kategori ara..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Kategori Listesi */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContent}
        >
          {/* Kategorisiz */}
          <TouchableOpacity
            style={[
              styles.item,
              selectedKategoriId === "" && styles.itemActive,
            ]}
            onPress={() => handleSelect("")}
          >
            <Text
              style={[
                styles.itemText,
                selectedKategoriId === "" && styles.itemTextActive,
              ]}
            >
              Kategorisiz
            </Text>
            {selectedKategoriId === "" && <Check size={20} color="#10b981" />}
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Hiyerarşik Liste */}
          {anaKategoriler
            .filter(
              (k) =>
                search === "" ||
                k.name.toLowerCase().includes(search.toLowerCase()) ||
                giderKategoriler.some(
                  (sub) =>
                    sub.parent_id === k.id &&
                    sub.name.toLowerCase().includes(search.toLowerCase())
                )
            )
            .map((anaKategori) => {
              const altKategoriler = giderKategoriler
                .filter((k) => k.parent_id === anaKategori.id)
                .filter(
                  (k) =>
                    search === "" ||
                    k.name.toLowerCase().includes(search.toLowerCase())
                );

              return (
                <View key={anaKategori.id} style={styles.group}>
                  <TouchableOpacity
                    style={[
                      styles.anaItem,
                      selectedKategoriId === anaKategori.id &&
                        styles.itemActive,
                    ]}
                    onPress={() => handleSelect(anaKategori.id)}
                  >
                    <Text style={styles.anaItemText}>{anaKategori.name}</Text>
                    {selectedKategoriId === anaKategori.id && (
                      <Check size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>

                  {altKategoriler.map((alt) => (
                    <TouchableOpacity
                      key={alt.id}
                      style={[
                        styles.altItem,
                        selectedKategoriId === alt.id && styles.itemActive,
                      ]}
                      onPress={() => handleSelect(alt.id)}
                    >
                      <Text
                        style={[
                          styles.altItemText,
                          selectedKategoriId === alt.id &&
                            styles.itemTextActive,
                        ]}
                      >
                        {alt.name}
                      </Text>
                      {selectedKategoriId === alt.id && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}

          {giderKategoriler.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Henüz gider kategorisi eklenmemiş
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827" },
  closeBtn: { padding: 4 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
  },
  addBtnText: { fontSize: 14, fontWeight: "600", color: "#3b82f6" },
  addForm: {
    margin: 16,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addFormHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addFormTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  addInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  addLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  parentScroll: { marginBottom: 12 },
  parentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  parentChipActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  parentChipText: { fontSize: 13, color: "#6b7280" },
  parentChipTextActive: { color: "#fff" },
  addSaveBtn: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  addSaveBtnDisabled: { opacity: 0.6 },
  addSaveText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 12 },
  scrollView: { flex: 1, marginTop: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  itemActive: { backgroundColor: "#ecfdf5" },
  itemText: { fontSize: 15, color: "#374151" },
  itemTextActive: { color: "#10b981", fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 8 },
  group: { marginBottom: 8 },
  anaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
  },
  anaItemText: { fontSize: 15, fontWeight: "600", color: "#111827" },
  altItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingLeft: 32,
    paddingRight: 16,
    borderRadius: 10,
  },
  altItemText: { fontSize: 14, color: "#6b7280" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#9ca3af" },
});
