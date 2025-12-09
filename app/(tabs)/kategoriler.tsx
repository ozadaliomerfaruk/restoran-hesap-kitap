import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  FolderTree,
  ChevronRight,
  ChevronDown,
  X,
  Edit3,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { Kategori } from "../../src/types";
import { supabase } from "../../src/lib/supabase";

export default function KategorilerScreen() {
  const { profile, fetchProfile, kategoriler, fetchKategoriler } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"gelir" | "gider">("gider");
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Expanded categories
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Active tab
  const [activeTab, setActiveTab] = useState<"gider" | "gelir">("gider");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKategoriler();
    setRefreshing(false);
  };

  // Kategorileri hiyerarşik olarak düzenle
  const buildHierarchy = (type: "gelir" | "gider") => {
    const filtered = kategoriler.filter((k) => k.type === type);
    const rootCategories = filtered.filter((k) => !k.parent_id);

    return rootCategories.map((root) => ({
      ...root,
      children: filtered.filter((k) => k.parent_id === root.id),
    }));
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const openAddModal = (parentId: string | null = null) => {
    setEditingKategori(null);
    setFormName("");
    setFormType(activeTab);
    setFormParentId(parentId);
    setShowAddModal(true);
  };

  const openEditModal = (kategori: Kategori) => {
    setEditingKategori(kategori);
    setFormName(kategori.name);
    setFormType(kategori.type);
    setFormParentId(kategori.parent_id || null);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("Hata", "Kategori adı girin");
      return;
    }

    setFormLoading(true);

    try {
      if (editingKategori) {
        // Güncelle
        const { error } = await supabase
          .from("kategoriler")
          .update({
            name: formName.trim(),
            type: formType,
            parent_id: formParentId,
          })
          .eq("id", editingKategori.id);

        if (error) throw error;
        Alert.alert("Başarılı", "Kategori güncellendi");
      } else {
        // Yeni ekle
        const { error } = await supabase.from("kategoriler").insert({
          name: formName.trim(),
          type: formType,
          parent_id: formParentId,
          restaurant_id: profile?.restaurant_id,
          is_default: false,
        });

        if (error) throw error;
        Alert.alert("Başarılı", "Kategori eklendi");
      }

      setShowAddModal(false);
      fetchKategoriler();
    } catch (error) {
      console.error("Kategori kaydetme hatası:", error);
      Alert.alert("Hata", "Kategori kaydedilirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (kategori: Kategori) => {
    if (kategori.is_default) {
      Alert.alert("Hata", "Varsayılan kategoriler silinemez");
      return;
    }

    // Alt kategorisi var mı kontrol et
    const hasChildren = kategoriler.some((k) => k.parent_id === kategori.id);
    if (hasChildren) {
      Alert.alert(
        "Hata",
        "Bu kategorinin alt kategorileri var. Önce onları silin."
      );
      return;
    }

    Alert.alert(
      "Kategori Sil",
      `"${kategori.name}" kategorisini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("kategoriler")
                .delete()
                .eq("id", kategori.id);

              if (error) throw error;
              fetchKategoriler();
            } catch (error) {
              Alert.alert("Hata", "Kategori silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  // Ana kategoriler (parent_id olmayan)
  const getParentCategories = () => {
    return kategoriler.filter((k) => k.type === formType && !k.parent_id);
  };

  const renderKategori = (
    kategori: Kategori & { children?: Kategori[] },
    level: number = 0
  ) => {
    const isExpanded = expandedIds.has(kategori.id);
    const hasChildren = kategori.children && kategori.children.length > 0;

    return (
      <View key={kategori.id}>
        <View style={[styles.kategoriItem, { paddingLeft: 16 + level * 24 }]}>
          {hasChildren ? (
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => toggleExpand(kategori.id)}
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
            {kategori.is_default ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Varsayılan</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.kategoriActions}>
            {!kategori.is_default ? (
              <>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openEditModal(kategori)}
                >
                  <Edit3 size={16} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(kategori)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </>
            ) : null}
            {level === 0 ? (
              <TouchableOpacity
                style={styles.addChildBtn}
                onPress={() => openAddModal(kategori.id)}
              >
                <Plus size={14} color="#10b981" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {isExpanded &&
          kategori.children?.map((child) => renderKategori(child, level + 1))}
      </View>
    );
  };

  const hierarchicalData = buildHierarchy(activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal(null)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "gider" && styles.tabActive]}
          onPress={() => setActiveTab("gider")}
        >
          <ArrowUpRight
            size={18}
            color={activeTab === "gider" ? "#fff" : "#ef4444"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "gider" && styles.tabTextActive,
            ]}
          >
            Gider Kategorileri
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "gelir" && styles.tabActiveGelir]}
          onPress={() => setActiveTab("gelir")}
        >
          <ArrowDownLeft
            size={18}
            color={activeTab === "gelir" ? "#fff" : "#10b981"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "gelir" && styles.tabTextActive,
            ]}
          >
            Gelir Kategorileri
          </Text>
        </TouchableOpacity>
      </View>

      {/* Kategori Listesi */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.listContainer}>
          {hierarchicalData.length > 0 ? (
            hierarchicalData.map((kat) => renderKategori(kat))
          ) : (
            <View style={styles.emptyState}>
              <FolderTree size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                {activeTab === "gider" ? "Gider" : "Gelir"} kategorisi
                bulunamadı
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => openAddModal(null)}
              >
                <Text style={styles.emptyButtonText}>Kategori Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingKategori ? "Kategori Düzenle" : "Yeni Kategori"}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={formLoading}>
              <Check size={24} color={formLoading ? "#9ca3af" : "#10b981"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Kategori Adı */}
            <Text style={styles.formLabel}>Kategori Adı</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="Örn: Tedarikçi, Personel, Fatura"
              placeholderTextColor="#9ca3af"
            />

            {/* Tür */}
            <Text style={styles.formLabel}>Kategori Türü</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  formType === "gider" && styles.typeBtnActiveGider,
                ]}
                onPress={() => {
                  setFormType("gider");
                  setFormParentId(null);
                }}
              >
                <ArrowUpRight
                  size={18}
                  color={formType === "gider" ? "#fff" : "#ef4444"}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    formType === "gider" && styles.typeBtnTextActive,
                  ]}
                >
                  Gider
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  formType === "gelir" && styles.typeBtnActiveGelir,
                ]}
                onPress={() => {
                  setFormType("gelir");
                  setFormParentId(null);
                }}
              >
                <ArrowDownLeft
                  size={18}
                  color={formType === "gelir" ? "#fff" : "#10b981"}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    formType === "gelir" && styles.typeBtnTextActive,
                  ]}
                >
                  Gelir
                </Text>
              </TouchableOpacity>
            </View>

            {/* Üst Kategori */}
            <Text style={styles.formLabel}>Üst Kategori (Opsiyonel)</Text>
            <View style={styles.parentList}>
              <TouchableOpacity
                style={[
                  styles.parentItem,
                  !formParentId && styles.parentItemActive,
                ]}
                onPress={() => setFormParentId(null)}
              >
                <Text
                  style={[
                    styles.parentItemText,
                    !formParentId && styles.parentItemTextActive,
                  ]}
                >
                  Ana Kategori
                </Text>
              </TouchableOpacity>
              {getParentCategories().map((parent) => (
                <TouchableOpacity
                  key={parent.id}
                  style={[
                    styles.parentItem,
                    formParentId === parent.id && styles.parentItemActive,
                  ]}
                  onPress={() => setFormParentId(parent.id)}
                >
                  <Text
                    style={[
                      styles.parentItemText,
                      formParentId === parent.id && styles.parentItemTextActive,
                    ]}
                  >
                    {parent.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  tabActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  tabActiveGelir: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  tabActiveUrun: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  tabText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
  },
  tabTextActive: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  listContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
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
    fontSize: 19,
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
    fontSize: 20,
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
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 19,
    color: "#111827",
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  typeBtnActiveGider: {
    backgroundColor: "#ef4444",
  },
  typeBtnActiveGelir: {
    backgroundColor: "#10b981",
  },
  typeBtnActiveUrun: {
    backgroundColor: "#3b82f6",
  },
  typeBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
  },
  typeBtnTextActive: {
    color: "#fff",
  },
  parentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  parentItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  parentItemActive: {
    backgroundColor: "#3b82f6",
  },
  parentItemText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#374151",
  },
  parentItemTextActive: {
    color: "#fff",
  },
});
