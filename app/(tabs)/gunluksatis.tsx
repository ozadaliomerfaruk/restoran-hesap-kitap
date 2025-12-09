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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  Edit3,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Package,
  Calendar,
  Info,
  Hash,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { MenuItem, SatisKaydi } from "../../src/types";

type TabType = "satislar" | "analiz";
type FilterPeriod = "bugun" | "hafta" | "ay" | "yil" | "tum";

const kategoriler = [
  "Ana Yemek",
  "Çorba",
  "Salata",
  "Tatlı",
  "İçecek",
  "Kahvaltı",
  "Aperatif",
  "Diğer",
];

export default function GunlukSatisScreen() {
  const {
    profile,
    fetchProfile,
    menuItems,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    satisKayitlari,
    fetchSatisKayitlari,
    addSatisKaydi,
    deleteSatisKaydi,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("satislar");
  const [searchText, setSearchText] = useState("");
  const [expandedUrunId, setExpandedUrunId] = useState<string | null>(null);

  // Satış Girişi State (accordion içinde)
  const [satisAdet, setSatisAdet] = useState("1");
  const [satisFiyat, setSatisFiyat] = useState("");
  const [satisDate, setSatisDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [satisLoading, setSatisLoading] = useState(false);

  // Ürün Ekleme Modal State
  const [showUrunModal, setShowUrunModal] = useState(false);
  const [editingUrun, setEditingUrun] = useState<MenuItem | null>(null);
  const [urunName, setUrunName] = useState("");
  const [urunCategory, setUrunCategory] = useState("Ana Yemek");
  const [urunPrice, setUrunPrice] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [urunLoading, setUrunLoading] = useState(false);

  // Analiz Filtreleri
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("ay");

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchMenuItems();
      fetchSatisKayitlari();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMenuItems(), fetchSatisKayitlari()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Ürüne ait satış istatistikleri
  const getUrunStats = (urunId: string) => {
    const urunSatislar = satisKayitlari.filter(
      (s) => s.menu_item_id === urunId
    );
    const toplamAdet = urunSatislar.reduce((sum, s) => sum + s.quantity, 0);
    const toplamCiro = urunSatislar.reduce((sum, s) => sum + s.total_price, 0);
    return { toplamAdet, toplamCiro, satislar: urunSatislar };
  };

  // Accordion aç/kapa
  const toggleExpand = (urunId: string, urunPrice: number) => {
    if (expandedUrunId === urunId) {
      setExpandedUrunId(null);
    } else {
      setExpandedUrunId(urunId);
      setSatisAdet("1");
      setSatisFiyat(urunPrice?.toString() || "");
      setSatisDate(new Date().toISOString().split("T")[0]);
    }
  };

  // Satış Kaydet
  const handleSatisKaydet = async (urun: MenuItem) => {
    if (!satisAdet || parseInt(satisAdet) <= 0) {
      Alert.alert("Hata", "Geçerli adet girin");
      return;
    }
    if (!satisFiyat || parseFloat(satisFiyat) <= 0) {
      Alert.alert("Hata", "Geçerli fiyat girin");
      return;
    }

    setSatisLoading(true);
    const { error } = await addSatisKaydi({
      restaurant_id: profile?.restaurant_id || "",
      menu_item_id: urun.id,
      date: satisDate,
      quantity: parseInt(satisAdet),
      unit_price: parseFloat(satisFiyat),
    });
    setSatisLoading(false);

    if (error) {
      Alert.alert("Hata", "Satış kaydedilirken bir hata oluştu");
    } else {
      setSatisAdet("1");
      setSatisFiyat(urun.price?.toString() || "");
      Alert.alert("Başarılı", `${urun.name} satışı kaydedildi`);
    }
  };

  // Satış Sil
  const handleDeleteSatis = (satis: SatisKaydi) => {
    Alert.alert(
      "Satış Sil",
      "Bu satış kaydını silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            await deleteSatisKaydi(satis.id);
          },
        },
      ]
    );
  };

  // Ürün Kaydet
  const handleUrunKaydet = async () => {
    if (!urunName.trim()) {
      Alert.alert("Hata", "Ürün adı girin");
      return;
    }

    setUrunLoading(true);

    if (editingUrun) {
      const { error } = await updateMenuItem(editingUrun.id, {
        name: urunName.trim(),
        category: urunCategory,
        price: urunPrice ? parseFloat(urunPrice) : 0,
      });
      if (error) {
        Alert.alert("Hata", "Ürün güncellenirken bir hata oluştu");
      } else {
        setShowUrunModal(false);
        resetUrunForm();
      }
    } else {
      const { error } = await addMenuItem({
        restaurant_id: profile?.restaurant_id || "",
        name: urunName.trim(),
        category: urunCategory,
        price: urunPrice ? parseFloat(urunPrice) : 0,
        is_active: true,
      });
      if (error) {
        Alert.alert("Hata", "Ürün eklenirken bir hata oluştu");
      } else {
        setShowUrunModal(false);
        resetUrunForm();
      }
    }
    setUrunLoading(false);
  };

  const resetUrunForm = () => {
    setEditingUrun(null);
    setUrunName("");
    setUrunCategory("Ana Yemek");
    setUrunPrice("");
  };

  const openEditUrun = (urun: MenuItem) => {
    setEditingUrun(urun);
    setUrunName(urun.name);
    setUrunCategory(urun.category || "Ana Yemek");
    setUrunPrice(urun.price?.toString() || "");
    setShowUrunModal(true);
  };

  const handleDeleteUrun = (urun: MenuItem) => {
    Alert.alert(
      "Ürün Sil",
      `"${urun.name}" ürününü silmek istediğinize emin misiniz?\n\nBu ürüne ait satış kayıtları da silinecek.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteMenuItem(urun.id);
            if (error) {
              Alert.alert("Hata", "Ürün silinemedi");
            }
          },
        },
      ]
    );
  };

  // Filtrelenmiş ürünler
  const filteredMenuItems = useMemo(() => {
    if (!searchText) return menuItems;
    const search = searchText.toLowerCase();
    return menuItems.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.category?.toLowerCase().includes(search)
    );
  }, [menuItems, searchText]);

  // Analiz verileri
  const analizData = useMemo(() => {
    const now = new Date();
    let filtered = [...satisKayitlari];

    if (filterPeriod !== "tum") {
      const startDate = new Date();
      switch (filterPeriod) {
        case "bugun":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "hafta":
          startDate.setDate(now.getDate() - 7);
          break;
        case "ay":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "yil":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      filtered = filtered.filter((s) => new Date(s.date) >= startDate);
    }

    const urunSatislari: Record<
      string,
      { urun: MenuItem; adet: number; ciro: number }
    > = {};

    filtered.forEach((satis) => {
      if (satis.menu_item) {
        const id = satis.menu_item_id;
        if (!urunSatislari[id]) {
          urunSatislari[id] = { urun: satis.menu_item, adet: 0, ciro: 0 };
        }
        urunSatislari[id].adet += satis.quantity;
        urunSatislari[id].ciro += satis.total_price;
      }
    });

    const liste = Object.values(urunSatislari);
    const enCokSatan = [...liste].sort((a, b) => b.adet - a.adet).slice(0, 10);
    const enCokCiro = [...liste].sort((a, b) => b.ciro - a.ciro).slice(0, 10);
    const toplamAdet = liste.reduce((sum, item) => sum + item.adet, 0);
    const toplamCiro = liste.reduce((sum, item) => sum + item.ciro, 0);

    return { enCokSatan, enCokCiro, toplamAdet, toplamCiro };
  }, [satisKayitlari, filterPeriod]);

  // Render Ürün Kartı (Accordion)
  const renderUrunCard = ({ item }: { item: MenuItem }) => {
    const isExpanded = expandedUrunId === item.id;
    const stats = getUrunStats(item.id);

    return (
      <View style={styles.urunCardContainer}>
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
              <Text style={styles.urunCategory}>{item.category}</Text>
              <View style={styles.urunStats}>
                <Text style={styles.urunStatText}>
                  {stats.toplamAdet} satış • {formatCurrency(stats.toplamCiro)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.urunRight}>
            <Text style={styles.urunPrice}>{formatCurrency(item.price)}</Text>
            {isExpanded ? (
              <ChevronUp size={20} color="#8b5cf6" />
            ) : (
              <ChevronDown size={20} color="#9ca3af" />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.satisForm}>
              <Text style={styles.formTitle}>Satış Ekle</Text>

              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Tarih</Text>
                  <View style={styles.inputWithIcon}>
                    <Calendar size={16} color="#6b7280" />
                    <TextInput
                      style={styles.formInput}
                      value={satisDate}
                      onChangeText={setSatisDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Adet</Text>
                  <View style={styles.inputWithIcon}>
                    <Hash size={16} color="#6b7280" />
                    <TextInput
                      style={styles.formInput}
                      value={satisAdet}
                      onChangeText={setSatisAdet}
                      placeholder="1"
                      placeholderTextColor="#9ca3af"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Fiyat</Text>
                  <View style={styles.inputWithIcon}>
                    <Text style={styles.currencySmall}>₺</Text>
                    <TextInput
                      style={styles.formInput}
                      value={satisFiyat}
                      onChangeText={setSatisFiyat}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formFooter}>
                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Toplam:</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(
                      (parseInt(satisAdet) || 0) * (parseFloat(satisFiyat) || 0)
                    )}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    satisLoading && styles.saveBtnDisabled,
                  ]}
                  onPress={() => handleSatisKaydet(item)}
                  disabled={satisLoading}
                >
                  <Check size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>
                    {satisLoading ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {stats.satislar.length > 0 && (
              <View style={styles.sonSatislar}>
                <Text style={styles.sonSatislarTitle}>Son Satışlar</Text>
                {stats.satislar.slice(0, 5).map((satis) => (
                  <View key={satis.id} style={styles.satisRow}>
                    <Text style={styles.satisDate}>
                      {new Date(satis.date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                    <Text style={styles.satisAdet}>{satis.quantity} adet</Text>
                    <Text style={styles.satisTutar}>
                      {formatCurrency(satis.total_price)}
                    </Text>
                    <TouchableOpacity
                      style={styles.satisDeleteBtn}
                      onPress={() => handleDeleteSatis(satis)}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.urunActions}>
              <TouchableOpacity
                style={styles.urunActionBtn}
                onPress={() => openEditUrun(item)}
              >
                <Edit3 size={16} color="#3b82f6" />
                <Text style={styles.urunActionText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.urunActionBtn, styles.urunActionBtnDanger]}
                onPress={() => handleDeleteUrun(item)}
              >
                <Trash2 size={16} color="#ef4444" />
                <Text
                  style={[styles.urunActionText, styles.urunActionTextDanger]}
                >
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Satış Takip</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetUrunForm();
            setShowUrunModal(true);
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoBar}>
        <Info size={14} color="#6b7280" />
        <Text style={styles.infoText}>
          Bu sayfa genel durumu etkilemez, sadece ürün satışlarını takip eder
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "satislar" && styles.tabActive]}
          onPress={() => setActiveTab("satislar")}
        >
          <ShoppingBag
            size={18}
            color={activeTab === "satislar" ? "#8b5cf6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "satislar" && styles.tabTextActive,
            ]}
          >
            Satış Gir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "analiz" && styles.tabActive]}
          onPress={() => setActiveTab("analiz")}
        >
          <BarChart3
            size={18}
            color={activeTab === "analiz" ? "#8b5cf6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "analiz" && styles.tabTextActive,
            ]}
          >
            Analiz
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "satislar" && (
        <View style={styles.searchContainer}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Ürün ara..."
            placeholderTextColor="#9ca3af"
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={16} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {activeTab === "satislar" && (
        <FlatList
          data={filteredMenuItems}
          keyExtractor={(item) => item.id}
          renderItem={renderUrunCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Package size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz ürün eklenmemiş</Text>
              <Text style={styles.emptySubtext}>
                Satış takibi yapmak için önce ürün ekleyin
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => {
                  resetUrunForm();
                  setShowUrunModal(true);
                }}
              >
                <Plus size={18} color="#fff" />
                <Text style={styles.emptyButtonText}>Ürün Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {activeTab === "analiz" && (
        <ScrollView
          style={styles.analizContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodFilters}
          >
            {(
              [
                { key: "bugun", label: "Bugün" },
                { key: "hafta", label: "Hafta" },
                { key: "ay", label: "Ay" },
                { key: "yil", label: "Yıl" },
                { key: "tum", label: "Tümü" },
              ] as { key: FilterPeriod; label: string }[]
            ).map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodBtn,
                  filterPeriod === period.key && styles.periodBtnActive,
                ]}
                onPress={() => setFilterPeriod(period.key)}
              >
                <Text
                  style={[
                    styles.periodBtnText,
                    filterPeriod === period.key && styles.periodBtnTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#ede9fe" }]}>
              <ShoppingBag size={24} color="#8b5cf6" />
              <Text style={styles.summaryValue}>{analizData.toplamAdet}</Text>
              <Text style={styles.summaryLabel}>Toplam Satış</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#dcfce7" }]}>
              <TrendingUp size={24} color="#10b981" />
              <Text style={styles.summaryValue}>
                {formatCurrency(analizData.toplamCiro)}
              </Text>
              <Text style={styles.summaryLabel}>Toplam Ciro</Text>
            </View>
          </View>

          <View style={styles.analizSection}>
            <Text style={styles.analizTitle}>En Çok Satan Ürünler</Text>
            {analizData.enCokSatan.length > 0 ? (
              analizData.enCokSatan.map((item, index) => (
                <View key={item.urun.id} style={styles.analizCard}>
                  <View
                    style={[
                      styles.analizRank,
                      { backgroundColor: index < 3 ? "#fef3c7" : "#f3f4f6" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.analizRankText,
                        { color: index < 3 ? "#f59e0b" : "#6b7280" },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.analizInfo}>
                    <Text style={styles.analizName}>{item.urun.name}</Text>
                    <Text style={styles.analizDetay}>{item.urun.category}</Text>
                  </View>
                  <View style={styles.analizValues}>
                    <Text style={styles.analizAdet}>{item.adet} adet</Text>
                    <Text style={styles.analizCiro}>
                      {formatCurrency(item.ciro)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Henüz satış verisi yok</Text>
            )}
          </View>

          <View style={styles.analizSection}>
            <Text style={styles.analizTitle}>En Çok Ciro Yapan Ürünler</Text>
            {analizData.enCokCiro.length > 0 ? (
              analizData.enCokCiro.map((item, index) => (
                <View key={item.urun.id + "-ciro"} style={styles.analizCard}>
                  <View
                    style={[
                      styles.analizRank,
                      { backgroundColor: index < 3 ? "#dcfce7" : "#f3f4f6" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.analizRankText,
                        { color: index < 3 ? "#10b981" : "#6b7280" },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.analizInfo}>
                    <Text style={styles.analizName}>{item.urun.name}</Text>
                    <Text style={styles.analizDetay}>{item.urun.category}</Text>
                  </View>
                  <View style={styles.analizValues}>
                    <Text style={styles.analizCiro}>
                      {formatCurrency(item.ciro)}
                    </Text>
                    <Text style={styles.analizAdet}>{item.adet} adet</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Henüz satış verisi yok</Text>
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <Modal
        visible={showUrunModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUrunModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingUrun ? "Ürün Düzenle" : "Yeni Ürün"}
            </Text>
            <TouchableOpacity onPress={handleUrunKaydet} disabled={urunLoading}>
              <Check size={24} color={urunLoading ? "#9ca3af" : "#10b981"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Ürün Adı *</Text>
            <TextInput
              style={styles.modalInput}
              value={urunName}
              onChangeText={setUrunName}
              placeholder="Örn: Köfte, Pizza, Ayran"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.modalLabel}>Kategori</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.dropdownText}>{urunCategory}</Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>

            {showCategoryPicker && (
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {kategoriler.map((kat) => (
                  <TouchableOpacity
                    key={kat}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setUrunCategory(kat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{kat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.modalLabel}>Varsayılan Satış Fiyatı</Text>
            <View style={styles.priceInput}>
              <Text style={styles.currencySymbol}>₺</Text>
              <TextInput
                style={styles.priceTextInput}
                value={urunPrice}
                onChangeText={setUrunPrice}
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.helperText}>
              Satış girişinde bu fiyat otomatik gelir
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    backgroundColor: "#8b5cf6",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  infoText: { flex: 1, fontSize: 19, color: "#6b7280" },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#ede9fe" },
  tabText: { fontSize: 19, fontWeight: "500", color: "#6b7280" },
  tabTextActive: { color: "#8b5cf6" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 19, color: "#111827" },
  listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  urunCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  urunCard: { flexDirection: "row", alignItems: "center", padding: 14 },
  urunCardExpanded: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  urunLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  urunIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  urunIconExpanded: { backgroundColor: "#8b5cf6" },
  urunInfo: { flex: 1 },
  urunName: { fontSize: 19, fontWeight: "600", color: "#111827" },
  urunCategory: { fontSize: 19, color: "#6b7280", marginTop: 2 },
  urunStats: { marginTop: 4 },
  urunStatText: { fontSize: 19, color: "#9ca3af" },
  urunRight: { alignItems: "flex-end", gap: 4 },
  urunPrice: { fontSize: 19, fontWeight: "600", color: "#10b981" },
  expandedContent: { padding: 14, backgroundColor: "#fafafa" },
  satisForm: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  formRow: { flexDirection: "row", gap: 10 },
  formField: { flex: 1 },
  formLabel: {
    fontSize: 19,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  formInput: { flex: 1, fontSize: 19, color: "#111827", paddingVertical: 10 },
  currencySmall: { fontSize: 19, fontWeight: "600", color: "#6b7280" },
  formFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  totalBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  totalLabel: { fontSize: 19, color: "#6b7280" },
  totalValue: { fontSize: 20, fontWeight: "700", color: "#8b5cf6" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 19, fontWeight: "600", color: "#fff" },
  sonSatislar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sonSatislarTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  satisRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  satisDate: { flex: 1, fontSize: 19, color: "#6b7280" },
  satisAdet: { fontSize: 19, color: "#111827", marginRight: 12 },
  satisTutar: {
    fontSize: 19,
    fontWeight: "600",
    color: "#10b981",
    marginRight: 8,
  },
  satisDeleteBtn: { padding: 4 },
  urunActions: { flexDirection: "row", gap: 10 },
  urunActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  urunActionBtnDanger: { backgroundColor: "#fef2f2" },
  urunActionText: { fontSize: 19, fontWeight: "500", color: "#3b82f6" },
  urunActionTextDanger: { color: "#ef4444" },
  analizContent: { flex: 1, paddingHorizontal: 16 },
  periodFilters: { flexDirection: "row", marginBottom: 16 },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 8,
  },
  periodBtnActive: { backgroundColor: "#8b5cf6" },
  periodBtnText: { fontSize: 19, fontWeight: "500", color: "#6b7280" },
  periodBtnTextActive: { color: "#fff" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  summaryValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  summaryLabel: { fontSize: 19, color: "#6b7280" },
  analizSection: { marginBottom: 24 },
  analizTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  analizCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  analizRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  analizRankText: { fontSize: 19, fontWeight: "700" },
  analizInfo: { flex: 1 },
  analizName: { fontSize: 19, fontWeight: "600", color: "#111827" },
  analizDetay: { fontSize: 19, color: "#9ca3af" },
  analizValues: { alignItems: "flex-end" },
  analizAdet: { fontSize: 19, color: "#6b7280" },
  analizCiro: { fontSize: 19, fontWeight: "600", color: "#10b981" },
  noDataText: {
    fontSize: 19,
    color: "#9ca3af",
    textAlign: "center",
    padding: 20,
  },
  emptyState: { padding: 40, alignItems: "center" },
  emptyText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 20,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: { fontSize: 19, fontWeight: "600", color: "#fff" },
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
  modalTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
  modalContent: { flex: 1, padding: 16 },
  modalLabel: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
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
  dropdownText: { fontSize: 19, color: "#111827" },
  dropdownList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownItemText: { fontSize: 19, color: "#111827" },
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
  helperText: { fontSize: 19, color: "#9ca3af", marginTop: 8 },
});
