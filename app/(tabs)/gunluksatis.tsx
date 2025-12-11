import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Package,
  Calendar,
  Info,
  Hash,
  Filter,
  Tag,
  Trash2,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { MenuItem, SatisKaydi, UrunKategorisi } from "../../src/types";

type FilterType = "kategori" | "en_cok_satan" | "en_cok_ciro" | null;

const VARSAYILAN_KATEGORILER = [
  "Ana Yemek",
  "Çorba",
  "Salata",
  "Tatlı",
  "İçecek",
  "Kahvaltı",
  "Aperatif",
  "Diğer",
];

const BIRIMLER = [
  "Adet",
  "Porsiyon",
  "Kg",
  "Gram",
  "Litre",
  "Bardak",
  "Dilim",
  "Paket",
];

export default function GunlukSatisScreen() {
  const router = useRouter();
  const {
    profile,
    fetchProfile,
    menuItems,
    fetchMenuItems,
    addMenuItem,
    satisKayitlari,
    fetchSatisKayitlari,
    addSatisKaydi,
    urunKategorileri,
    fetchUrunKategorileri,
    addUrunKategorisi,
    deleteUrunKategorisi,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [expandedUrunId, setExpandedUrunId] = useState<string | null>(null);

  // Filtreleme
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Satış Girişi State
  const [satisAdet, setSatisAdet] = useState("1");
  const [satisFiyat, setSatisFiyat] = useState("");
  const [satisDate, setSatisDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [satisLoading, setSatisLoading] = useState(false);

  // Ürün Ekleme Modal State
  const [showUrunModal, setShowUrunModal] = useState(false);
  const [urunName, setUrunName] = useState("");
  const [urunCategory, setUrunCategory] = useState("");
  const [urunPrice, setUrunPrice] = useState("");
  const [urunUnit, setUrunUnit] = useState("Adet");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [urunLoading, setUrunLoading] = useState(false);

  // Kategori Ekleme
  const [showKategoriEkleModal, setShowKategoriEkleModal] = useState(false);
  const [yeniKategori, setYeniKategori] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchMenuItems();
      fetchSatisKayitlari();
      fetchUrunKategorileri();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMenuItems(),
      fetchSatisKayitlari(),
      fetchUrunKategorileri(),
    ]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Kategorileri birleştir (veritabanı + varsayılan)
  const tumKategoriler = useMemo(() => {
    const dbKategoriler = urunKategorileri.map((k) => k.name);
    const birlesik = [
      ...new Set([...VARSAYILAN_KATEGORILER, ...dbKategoriler]),
    ];
    return birlesik.sort();
  }, [urunKategorileri]);

  // Ürüne ait satış istatistikleri
  const getUrunStats = (urunId: string) => {
    const urunSatislar = satisKayitlari.filter(
      (s) => s.menu_item_id === urunId
    );
    const toplamAdet = urunSatislar.reduce((sum, s) => sum + s.quantity, 0);
    const toplamCiro = urunSatislar.reduce((sum, s) => sum + s.total_price, 0);
    return { toplamAdet, toplamCiro };
  };

  // Filtrelenmiş ve sıralanmış ürünler
  const filteredAndSortedItems = useMemo(() => {
    let items = [...menuItems];

    // Sadece aktif ve faturada gösterilecek ürünler
    items = items.filter((u) => u.is_active && u.include_in_invoice !== false);

    // Arama filtresi
    if (searchText) {
      const search = searchText.toLowerCase();
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.category?.toLowerCase().includes(search)
      );
    }

    // Kategori filtresi
    if (filterType === "kategori" && selectedKategori) {
      items = items.filter((u) => u.category === selectedKategori);
    }

    // En çok satan / En çok ciro sıralaması
    if (filterType === "en_cok_satan" || filterType === "en_cok_ciro") {
      items = items.map((item) => ({
        ...item,
        _stats: getUrunStats(item.id),
      }));

      if (filterType === "en_cok_satan") {
        items.sort(
          (a: any, b: any) => b._stats.toplamAdet - a._stats.toplamAdet
        );
      } else {
        items.sort(
          (a: any, b: any) => b._stats.toplamCiro - a._stats.toplamCiro
        );
      }
    } else {
      // Varsayılan: kategoriye göre grupla
      items.sort((a, b) => {
        if (a.category !== b.category) {
          return (a.category || "").localeCompare(b.category || "");
        }
        return a.name.localeCompare(b.name);
      });
    }

    return items;
  }, [menuItems, searchText, filterType, selectedKategori, satisKayitlari]);

  // Kategorilere göre gruplandırılmış ürünler
  const groupedItems = useMemo(() => {
    if (filterType === "en_cok_satan" || filterType === "en_cok_ciro") {
      return null; // Sıralı liste göster
    }

    const groups: Record<string, MenuItem[]> = {};
    filteredAndSortedItems.forEach((item) => {
      const cat = item.category || "Diğer";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredAndSortedItems, filterType]);

  // Accordion aç/kapa
  const toggleExpand = (urunId: string, urunPrice: number) => {
    if (expandedUrunId === urunId) {
      setExpandedUrunId(null);
    } else {
      setExpandedUrunId(urunId);
      setSatisAdet("1");
      setSatisFiyat(urunPrice?.toString() || "");
      setSatisDate(new Date());
    }
  };

  // Satış Kaydet
  const handleSatisKaydet = async (urun: MenuItem) => {
    const adet = parseInt(satisAdet);
    if (isNaN(adet) || adet <= 0) {
      Alert.alert("Hata", "Geçerli adet girin");
      return;
    }

    const fiyat = parseFloat(satisFiyat.replace(",", "."));
    if (isNaN(fiyat) || fiyat <= 0) {
      Alert.alert("Hata", "Geçerli fiyat girin");
      return;
    }

    setSatisLoading(true);
    const { error } = await addSatisKaydi({
      menu_item_id: urun.id,
      date: satisDate.toISOString().split("T")[0],
      quantity: adet,
      unit_price: fiyat,
    });
    setSatisLoading(false);

    if (error) {
      Alert.alert("Hata", "Satış kaydedilirken bir hata oluştu");
    } else {
      setSatisAdet("1");
      setSatisFiyat(urun.price?.toString() || "");
      setExpandedUrunId(null);
      Alert.alert(
        "Başarılı",
        `${adet} ${urun.unit || "adet"} ${urun.name} satışı kaydedildi`
      );
    }
  };

  // Ürün Kaydet
  const handleUrunKaydet = async () => {
    if (!urunName.trim()) {
      Alert.alert("Hata", "Ürün adı girin");
      return;
    }
    if (!urunCategory) {
      Alert.alert("Hata", "Kategori seçin");
      return;
    }

    const price = parseFloat(urunPrice.replace(",", ".")) || 0;

    setUrunLoading(true);
    const { error } = await addMenuItem({
      name: urunName.trim(),
      category: urunCategory,
      price: price,
      unit: urunUnit,
      is_active: true,
      include_in_invoice: true,
    });

    if (error) {
      Alert.alert("Hata", "Ürün eklenirken bir hata oluştu");
    } else {
      setShowUrunModal(false);
      resetUrunForm();
      Alert.alert("Başarılı", "Ürün eklendi");
    }
    setUrunLoading(false);
  };

  const resetUrunForm = () => {
    setUrunName("");
    setUrunCategory("");
    setUrunPrice("");
    setUrunUnit("Adet");
  };

  // Kategori Ekle
  const handleKategoriEkle = async () => {
    if (!yeniKategori.trim()) {
      Alert.alert("Hata", "Kategori adı girin");
      return;
    }

    const { error } = await addUrunKategorisi(yeniKategori.trim());
    if (error) {
      Alert.alert("Hata", "Kategori eklenemedi");
    } else {
      setYeniKategori("");
      setShowKategoriEkleModal(false);
    }
  };

  // Kategori Sil
  const handleKategoriSil = (kategori: UrunKategorisi) => {
    Alert.alert(
      "Kategori Sil",
      `"${kategori.name}" kategorisini silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => deleteUrunKategorisi(kategori.id),
        },
      ]
    );
  };

  // Render Ürün Kartı
  const renderUrunCard = (item: MenuItem, showCategory: boolean = true) => {
    const isExpanded = expandedUrunId === item.id;
    const stats = getUrunStats(item.id);

    return (
      <View key={item.id} style={styles.urunCardContainer}>
        <TouchableOpacity
          style={[styles.urunCard, isExpanded && styles.urunCardExpanded]}
          onPress={() => toggleExpand(item.id, item.price)}
          activeOpacity={0.7}
        >
          <View style={styles.urunLeft}>
            <View
              style={[styles.urunIcon, isExpanded && styles.urunIconExpanded]}
            >
              <Package size={20} color={isExpanded ? "#fff" : "#8b5cf6"} />
            </View>
            <View style={styles.urunInfo}>
              <Text style={styles.urunName}>{item.name}</Text>
              {showCategory && (
                <Text style={styles.urunCategory}>{item.category}</Text>
              )}
              <View style={styles.urunStats}>
                <Text style={styles.urunStatText}>
                  {stats.toplamAdet} satış • {formatCurrency(stats.toplamCiro)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.urunRight}>
            <Text style={styles.urunPrice}>{formatCurrency(item.price)}</Text>
            <Text style={styles.urunUnit}>{item.unit || "Adet"}</Text>
            {isExpanded ? (
              <ChevronUp size={20} color="#8b5cf6" />
            ) : (
              <ChevronDown size={20} color="#9ca3af" />
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded Satış Girişi */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Tarih */}
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Tarih</Text>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={18} color="#6b7280" />
                <Text style={styles.dateBtnText}>{formatDate(satisDate)}</Text>
              </TouchableOpacity>
            </View>

            {/* Adet ve Fiyat */}
            <View style={styles.inputRowDouble}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Adet</Text>
                <TextInput
                  style={styles.inputField}
                  value={satisAdet}
                  onChangeText={setSatisAdet}
                  keyboardType="number-pad"
                  placeholder="1"
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Birim Fiyat</Text>
                <View style={styles.priceInputBox}>
                  <Text style={styles.currencySymbol}>₺</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={satisFiyat}
                    onChangeText={setSatisFiyat}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
            </View>

            {/* Toplam */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  (parseInt(satisAdet) || 0) *
                    (parseFloat(satisFiyat.replace(",", ".")) || 0)
                )}
              </Text>
            </View>

            {/* Butonlar */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                  router.push(`/gunluksatisurundetay?id=${item.id}`)
                }
              >
                <Info size={18} color="#6b7280" />
                <Text style={styles.detailBtnText}>Ürün Detayı</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, satisLoading && { opacity: 0.6 }]}
                onPress={() => handleSatisKaydet(item)}
                disabled={satisLoading}
              >
                <Check size={18} color="#fff" />
                <Text style={styles.saveBtnText}>
                  {satisLoading ? "..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Filtre Badge
  const getFilterLabel = () => {
    if (filterType === "kategori" && selectedKategori) {
      return selectedKategori;
    }
    if (filterType === "en_cok_satan") return "En Çok Satan";
    if (filterType === "en_cok_ciro") return "En Çok Ciro";
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Satış Takip</Text>
          <Text style={styles.subtitle}>{menuItems.length} ürün</Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={filterType ? "#8b5cf6" : "#6b7280"} />
          {filterType && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Aktif Filtre Badge */}
      {getFilterLabel() && (
        <View style={styles.filterBadgeRow}>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{getFilterLabel()}</Text>
            <TouchableOpacity
              onPress={() => {
                setFilterType(null);
                setSelectedKategori(null);
              }}
            >
              <X size={16} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Arama */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün ara..."
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

      {/* Ürün Listesi */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyboardShouldPersistTaps="handled"
      >
        {groupedItems
          ? // Kategoriye göre gruplandırılmış
            groupedItems.map(([kategori, items]) => (
              <View key={kategori}>
                <View style={styles.kategoriBanner}>
                  <Tag size={14} color="#8b5cf6" />
                  <Text style={styles.kategoriBannerText}>{kategori}</Text>
                  <Text style={styles.kategoriBannerCount}>{items.length}</Text>
                </View>
                {items.map((item) => renderUrunCard(item, false))}
              </View>
            ))
          : // Sıralı liste (filtreli)
            filteredAndSortedItems.map((item, index) => (
              <View key={item.id}>
                {filterType && (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                )}
                {renderUrunCard(item, true)}
              </View>
            ))}

        {filteredAndSortedItems.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
            <Text style={styles.emptyText}>
              {searchText ? "Aramanızla eşleşen ürün yok" : "Yeni ürün ekleyin"}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Yeni Ürün Ekle Butonu (Altta) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={() => setShowUrunModal(true)}
        >
          <Plus size={22} color="#fff" />
          <Text style={styles.addProductBtnText}>Yeni Ürün Ekle</Text>
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
            <Text style={styles.filterModalTitle}>Filtrele & Sırala</Text>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === "en_cok_satan" && styles.filterOptionActive,
              ]}
              onPress={() => {
                setFilterType("en_cok_satan");
                setSelectedKategori(null);
                setShowFilterModal(false);
              }}
            >
              <TrendingUp
                size={20}
                color={filterType === "en_cok_satan" ? "#8b5cf6" : "#6b7280"}
              />
              <Text
                style={[
                  styles.filterOptionText,
                  filterType === "en_cok_satan" &&
                    styles.filterOptionTextActive,
                ]}
              >
                En Çok Satan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterType === "en_cok_ciro" && styles.filterOptionActive,
              ]}
              onPress={() => {
                setFilterType("en_cok_ciro");
                setSelectedKategori(null);
                setShowFilterModal(false);
              }}
            >
              <BarChart3
                size={20}
                color={filterType === "en_cok_ciro" ? "#8b5cf6" : "#6b7280"}
              />
              <Text
                style={[
                  styles.filterOptionText,
                  filterType === "en_cok_ciro" && styles.filterOptionTextActive,
                ]}
              >
                En Çok Ciro Yapan
              </Text>
            </TouchableOpacity>

            <View style={styles.filterDivider} />
            <Text style={styles.filterSectionTitle}>Kategoriye Göre</Text>

            <ScrollView style={styles.kategoriList}>
              {tumKategoriler.map((kat) => (
                <TouchableOpacity
                  key={kat}
                  style={[
                    styles.filterOption,
                    filterType === "kategori" &&
                      selectedKategori === kat &&
                      styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setFilterType("kategori");
                    setSelectedKategori(kat);
                    setShowFilterModal(false);
                  }}
                >
                  <Tag
                    size={18}
                    color={
                      filterType === "kategori" && selectedKategori === kat
                        ? "#8b5cf6"
                        : "#6b7280"
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === "kategori" &&
                        selectedKategori === kat &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {kat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filterType && (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setFilterType(null);
                  setSelectedKategori(null);
                  setShowFilterModal(false);
                }}
              >
                <X size={18} color="#ef4444" />
                <Text style={styles.clearFilterText}>Filtreyi Temizle</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Ürün Ekleme Modal */}
      <Modal visible={showUrunModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.urunModal}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.urunModalTitle}>Yeni Ürün Ekle</Text>

                    {/* Ürün Adı */}
                    <Text style={styles.formLabel}>Ürün Adı</Text>
                    <TextInput
                      style={styles.formInput}
                      value={urunName}
                      onChangeText={setUrunName}
                      placeholder="Örn: Karışık Izgara"
                      placeholderTextColor="#9ca3af"
                    />

                    {/* Kategori */}
                    <Text style={styles.formLabel}>Kategori</Text>
                    <TouchableOpacity
                      style={styles.formSelect}
                      onPress={() => setShowCategoryPicker(true)}
                    >
                      <Text
                        style={[
                          styles.formSelectText,
                          !urunCategory && { color: "#9ca3af" },
                        ]}
                      >
                        {urunCategory || "Kategori seçin"}
                      </Text>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>

                    {/* Fiyat */}
                    <Text style={styles.formLabel}>KDV Dahil Satış Fiyatı</Text>
                    <View style={styles.formPriceBox}>
                      <Text style={styles.formCurrency}>₺</Text>
                      <TextInput
                        style={styles.formPriceInput}
                        value={urunPrice}
                        onChangeText={setUrunPrice}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                      />
                    </View>

                    {/* Birim */}
                    <Text style={styles.formLabel}>Birim</Text>
                    <TouchableOpacity
                      style={styles.formSelect}
                      onPress={() => setShowUnitPicker(true)}
                    >
                      <Text style={styles.formSelectText}>{urunUnit}</Text>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>

                    {/* Butonlar */}
                    <View style={styles.formBtnRow}>
                      <TouchableOpacity
                        style={styles.formCancelBtn}
                        onPress={() => {
                          setShowUrunModal(false);
                          resetUrunForm();
                        }}
                      >
                        <Text style={styles.formCancelBtnText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.formSaveBtn,
                          urunLoading && { opacity: 0.6 },
                        ]}
                        onPress={handleUrunKaydet}
                        disabled={urunLoading}
                      >
                        <Text style={styles.formSaveBtnText}>
                          {urunLoading ? "Ekleniyor..." : "Ekle"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Kategori Picker Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerHeaderTitle}>Kategori Seçin</Text>
              <TouchableOpacity onPress={() => setShowKategoriEkleModal(true)}>
                <Plus size={24} color="#8b5cf6" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {tumKategoriler.map((kat) => (
                <TouchableOpacity
                  key={kat}
                  style={[
                    styles.pickerItem,
                    urunCategory === kat && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setUrunCategory(kat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{kat}</Text>
                  {urunCategory === kat && <Check size={20} color="#8b5cf6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Özel Kategoriler (Silinebilir) */}
            {urunKategorileri.length > 0 && (
              <>
                <View style={styles.pickerDivider} />
                <Text style={styles.pickerSectionTitle}>Özel Kategoriler</Text>
                {urunKategorileri.map((kat) => (
                  <View key={kat.id} style={styles.customKatRow}>
                    <Text style={styles.customKatText}>{kat.name}</Text>
                    <TouchableOpacity onPress={() => handleKategoriSil(kat)}>
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Birim Picker Modal */}
      <Modal visible={showUnitPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUnitPicker(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Birim Seçin</Text>
            <ScrollView style={styles.pickerList}>
              {BIRIMLER.map((birim) => (
                <TouchableOpacity
                  key={birim}
                  style={[
                    styles.pickerItem,
                    urunUnit === birim && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setUrunUnit(birim);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{birim}</Text>
                  {urunUnit === birim && <Check size={20} color="#8b5cf6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Kategori Ekle Modal */}
      <Modal visible={showKategoriEkleModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.smallModal}>
                <Text style={styles.smallModalTitle}>Yeni Kategori</Text>
                <TextInput
                  style={styles.formInput}
                  value={yeniKategori}
                  onChangeText={setYeniKategori}
                  placeholder="Kategori adı"
                  placeholderTextColor="#9ca3af"
                  autoFocus
                />
                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={styles.formCancelBtn}
                    onPress={() => {
                      setShowKategoriEkleModal(false);
                      setYeniKategori("");
                    }}
                  >
                    <Text style={styles.formCancelBtnText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.formSaveBtn}
                    onPress={handleKategoriEkle}
                  >
                    <Text style={styles.formSaveBtnText}>Ekle</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <Modal visible={showDatePicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModal}>
              <Text style={styles.pickerTitle}>Satış Tarihi</Text>
              <DateTimePicker
                value={satisDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  if (Platform.OS === "android") {
                    setShowDatePicker(false);
                  }
                  if (date) setSatisDate(date);
                }}
                locale="tr-TR"
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.datePickerDoneBtn}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerDoneBtnText}>Tamam</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8b5cf6",
  },
  filterBadgeRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  filterBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  kategoriBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  kategoriBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
    flex: 1,
  },
  kategoriBannerCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8b5cf6",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankBadge: {
    backgroundColor: "#fef3c7",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    marginTop: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d97706",
  },
  urunCardContainer: {
    marginBottom: 8,
  },
  urunCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  urunCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  urunLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  urunIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  urunIconExpanded: {
    backgroundColor: "#8b5cf6",
  },
  urunInfo: {
    marginLeft: 12,
    flex: 1,
  },
  urunName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  urunCategory: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  urunStats: {
    marginTop: 4,
  },
  urunStatText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  urunRight: {
    alignItems: "flex-end",
  },
  urunPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  urunUnit: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  expandedContent: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 14,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  dateBtnText: {
    fontSize: 14,
    color: "#111827",
  },
  inputRowDouble: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputField: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  priceInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9ca3af",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  detailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  detailBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  addProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  addProductBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
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
    maxHeight: "70%",
    padding: 16,
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  filterOptionActive: {
    backgroundColor: "#ede9fe",
  },
  filterOptionText: {
    fontSize: 15,
    color: "#374151",
  },
  filterOptionTextActive: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  filterDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  kategoriList: {
    maxHeight: 200,
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
  urunModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
  },
  urunModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formSelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formSelectText: {
    fontSize: 15,
    color: "#111827",
  },
  formPriceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  formCurrency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    marginRight: 4,
  },
  formPriceInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 12,
  },
  formBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  formCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  formCancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  formSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
  },
  formSaveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "60%",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerList: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerItemSelected: {
    backgroundColor: "#ede9fe",
  },
  pickerItemText: {
    fontSize: 15,
    color: "#111827",
  },
  pickerDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  pickerSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  customKatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  customKatText: {
    fontSize: 14,
    color: "#374151",
  },
  smallModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 20,
  },
  smallModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  datePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 16,
  },
  datePickerDoneBtn: {
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  datePickerDoneBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
