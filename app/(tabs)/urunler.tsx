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
  Package,
  Search,
  X,
  Edit3,
  Trash2,
  Check,
  ChevronDown,
  Tag,
  Scale,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { Urun, Kategori } from "../../src/types";
import { supabase } from "../../src/lib/supabase";

const birimler = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gr", label: "Gram (gr)" },
  { value: "lt", label: "Litre (lt)" },
  { value: "ml", label: "Mililitre (ml)" },
  { value: "adet", label: "Adet" },
  { value: "paket", label: "Paket" },
  { value: "kutu", label: "Kutu" },
  { value: "koli", label: "Koli" },
  { value: "bidon", label: "Bidon" },
  { value: "porsiyon", label: "Porsiyon" },
  { value: "deste", label: "Deste" },
];

export default function UrunlerScreen() {
  const {
    profile,
    fetchProfile,
    urunler,
    fetchUrunler,
    kategoriler,
    fetchKategoriler,
    addUrun,
    updateUrun,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUrun, setEditingUrun] = useState<Urun | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formKategoriId, setFormKategoriId] = useState<string | null>(null);
  const [formUnit, setFormUnit] = useState("adet");
  const [formDefaultPrice, setFormDefaultPrice] = useState("");
  const [formKdvRate, setFormKdvRate] = useState("10");
  const [formLoading, setFormLoading] = useState(false);

  // Dropdown state
  const [showKategoriDropdown, setShowKategoriDropdown] = useState(false);
  const [showBirimDropdown, setShowBirimDropdown] = useState(false);
  const [showKdvDropdown, setShowKdvDropdown] = useState(false);

  const kdvOranlari = [
    { value: "0", label: "%0 KDV" },
    { value: "1", label: "%1 KDV" },
    { value: "10", label: "%10 KDV" },
    { value: "20", label: "%20 KDV" },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchUrunler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUrunler(), fetchKategoriler()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Tedarikçi kategorisinin alt kategorileri (malzeme kategorileri)
  const tedarikciKategori = kategoriler.find(
    (k) => k.name.toLowerCase() === "tedarikçi" && k.type === "gider"
  );
  const urunKategoriler = tedarikciKategori
    ? kategoriler.filter((k) => k.parent_id === tedarikciKategori.id)
    : [];

  const openAddModal = () => {
    setEditingUrun(null);
    setFormName("");
    setFormKategoriId(null);
    setFormUnit("adet");
    setFormDefaultPrice("");
    setFormKdvRate("10");
    setShowAddModal(true);
  };

  const openEditModal = (urun: Urun) => {
    setEditingUrun(urun);
    setFormName(urun.name);
    setFormKategoriId(urun.kategori_id || null);
    setFormUnit(urun.unit);
    setFormDefaultPrice(urun.default_price?.toString() || "");
    setFormKdvRate(urun.kdv_rate?.toString() || "10");
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("Hata", "Ürün adı girin");
      return;
    }

    setFormLoading(true);

    try {
      const urunData = {
        name: formName.trim(),
        kategori_id: formKategoriId || undefined,
        unit: formUnit,
        default_price: formDefaultPrice
          ? parseFloat(formDefaultPrice)
          : undefined,
        kdv_rate: formKdvRate ? parseInt(formKdvRate) : 10,
        is_active: true,
        restaurant_id: profile?.restaurant_id || "",
      };

      if (editingUrun) {
        const { error } = await updateUrun(editingUrun.id, urunData);
        if (error) throw error;
        Alert.alert("Başarılı", "Ürün güncellendi");
      } else {
        const { error } = await addUrun(urunData);
        if (error) throw error;
        Alert.alert("Başarılı", "Ürün eklendi");
      }

      setShowAddModal(false);
      fetchUrunler();
    } catch (error) {
      console.error("Ürün kaydetme hatası:", error);
      Alert.alert("Hata", "Ürün kaydedilirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (urun: Urun) => {
    Alert.alert(
      "Ürün Sil",
      `"${urun.name}" ürününü silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("urunler")
                .delete()
                .eq("id", urun.id);

              if (error) throw error;
              fetchUrunler();
            } catch (error) {
              Alert.alert("Hata", "Ürün silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  const toggleActive = async (urun: Urun) => {
    try {
      await updateUrun(urun.id, { is_active: !urun.is_active });
      fetchUrunler();
    } catch (error) {
      Alert.alert("Hata", "Ürün durumu güncellenemedi");
    }
  };

  // Arama filtresi
  const filteredUrunler = urunler.filter(
    (u) =>
      u.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (u.kategori?.name || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const getKategoriName = (kategoriId: string | null) => {
    if (!kategoriId) return "Kategori Seçilmedi";
    const kat = kategoriler.find((k) => k.id === kategoriId);
    return kat?.name || "Kategori Seçilmedi";
  };

  const getBirimLabel = (value: string) => {
    return birimler.find((b) => b.value === value)?.label || value;
  };

  const renderUrun = ({ item }: { item: Urun }) => (
    <View style={[styles.urunCard, !item.is_active && styles.urunCardInactive]}>
      <View style={styles.urunLeft}>
        <View
          style={[styles.urunIcon, !item.is_active && styles.urunIconInactive]}
        >
          <Package size={20} color={item.is_active ? "#3b82f6" : "#9ca3af"} />
        </View>
        <View style={styles.urunInfo}>
          <Text
            style={[
              styles.urunName,
              !item.is_active && styles.urunNameInactive,
            ]}
          >
            {item.name}
          </Text>
          <View style={styles.urunMeta}>
            {item.kategori ? (
              <View style={styles.kategoriTag}>
                <Tag size={10} color="#6b7280" />
                <Text style={styles.kategoriTagText}>{item.kategori.name}</Text>
              </View>
            ) : null}
            <View style={styles.birimTag}>
              <Scale size={10} color="#6b7280" />
              <Text style={styles.birimTagText}>{item.unit}</Text>
            </View>
          </View>
          {item.default_price ? (
            <Text style={styles.urunPrice}>
              Varsayılan: {formatCurrency(item.default_price)}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.urunActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => openEditModal(item)}
        >
          <Edit3 size={16} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item)}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ürünler</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Arama */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Ürün veya kategori ara..."
          placeholderTextColor="#9ca3af"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <X size={18} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Özet */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {urunler.filter((u) => u.is_active).length}
          </Text>
          <Text style={styles.summaryLabel}>Aktif Ürün</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {urunler.filter((u) => !u.is_active).length}
          </Text>
          <Text style={styles.summaryLabel}>Pasif Ürün</Text>
        </View>
      </View>

      {/* Ürün Listesi */}
      <FlatList
        data={filteredUrunler}
        keyExtractor={(item) => item.id}
        renderItem={renderUrun}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {searchText
                ? "Aramanızla eşleşen ürün bulunamadı"
                : "Henüz ürün eklenmemiş"}
            </Text>
            {!searchText ? (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={openAddModal}
              >
                <Text style={styles.emptyButtonText}>İlk Ürünü Ekle</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />

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
              {editingUrun ? "Ürün Düzenle" : "Yeni Ürün"}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={formLoading}>
              <Check size={24} color={formLoading ? "#9ca3af" : "#10b981"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Ürün Adı */}
            <Text style={styles.formLabel}>Ürün Adı *</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="Örn: Domates, Tavuk Göğsü, Deterjan"
              placeholderTextColor="#9ca3af"
            />

            {/* Kategori */}
            <Text style={styles.formLabel}>Kategori</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowKategoriDropdown(!showKategoriDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !formKategoriId && styles.dropdownPlaceholder,
                ]}
              >
                {getKategoriName(formKategoriId)}
              </Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>

            {showKategoriDropdown ? (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormKategoriId(null);
                    setShowKategoriDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    Kategori Seçilmedi
                  </Text>
                </TouchableOpacity>
                {urunKategoriler.map((kat) => (
                  <TouchableOpacity
                    key={kat.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormKategoriId(kat.id);
                      setShowKategoriDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{kat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}

            {/* Birim */}
            <Text style={styles.formLabel}>Birim *</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowBirimDropdown(!showBirimDropdown)}
            >
              <Text style={styles.dropdownText}>{getBirimLabel(formUnit)}</Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>

            {showBirimDropdown ? (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {birimler.map((birim) => (
                  <TouchableOpacity
                    key={birim.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormUnit(birim.value);
                      setShowBirimDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{birim.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}

            {/* Varsayılan Fiyat */}
            <Text style={styles.formLabel}>
              Varsayılan Birim Fiyat (Opsiyonel)
            </Text>
            <View style={styles.priceInput}>
              <Text style={styles.currencySymbol}>₺</Text>
              <TextInput
                style={styles.priceTextInput}
                value={formDefaultPrice}
                onChangeText={setFormDefaultPrice}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.helperText}>
              Alış girişinde bu fiyat otomatik gelir
            </Text>

            {/* KDV Oranı */}
            <Text style={styles.formLabel}>KDV Oranı</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowKdvDropdown(!showKdvDropdown)}
            >
              <Text style={styles.dropdownText}>
                {kdvOranlari.find((k) => k.value === formKdvRate)?.label ||
                  "%10 KDV"}
              </Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>

            {showKdvDropdown ? (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {kdvOranlari.map((kdv) => (
                  <TouchableOpacity
                    key={kdv.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFormKdvRate(kdv.value);
                      setShowKdvDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{kdv.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 19,
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  summaryLabel: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  urunCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  urunCardInactive: {
    opacity: 0.6,
  },
  urunLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  urunIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  urunIconInactive: {
    backgroundColor: "#f3f4f6",
  },
  urunInfo: {
    flex: 1,
    marginLeft: 12,
  },
  urunName: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  urunNameInactive: {
    color: "#9ca3af",
  },
  urunMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  kategoriTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  kategoriTagText: {
    fontSize: 19,
    color: "#6b7280",
  },
  birimTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  birimTagText: {
    fontSize: 19,
    color: "#6b7280",
  },
  urunPrice: {
    fontSize: 19,
    color: "#10b981",
    marginTop: 4,
  },
  urunActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
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
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 19,
    color: "#111827",
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: {
    fontSize: 19,
    color: "#111827",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 20,
    color: "#111827",
    paddingVertical: 14,
  },
  helperText: {
    fontSize: 19,
    color: "#9ca3af",
    marginTop: 8,
  },
});
