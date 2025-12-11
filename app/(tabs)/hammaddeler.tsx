import { useState, useEffect, useMemo } from "react";
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
import { useRouter } from "expo-router";
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
  ArrowLeft,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { Urun, Kategori } from "../../src/types";

const BIRIMLER = [
  { value: "Kg", label: "Kilogram (kg)" },
  { value: "Gram", label: "Gram (gr)" },
  { value: "Litre", label: "Litre (lt)" },
  { value: "Adet", label: "Adet" },
  { value: "Paket", label: "Paket" },
  { value: "Kutu", label: "Kutu" },
  { value: "Kasa", label: "Kasa" },
  { value: "Demet", label: "Demet" },
  { value: "Porsiyon", label: "Porsiyon" },
];

const KDV_ORANLARI = [
  { value: 0, label: "%0" },
  { value: 1, label: "%1" },
  { value: 10, label: "%10" },
  { value: 20, label: "%20" },
];

export default function HammaddelerScreen() {
  const router = useRouter();
  const {
    profile,
    fetchProfile,
    urunler,
    fetchUrunler,
    addUrun,
    updateUrun,
    kategoriler,
    fetchKategoriler,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Filtre
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Yeni hammadde modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("Kg");
  const [formPrice, setFormPrice] = useState("");
  const [formKdv, setFormKdv] = useState<number>(20);
  const [formKategoriId, setFormKategoriId] = useState<string>("");
  const [formLoading, setFormLoading] = useState(false);

  // Picker modal'ları
  const [showBirimPicker, setShowBirimPicker] = useState(false);
  const [showKdvPicker, setShowKdvPicker] = useState(false);
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);

  // Düzenleme modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUrun, setEditingUrun] = useState<Urun | null>(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editKdv, setEditKdv] = useState<number>(20);
  const [editKategoriId, setEditKategoriId] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);

  // Edit picker modal'ları
  const [showEditBirimPicker, setShowEditBirimPicker] = useState(false);
  const [showEditKdvPicker, setShowEditKdvPicker] = useState(false);
  const [showEditKategoriPicker, setShowEditKategoriPicker] = useState(false);

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

  // Gider kategorileri (hammaddeler için)
  const giderKategorileri = useMemo(() => {
    return kategoriler.filter((k) => k.type === "gider");
  }, [kategoriler]);

  // Filtrelenmiş hammaddeler
  const filteredItems = useMemo(() => {
    let items = urunler.filter((u) => u.is_active);

    // Arama filtresi
    if (searchText) {
      items = items.filter((u) =>
        u.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Kategori filtresi
    if (selectedKategori) {
      items = items.filter((u) => u.kategori_id === selectedKategori);
    }

    return items.sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [urunler, searchText, selectedKategori]);

  // Kategori bazlı gruplandırılmış hammaddeler
  const groupedItems = useMemo(() => {
    const groups: { kategori: Kategori | null; items: Urun[] }[] = [];
    const kategoriIds = new Set<string | null>();

    filteredItems.forEach((item) => {
      kategoriIds.add(item.kategori_id || null);
    });

    // Önce kategorili olanlar
    const sortedKategoriIds = Array.from(kategoriIds).sort((a, b) => {
      if (a === null) return 1;
      if (b === null) return -1;
      const katA = kategoriler.find((k) => k.id === a);
      const katB = kategoriler.find((k) => k.id === b);
      return (katA?.name || "").localeCompare(katB?.name || "", "tr");
    });

    sortedKategoriIds.forEach((katId) => {
      const kat = katId
        ? kategoriler.find((k) => k.id === katId) || null
        : null;
      groups.push({
        kategori: kat,
        items: filteredItems.filter(
          (item) => (item.kategori_id || null) === katId
        ),
      });
    });

    return groups;
  }, [filteredItems, kategoriler]);

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
    } catch (error) {
      console.error("Hammadde ekleme hatası:", error);
      Alert.alert("Hata", "Hammadde eklenirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormUnit("Kg");
    setFormPrice("");
    setFormKdv(20);
    setFormKategoriId("");
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
    if (!editingUrun) return;

    if (!editName.trim()) {
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
      setEditingUrun(null);
    } catch (error) {
      console.error("Hammadde güncelleme hatası:", error);
      Alert.alert("Hata", "Hammadde güncellenirken bir hata oluştu");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteHammadde = (urun: Urun) => {
    Alert.alert(
      "Hammadde Sil",
      `"${urun.name}" hammaddesini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const { error } = await updateUrun(urun.id, { is_active: false });
            if (error) {
              Alert.alert("Hata", "Hammadde silinemedi");
            }
          },
        },
      ]
    );
  };

  const getKategoriName = (kategoriId: string | undefined) => {
    if (!kategoriId) return "Kategorisiz";
    const kat = kategoriler.find((k) => k.id === kategoriId);
    return kat?.name || "Kategorisiz";
  };

  const renderKategoriHeader = (kategori: Kategori | null) => (
    <View style={styles.kategoriHeader}>
      <View style={styles.kategoriHeaderLine} />
      <View style={styles.kategoriHeaderContent}>
        <Tag size={14} color="#6b7280" />
        <Text style={styles.kategoriHeaderText}>
          {kategori?.name || "Kategorisiz"}
        </Text>
      </View>
      <View style={styles.kategoriHeaderLine} />
    </View>
  );

  const renderHammaddeCard = (urun: Urun) => {
    return (
      <View key={urun.id} style={styles.hammaddeCard}>
        <View style={styles.hammaddeLeft}>
          <View style={styles.hammaddeIcon}>
            <Package size={20} color="#3b82f6" />
          </View>
          <View style={styles.hammaddeInfo}>
            <Text style={styles.hammaddeName}>{urun.name}</Text>
            <View style={styles.hammaddeMeta}>
              <Text style={styles.hammaddeUnit}>{urun.unit}</Text>
              {urun.default_price !== undefined && urun.default_price > 0 && (
                <>
                  <Text style={styles.hammaddeDot}>•</Text>
                  <Text style={styles.hammaddePrice}>
                    {formatCurrency(urun.default_price)}
                  </Text>
                </>
              )}
              {urun.kdv_rate !== undefined && (
                <>
                  <Text style={styles.hammaddeDot}>•</Text>
                  <Text style={styles.hammaddeKdv}>%{urun.kdv_rate} KDV</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.hammaddeActions}>
          <TouchableOpacity
            style={styles.hammaddeActionBtn}
            onPress={() => handleEditHammadde(urun)}
          >
            <Edit3 size={18} color="#8b5cf6" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.hammaddeActionBtn}
            onPress={() => handleDeleteHammadde(urun)}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Hammaddeler</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Arama ve Filtre */}
      <View style={styles.searchFilterRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Hammadde ara..."
            placeholderTextColor="#9ca3af"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, selectedKategori && styles.filterBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={16} color={selectedKategori ? "#fff" : "#6b7280"} />
        </TouchableOpacity>
      </View>

      {/* Özet */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{filteredItems.length}</Text>
          <Text style={styles.summaryLabel}>Hammadde</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {
              new Set(filteredItems.map((u) => u.kategori_id).filter(Boolean))
                .size
            }
          </Text>
          <Text style={styles.summaryLabel}>Kategori</Text>
        </View>
      </View>

      {/* Liste */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {groupedItems.length > 0 ? (
          groupedItems.map((group, groupIndex) => (
            <View key={group.kategori?.id || `group-${groupIndex}`}>
              {groupedItems.length > 1 && renderKategoriHeader(group.kategori)}
              {group.items.map((urun) => renderHammaddeCard(urun))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Package size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {searchText
                ? "Aramanızla eşleşen hammadde bulunamadı"
                : "Henüz hammadde eklenmemiş"}
            </Text>
            <Text style={styles.emptySubtext}>
              Tedarikçiden aldığınız malzemeleri buraya ekleyin
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Alt Buton */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={22} color="#fff" />
          <Text style={styles.addBtnText}>Yeni Hammadde</Text>
        </TouchableOpacity>
      </View>

      {/* Filtre Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>
              Kategoriye Göre Filtrele
            </Text>

            <TouchableOpacity
              style={[
                styles.filterOption,
                !selectedKategori && styles.filterOptionActive,
              ]}
              onPress={() => {
                setSelectedKategori(null);
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>Tümü</Text>
              {!selectedKategori && <Check size={18} color="#3b82f6" />}
            </TouchableOpacity>

            <ScrollView style={{ maxHeight: 300 }}>
              {giderKategorileri.map((kat) => (
                <TouchableOpacity
                  key={kat.id}
                  style={[
                    styles.filterOption,
                    selectedKategori === kat.id && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedKategori(kat.id);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={styles.filterOptionText}>{kat.name}</Text>
                  {selectedKategori === kat.id && (
                    <Check size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Yeni Hammadde Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Yeni Hammadde</Text>
              <TouchableOpacity
                onPress={handleAddHammadde}
                disabled={formLoading}
              >
                <Check size={24} color={formLoading ? "#9ca3af" : "#10b981"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Hammadde Adı *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Örn: Dana Kıyma, Ayçiçek Yağı"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Birim *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowAddModal(false);
                  setTimeout(() => setShowBirimPicker(true), 300);
                }}
              >
                <Text style={styles.dropdownText}>
                  {BIRIMLER.find((b) => b.value === formUnit)?.label ||
                    formUnit}
                </Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Varsayılan Fiyat</Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={styles.priceInput}
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="0,00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>

              <Text style={styles.inputLabel}>KDV Oranı</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowAddModal(false);
                  setTimeout(() => setShowKdvPicker(true), 300);
                }}
              >
                <Text style={styles.dropdownText}>%{formKdv}</Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Kategori</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowAddModal(false);
                  setTimeout(() => setShowKategoriPicker(true), 300);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !formKategoriId && styles.dropdownPlaceholder,
                  ]}
                >
                  {formKategoriId
                    ? getKategoriName(formKategoriId)
                    : "Kategori seçin"}
                </Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Bu hammaddeler tedarikçi kalemli alış faturasında seçilebilir
                  olacak.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Birim Picker */}
      <Modal visible={showBirimPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowBirimPicker(false);
            setTimeout(() => setShowAddModal(true), 300);
          }}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Birim Seçin</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              {BIRIMLER.map((birim) => (
                <TouchableOpacity
                  key={birim.value}
                  style={[
                    styles.pickerItem,
                    formUnit === birim.value && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setFormUnit(birim.value);
                    setShowBirimPicker(false);
                    setTimeout(() => setShowAddModal(true), 300);
                  }}
                >
                  <Text style={styles.pickerItemText}>{birim.label}</Text>
                  {formUnit === birim.value && (
                    <Check size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* KDV Picker */}
      <Modal visible={showKdvPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowKdvPicker(false);
            setTimeout(() => setShowAddModal(true), 300);
          }}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>KDV Oranı Seçin</Text>
            {KDV_ORANLARI.map((kdv) => (
              <TouchableOpacity
                key={kdv.value}
                style={[
                  styles.pickerItem,
                  formKdv === kdv.value && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setFormKdv(kdv.value);
                  setShowKdvPicker(false);
                  setTimeout(() => setShowAddModal(true), 300);
                }}
              >
                <Text style={styles.pickerItemText}>{kdv.label}</Text>
                {formKdv === kdv.value && <Check size={18} color="#3b82f6" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Kategori Picker */}
      <Modal visible={showKategoriPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowKategoriPicker(false);
            setTimeout(() => setShowAddModal(true), 300);
          }}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Kategori Seçin</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  !formKategoriId && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setFormKategoriId("");
                  setShowKategoriPicker(false);
                  setTimeout(() => setShowAddModal(true), 300);
                }}
              >
                <Text style={[styles.pickerItemText, { color: "#9ca3af" }]}>
                  Kategorisiz
                </Text>
                {!formKategoriId && <Check size={18} color="#3b82f6" />}
              </TouchableOpacity>
              {giderKategorileri.map((kat) => (
                <TouchableOpacity
                  key={kat.id}
                  style={[
                    styles.pickerItem,
                    formKategoriId === kat.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setFormKategoriId(kat.id);
                    setShowKategoriPicker(false);
                    setTimeout(() => setShowAddModal(true), 300);
                  }}
                >
                  <Text style={styles.pickerItemText}>{kat.name}</Text>
                  {formKategoriId === kat.id && (
                    <Check size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Düzenleme Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Hammadde Düzenle</Text>
              <TouchableOpacity onPress={handleSaveEdit} disabled={editLoading}>
                <Check size={24} color={editLoading ? "#9ca3af" : "#10b981"} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Hammadde Adı *</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Hammadde adı"
                placeholderTextColor="#9ca3af"
              />

              <Text style={styles.inputLabel}>Birim *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowEditModal(false);
                  setTimeout(() => setShowEditBirimPicker(true), 300);
                }}
              >
                <Text style={styles.dropdownText}>
                  {BIRIMLER.find((b) => b.value === editUnit)?.label ||
                    editUnit}
                </Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Varsayılan Fiyat</Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={styles.priceInput}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  placeholder="0,00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>

              <Text style={styles.inputLabel}>KDV Oranı</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowEditModal(false);
                  setTimeout(() => setShowEditKdvPicker(true), 300);
                }}
              >
                <Text style={styles.dropdownText}>%{editKdv}</Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Kategori</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setShowEditModal(false);
                  setTimeout(() => setShowEditKategoriPicker(true), 300);
                }}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !editKategoriId && styles.dropdownPlaceholder,
                  ]}
                >
                  {editKategoriId
                    ? getKategoriName(editKategoriId)
                    : "Kategori seçin"}
                </Text>
                <ChevronDown size={18} color="#6b7280" />
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Birim Picker */}
      <Modal visible={showEditBirimPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowEditBirimPicker(false);
            setTimeout(() => setShowEditModal(true), 300);
          }}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Birim Seçin</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              {BIRIMLER.map((birim) => (
                <TouchableOpacity
                  key={birim.value}
                  style={[
                    styles.pickerItem,
                    editUnit === birim.value && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setEditUnit(birim.value);
                    setShowEditBirimPicker(false);
                    setTimeout(() => setShowEditModal(true), 300);
                  }}
                >
                  <Text style={styles.pickerItemText}>{birim.label}</Text>
                  {editUnit === birim.value && (
                    <Check size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit KDV Picker */}
      <Modal visible={showEditKdvPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowEditKdvPicker(false);
            setTimeout(() => setShowEditModal(true), 300);
          }}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>KDV Oranı Seçin</Text>
            {KDV_ORANLARI.map((kdv) => (
              <TouchableOpacity
                key={kdv.value}
                style={[
                  styles.pickerItem,
                  editKdv === kdv.value && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setEditKdv(kdv.value);
                  setShowEditKdvPicker(false);
                  setTimeout(() => setShowEditModal(true), 300);
                }}
              >
                <Text style={styles.pickerItemText}>{kdv.label}</Text>
                {editKdv === kdv.value && <Check size={18} color="#3b82f6" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Kategori Picker */}
      <Modal visible={showEditKategoriPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowEditKategoriPicker(false);
            setTimeout(() => setShowEditModal(true), 300);
          }}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Kategori Seçin</Text>
            <ScrollView style={{ maxHeight: 350 }}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  !editKategoriId && styles.pickerItemActive,
                ]}
                onPress={() => {
                  setEditKategoriId("");
                  setShowEditKategoriPicker(false);
                  setTimeout(() => setShowEditModal(true), 300);
                }}
              >
                <Text style={[styles.pickerItemText, { color: "#9ca3af" }]}>
                  Kategorisiz
                </Text>
                {!editKategoriId && <Check size={18} color="#3b82f6" />}
              </TouchableOpacity>
              {giderKategorileri.map((kat) => (
                <TouchableOpacity
                  key={kat.id}
                  style={[
                    styles.pickerItem,
                    editKategoriId === kat.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setEditKategoriId(kat.id);
                    setShowEditKategoriPicker(false);
                    setTimeout(() => setShowEditModal(true), 300);
                  }}
                >
                  <Text style={styles.pickerItemText}>{kat.name}</Text>
                  {editKategoriId === kat.id && (
                    <Check size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827" },
  searchFilterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtnActive: { backgroundColor: "#3b82f6" },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  summaryValue: { fontSize: 24, fontWeight: "700", color: "#111827" },
  summaryLabel: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  listContainer: { flex: 1, marginTop: 16 },
  listContent: { paddingHorizontal: 16 },
  kategoriHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 10,
  },
  kategoriHeaderLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  kategoriHeaderContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  kategoriHeaderText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  hammaddeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  hammaddeLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  hammaddeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  hammaddeInfo: { marginLeft: 12, flex: 1 },
  hammaddeName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  hammaddeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  hammaddeUnit: { fontSize: 13, color: "#6b7280" },
  hammaddeDot: { fontSize: 13, color: "#d1d5db", marginHorizontal: 6 },
  hammaddePrice: { fontSize: 13, color: "#10b981", fontWeight: "500" },
  hammaddeKdv: { fontSize: 13, color: "#6b7280" },
  hammaddeActions: { flexDirection: "row", gap: 8 },
  hammaddeActionBtn: { padding: 8 },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    backgroundColor: "#f9fafb",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  addBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  filterModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 20,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  filterOptionActive: { backgroundColor: "#eff6ff" },
  filterOptionText: { fontSize: 15, color: "#111827" },

  // Picker Modal
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  pickerItemActive: { backgroundColor: "#eff6ff" },
  pickerItemText: { fontSize: 15, color: "#111827" },

  // Add/Edit Modal
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  modalContent: { flex: 1, padding: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  dropdownText: { fontSize: 15, color: "#111827" },
  dropdownPlaceholder: { color: "#9ca3af" },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
  },
  infoBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  infoText: { fontSize: 13, color: "#3b82f6", lineHeight: 18 },
});
