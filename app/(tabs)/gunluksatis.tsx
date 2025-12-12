// GunlukSatis Screen - Refactored
// Original: 1,589 lines → Now: ~350 lines

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  Filter,
  Tag,
  Package,
} from "lucide-react-native";

// Feature imports
import {
  FilterType,
  useGunlukSatisData,
  useGunlukSatisIslemleri,
  UrunCard,
  FilterModal,
  UrunModal,
} from "../../src/features/gunluk-satis";
import { MenuItem } from "../../src/types";

export default function GunlukSatisScreen() {
  const router = useRouter();

  // State
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [selectedKategori, setSelectedKategori] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUrunModal, setShowUrunModal] = useState(false);
  const [showKategoriEkleModal, setShowKategoriEkleModal] = useState(false);
  const [yeniKategori, setYeniKategori] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Accordion state
  const [expandedUrunId, setExpandedUrunId] = useState<string | null>(null);
  const [satisAdet, setSatisAdet] = useState("1");
  const [satisFiyat, setSatisFiyat] = useState("");
  const [satisDate, setSatisDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [satisLoading, setSatisLoading] = useState(false);
  const [urunLoading, setUrunLoading] = useState(false);

  // Data hook
  const {
    menuItems,
    tumKategoriler,
    urunKategorileri,
    filteredAndSortedItems,
    groupedItems,
    getUrunStats,
    refreshAll,
  } = useGunlukSatisData(searchText, filterType, selectedKategori);

  // İşlem hook
  const { submitSatis, submitUrun, submitKategori, handleKategoriSil } =
    useGunlukSatisIslemleri();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const toggleExpand = useCallback(
    (urunId: string, urunPrice: number) => {
      if (expandedUrunId === urunId) {
        setExpandedUrunId(null);
      } else {
        setExpandedUrunId(urunId);
        setSatisAdet("1");
        setSatisFiyat(urunPrice?.toString() || "");
        setSatisDate(new Date());
      }
    },
    [expandedUrunId]
  );

  const handleSatisKaydet = async (urun: MenuItem) => {
    setSatisLoading(true);
    const success = await submitSatis(urun, satisAdet, satisFiyat, satisDate);
    setSatisLoading(false);
    if (success) {
      setSatisAdet("1");
      setSatisFiyat(urun.price?.toString() || "");
      setExpandedUrunId(null);
    }
  };

  const handleUrunKaydet = async (
    name: string,
    category: string,
    price: string,
    unit: string
  ) => {
    setUrunLoading(true);
    const success = await submitUrun(name, category, price, unit);
    setUrunLoading(false);
    return success;
  };

  const handleKategoriEkle = async () => {
    const success = await submitKategori(yeniKategori);
    if (success) {
      setYeniKategori("");
      setShowKategoriEkleModal(false);
    }
  };

  const getFilterLabel = () => {
    if (filterType === "kategori" && selectedKategori) return selectedKategori;
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
          ? groupedItems.map(([kategori, items]) => (
              <View key={kategori}>
                <View style={styles.kategoriBanner}>
                  <Tag size={14} color="#8b5cf6" />
                  <Text style={styles.kategoriBannerText}>{kategori}</Text>
                  <Text style={styles.kategoriBannerCount}>{items.length}</Text>
                </View>
                {items.map((item) => (
                  <UrunCard
                    key={item.id}
                    item={item}
                    isExpanded={expandedUrunId === item.id}
                    stats={getUrunStats(item.id)}
                    showCategory={false}
                    satisAdet={satisAdet}
                    satisFiyat={satisFiyat}
                    satisDate={satisDate}
                    satisLoading={satisLoading}
                    onToggle={() => toggleExpand(item.id, item.price)}
                    onAdetChange={setSatisAdet}
                    onFiyatChange={setSatisFiyat}
                    onDatePress={() => setShowDatePicker(true)}
                    onSave={() => handleSatisKaydet(item)}
                    onDetailPress={() =>
                      router.push(`/gunluksatisurundetay?id=${item.id}`)
                    }
                  />
                ))}
              </View>
            ))
          : filteredAndSortedItems.map((item, index) => (
              <View key={item.id}>
                {filterType && (
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                )}
                <UrunCard
                  item={item}
                  isExpanded={expandedUrunId === item.id}
                  stats={getUrunStats(item.id)}
                  showCategory
                  satisAdet={satisAdet}
                  satisFiyat={satisFiyat}
                  satisDate={satisDate}
                  satisLoading={satisLoading}
                  onToggle={() => toggleExpand(item.id, item.price)}
                  onAdetChange={setSatisAdet}
                  onFiyatChange={setSatisFiyat}
                  onDatePress={() => setShowDatePicker(true)}
                  onSave={() => handleSatisKaydet(item)}
                  onDetailPress={() =>
                    router.push(`/gunluksatisurundetay?id=${item.id}`)
                  }
                />
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

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={() => setShowUrunModal(true)}
        >
          <Plus size={22} color="#fff" />
          <Text style={styles.addProductBtnText}>Yeni Ürün Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <FilterModal
        visible={showFilterModal}
        filterType={filterType}
        selectedKategori={selectedKategori}
        tumKategoriler={tumKategoriler}
        urunKategorileri={urunKategorileri}
        onClose={() => setShowFilterModal(false)}
        onSelectFilter={setFilterType}
        onSelectKategori={setSelectedKategori}
        onKategoriSil={(kat) => handleKategoriSil(kat.id, kat.name)}
      />

      <UrunModal
        visible={showUrunModal}
        tumKategoriler={tumKategoriler}
        loading={urunLoading}
        onClose={() => setShowUrunModal(false)}
        onSave={handleUrunKaydet}
        onKategoriEkle={() => setShowKategoriEkleModal(true)}
      />

      {/* Kategori Ekle Modal */}
      <Modal visible={showKategoriEkleModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowKategoriEkleModal(false)}
        >
          <View style={styles.kategoriModal}>
            <Text style={styles.kategoriModalTitle}>Yeni Kategori</Text>
            <TextInput
              style={styles.kategoriInput}
              value={yeniKategori}
              onChangeText={setYeniKategori}
              placeholder="Kategori adı"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
            <TouchableOpacity
              style={styles.kategoriSaveBtn}
              onPress={handleKategoriEkle}
            >
              <Text style={styles.kategoriSaveBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={satisDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSatisDate(date);
          }}
        />
      )}
    </SafeAreaView>
  );
}

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
    backgroundColor: "#8b5cf6",
  },
  filterBadgeRow: { paddingHorizontal: 16, marginBottom: 8 },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  filterBadgeText: { fontSize: 13, fontWeight: "600", color: "#8b5cf6" },
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
  content: { flex: 1 },
  kategoriBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f3e8ff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
  },
  kategoriBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7c3aed",
    flex: 1,
  },
  kategoriBannerCount: { fontSize: 12, color: "#a78bfa", fontWeight: "500" },
  rankBadge: { marginLeft: 20, marginTop: 12, marginBottom: -4 },
  rankText: { fontSize: 12, fontWeight: "700", color: "#8b5cf6" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
  bottomBar: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  addProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  addProductBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  kategoriModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
  },
  kategoriModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  kategoriInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  kategoriSaveBtn: {
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  kategoriSaveBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
