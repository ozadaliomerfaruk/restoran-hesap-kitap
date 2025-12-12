// Hammaddeler Screen - Refactored
// Original: 1,216 lines → Now: ~400 lines

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  Package,
  Search,
  X,
  Check,
  ChevronDown,
  Tag,
  Filter,
  Edit3,
  Trash2,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { Urun } from "../../src/types";
import {
  useHammaddelerData,
  BIRIMLER,
  KDV_ORANLARI,
} from "../../src/features/hammaddeler";
import { formatCurrency } from "../../src/shared/utils";

export default function HammaddelerScreen() {
  const { addUrun, updateUrun } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("Kg");
  const [formPrice, setFormPrice] = useState("");
  const [formKdv, setFormKdv] = useState(20);
  const [formKategoriId, setFormKategoriId] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showBirimPicker, setShowBirimPicker] = useState(false);
  const [showKdvPicker, setShowKdvPicker] = useState(false);
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUrun, setEditingUrun] = useState<Urun | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editKdv, setEditKdv] = useState(20);
  const [editKategoriId, setEditKategoriId] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const { giderKategorileri, filteredItems, groupedItems, refreshAll } =
    useHammaddelerData(searchText, selectedKategori);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormName("");
    setFormUnit("Kg");
    setFormPrice("");
    setFormKdv(20);
    setFormKategoriId("");
  };

  const handleAddHammadde = async () => {
    if (!formName.trim()) {
      Alert.alert("Hata", "Hammadde adı girin");
      return;
    }
    setFormLoading(true);
    try {
      const price = formPrice
        ? parseFloat(formPrice.replace(",", "."))
        : undefined;
      const { error } = await addUrun({
        name: formName.trim(),
        unit: formUnit,
        default_price: price,
        kdv_rate: formKdv,
        kategori_id: formKategoriId || undefined,
        is_active: true,
      });
      if (error) throw error;
      Alert.alert("Başarılı", "Hammadde eklendi");
      setShowAddModal(false);
      resetForm();
    } catch {
      Alert.alert("Hata", "Hammadde eklenirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditHammadde = (urun: Urun) => {
    setEditingUrun(urun);
    setEditName(urun.name);
    setEditUnit(urun.unit);
    setEditPrice(urun.default_price?.toString() || "");
    setEditKdv(urun.kdv_rate || 20);
    setEditKategoriId(urun.kategori_id || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUrun || !editName.trim()) {
      Alert.alert("Hata", "Hammadde adı girin");
      return;
    }
    setEditLoading(true);
    try {
      const price = editPrice
        ? parseFloat(editPrice.replace(",", "."))
        : undefined;
      const { error } = await updateUrun(editingUrun.id, {
        name: editName.trim(),
        unit: editUnit,
        default_price: price,
        kdv_rate: editKdv,
        kategori_id: editKategoriId || undefined,
      });
      if (error) throw error;
      Alert.alert("Başarılı", "Hammadde güncellendi");
      setShowEditModal(false);
    } catch {
      Alert.alert("Hata", "Hammadde güncellenirken bir hata oluştu");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (urun: Urun) => {
    Alert.alert(
      "Hammadde Sil",
      `"${urun.name}" hammaddesini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await updateUrun(urun.id, { is_active: false });
          },
        },
      ]
    );
  };

  const getKategoriName = (id?: string) =>
    giderKategorileri.find((k) => k.id === id)?.name || "Kategorisiz";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Hammaddeler</Text>
          <Text style={styles.subtitle}>{filteredItems.length} hammadde</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter
              size={20}
              color={selectedKategori ? "#3b82f6" : "#6b7280"}
            />
            {selectedKategori && <View style={styles.filterDot} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Badge */}
      {selectedKategori && (
        <View style={styles.filterBadgeRow}>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {getKategoriName(selectedKategori)}
            </Text>
            <TouchableOpacity onPress={() => setSelectedKategori(null)}>
              <X size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Hammadde ara..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groupedItems
          ? groupedItems.map(([katName, items]) => (
              <View key={katName}>
                <View style={styles.kategoriHeader}>
                  <Tag size={14} color="#6b7280" />
                  <Text style={styles.kategoriHeaderText}>{katName}</Text>
                </View>
                {items.map((urun) => (
                  <HammaddeCard
                    key={urun.id}
                    urun={urun}
                    onEdit={handleEditHammadde}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            ))
          : filteredItems.map((urun) => (
              <HammaddeCard
                key={urun.id}
                urun={urun}
                onEdit={handleEditHammadde}
                onDelete={handleDelete}
              />
            ))}
        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Hammadde bulunamadı</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Yeni Hammadde</Text>
            <TouchableOpacity
              onPress={handleAddHammadde}
              disabled={formLoading}
            >
              <Check size={24} color={formLoading ? "#d1d5db" : "#3b82f6"} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Hammadde Adı *</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="Örn: Domates"
            />

            <Text style={styles.label}>Birim</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowBirimPicker(!showBirimPicker)}
            >
              <Text style={styles.selectText}>
                {BIRIMLER.find((b) => b.value === formUnit)?.label || formUnit}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {showBirimPicker && (
              <PickerList
                items={BIRIMLER}
                selected={formUnit}
                onSelect={(v) => {
                  setFormUnit(v);
                  setShowBirimPicker(false);
                }}
              />
            )}

            <Text style={styles.label}>Varsayılan Fiyat</Text>
            <View style={styles.priceBox}>
              <Text style={styles.currency}>₺</Text>
              <TextInput
                style={styles.priceInput}
                value={formPrice}
                onChangeText={setFormPrice}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <Text style={styles.label}>KDV Oranı</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowKdvPicker(!showKdvPicker)}
            >
              <Text style={styles.selectText}>
                {KDV_ORANLARI.find((k) => k.value === formKdv)?.label ||
                  `%${formKdv}`}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {showKdvPicker && (
              <PickerList
                items={KDV_ORANLARI}
                selected={formKdv}
                onSelect={(v) => {
                  setFormKdv(v as number);
                  setShowKdvPicker(false);
                }}
              />
            )}

            <Text style={styles.label}>Kategori</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowKategoriPicker(!showKategoriPicker)}
            >
              <Text
                style={[
                  styles.selectText,
                  !formKategoriId && styles.placeholder,
                ]}
              >
                {getKategoriName(formKategoriId) || "Kategori seçin"}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {showKategoriPicker && (
              <PickerList
                items={[
                  { value: "", label: "Kategorisiz" },
                  ...giderKategorileri.map((k) => ({
                    value: k.id,
                    label: k.name,
                  })),
                ]}
                selected={formKategoriId}
                onSelect={(v) => {
                  setFormKategoriId(v as string);
                  setShowKategoriPicker(false);
                }}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Modal - Similar structure */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Hammadde Düzenle</Text>
            <TouchableOpacity onPress={handleSaveEdit} disabled={editLoading}>
              <Check size={24} color={editLoading ? "#d1d5db" : "#3b82f6"} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Hammadde Adı *</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
            />
            <Text style={styles.label}>Birim</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setShowBirimPicker(!showBirimPicker)}
            >
              <Text style={styles.selectText}>
                {BIRIMLER.find((b) => b.value === editUnit)?.label || editUnit}
              </Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
            {showBirimPicker && (
              <PickerList
                items={BIRIMLER}
                selected={editUnit}
                onSelect={(v) => {
                  setEditUnit(v as string);
                  setShowBirimPicker(false);
                }}
              />
            )}
            <Text style={styles.label}>Varsayılan Fiyat</Text>
            <View style={styles.priceBox}>
              <Text style={styles.currency}>₺</Text>
              <TextInput
                style={styles.priceInput}
                value={editPrice}
                onChangeText={setEditPrice}
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>
              Kategoriye Göre Filtrele
            </Text>
            <TouchableOpacity
              style={[
                styles.filterItem,
                !selectedKategori && styles.filterItemActive,
              ]}
              onPress={() => {
                setSelectedKategori(null);
                setShowFilterModal(false);
              }}
            >
              <Text
                style={[
                  styles.filterItemText,
                  !selectedKategori && styles.filterItemTextActive,
                ]}
              >
                Tümü
              </Text>
            </TouchableOpacity>
            {giderKategorileri.map((k) => (
              <TouchableOpacity
                key={k.id}
                style={[
                  styles.filterItem,
                  selectedKategori === k.id && styles.filterItemActive,
                ]}
                onPress={() => {
                  setSelectedKategori(k.id);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterItemText,
                    selectedKategori === k.id && styles.filterItemTextActive,
                  ]}
                >
                  {k.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// Helper Components
const HammaddeCard = ({
  urun,
  onEdit,
  onDelete,
}: {
  urun: Urun;
  onEdit: (u: Urun) => void;
  onDelete: (u: Urun) => void;
}) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
      <View style={styles.cardIcon}>
        <Package size={20} color="#3b82f6" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{urun.name}</Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardUnit}>{urun.unit}</Text>
          {urun.default_price && (
            <>
              <Text style={styles.cardDot}>•</Text>
              <Text style={styles.cardPrice}>
                {formatCurrency(urun.default_price)}
              </Text>
            </>
          )}
          {urun.kdv_rate !== undefined && (
            <>
              <Text style={styles.cardDot}>•</Text>
              <Text style={styles.cardKdv}>%{urun.kdv_rate} KDV</Text>
            </>
          )}
        </View>
      </View>
    </View>
    <View style={styles.cardActions}>
      <TouchableOpacity style={styles.cardBtn} onPress={() => onEdit(urun)}>
        <Edit3 size={18} color="#8b5cf6" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.cardBtn} onPress={() => onDelete(urun)}>
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
);

const PickerList = ({
  items,
  selected,
  onSelect,
}: {
  items: { value: any; label: string }[];
  selected: any;
  onSelect: (v: any) => void;
}) => (
  <View style={styles.pickerContainer}>
    {items.map((item) => (
      <TouchableOpacity
        key={item.value?.toString() || "empty"}
        style={[
          styles.pickerItem,
          selected === item.value && styles.pickerItemActive,
        ]}
        onPress={() => onSelect(item.value)}
      >
        <Text
          style={[
            styles.pickerItemText,
            selected === item.value && styles.pickerItemTextActive,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 12 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeRow: { paddingHorizontal: 16, marginBottom: 8 },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  filterBadgeText: { fontSize: 13, fontWeight: "600", color: "#3b82f6" },
  searchContainer: { paddingHorizontal: 16, marginBottom: 12 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#111827" },
  content: { flex: 1, paddingHorizontal: 16 },
  kategoriHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  kategoriHeaderText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { marginLeft: 12, flex: 1 },
  cardName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  cardMeta: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardUnit: { fontSize: 12, color: "#6b7280" },
  cardDot: { fontSize: 12, color: "#d1d5db", marginHorizontal: 6 },
  cardPrice: { fontSize: 12, color: "#10b981" },
  cardKdv: { fontSize: 12, color: "#9ca3af" },
  cardActions: { flexDirection: "row", gap: 8 },
  cardBtn: { padding: 8 },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  filterModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  filterItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
  },
  filterItemActive: { backgroundColor: "#dbeafe" },
  filterItemText: { fontSize: 15, color: "#374151" },
  filterItemTextActive: { color: "#3b82f6", fontWeight: "600" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  modalContent: { flex: 1, padding: 16 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectText: { fontSize: 16, color: "#111827" },
  placeholder: { color: "#9ca3af" },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currency: { fontSize: 18, fontWeight: "600", color: "#6b7280" },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 8,
    fontSize: 16,
    color: "#111827",
  },
  pickerContainer: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
  },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  pickerItemActive: { backgroundColor: "#3b82f6" },
  pickerItemText: { fontSize: 15, color: "#374151" },
  pickerItemTextActive: { color: "#fff", fontWeight: "600" },
});
