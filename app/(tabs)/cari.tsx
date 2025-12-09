import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  FileText,
  ChevronRight,
  X,
  Check,
  Search,
  PlusCircle,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { supabase } from "../../src/lib/supabase";
import AddCariModal from "../../src/components/AddCariModal";
import CariDetayModal from "../../src/components/CariDetayModal";
import KalemliFaturaModal from "../../src/components/Kalemlifaturamodal";
import DatePickerField from "../../src/components/DatePickerField";
import { Cari, CariType } from "../../src/types";

// Android için LayoutAnimation'ı etkinleştir
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IslemTipi = "alis" | "iade" | "odeme" | "tahsilat";

const islemTipleri = [
  {
    key: "alis" as IslemTipi,
    label: "ALIŞ",
    icon: ShoppingCart,
    color: "#ef4444",
    bgColor: "#fef2f2",
  },
  {
    key: "iade" as IslemTipi,
    label: "İADE",
    icon: RotateCcw,
    color: "#f59e0b",
    bgColor: "#fffbeb",
  },
  {
    key: "odeme" as IslemTipi,
    label: "ÖDEME",
    icon: ArrowUpRight,
    color: "#3b82f6",
    bgColor: "#eff6ff",
  },
  {
    key: "tahsilat" as IslemTipi,
    label: "TAHSİLAT",
    icon: ArrowDownLeft,
    color: "#10b981",
    bgColor: "#ecfdf5",
  },
];

export default function CariScreen() {
  const {
    cariler,
    fetchCariler,
    fetchProfile,
    profile,
    kasalar,
    fetchKasalar,
    addIslem,
    kategoriler,
    fetchKategoriler,
    addKategori,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetayModal, setShowDetayModal] = useState(false);
  const [showKalemliModal, setShowKalemliModal] = useState(false);
  const [selectedCari, setSelectedCari] = useState<Cari | null>(null);
  const [filter, setFilter] = useState<"all" | CariType>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Accordion state
  const [expandedCariId, setExpandedCariId] = useState<string | null>(null);
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );

  // Form state
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formKasaId, setFormKasaId] = useState("");
  const [formKategoriId, setFormKategoriId] = useState("");
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [kategoriSearch, setKategoriSearch] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Yeni kategori ekleme
  const [showAddKategori, setShowAddKategori] = useState(false);
  const [newKategoriName, setNewKategoriName] = useState("");
  const [newKategoriParentId, setNewKategoriParentId] = useState<string | null>(
    null
  );
  const [addingKategori, setAddingKategori] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchCariler();
      fetchKasalar();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCariler(), fetchKasalar()]);
    setRefreshing(false);
  };

  // Yeni kategori ekleme fonksiyonu
  const handleAddKategori = async () => {
    if (!newKategoriName.trim()) {
      Alert.alert("Hata", "Kategori adı boş olamaz");
      return;
    }

    setAddingKategori(true);
    try {
      const { data, error } = await supabase
        .from("kategoriler")
        .insert({
          restaurant_id: profile?.restaurant_id,
          name: newKategoriName.trim(),
          type: "gider", // Alış için gider kategorisi
          parent_id: newKategoriParentId || null,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Kategoriyi seç ve listeyi güncelle
      await fetchKategoriler();
      setFormKategoriId(data.id);
      setNewKategoriName("");
      setNewKategoriParentId(null);
      setShowAddKategori(false);
      Alert.alert("Başarılı", "Kategori eklendi");
    } catch (error: any) {
      console.error("Kategori ekleme hatası:", error);
      Alert.alert("Hata", error.message || "Kategori eklenemedi");
    } finally {
      setAddingKategori(false);
    }
  };

  const filteredCariler = cariler
    .filter((cari) => {
      if (filter === "all") return true;
      return cari.type === filter;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceText = (cari: Cari) => {
    const balance = cari.balance || 0;
    if (cari.type === "tedarikci") {
      if (balance > 0)
        return {
          text: `Borcumuz: ${formatCurrency(balance)}`,
          color: "#ef4444",
        };
      if (balance < 0)
        return {
          text: `Alacağımız: ${formatCurrency(Math.abs(balance))}`,
          color: "#10b981",
        };
    } else {
      if (balance > 0)
        return {
          text: `Alacağımız: ${formatCurrency(balance)}`,
          color: "#10b981",
        };
      if (balance < 0)
        return {
          text: `Borcumuz: ${formatCurrency(Math.abs(balance))}`,
          color: "#ef4444",
        };
    }
    return { text: "Borç yok", color: "#6b7280" };
  };

  const handleCariPress = (cari: Cari) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedCariId === cari.id) {
      setExpandedCariId(null);
      setActiveIslemTipi(null);
    } else {
      setExpandedCariId(cari.id);
      setActiveIslemTipi(null);
      resetForm();
    }
  };

  const handleIslemTipiPress = (tip: IslemTipi) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeIslemTipi === tip) {
      setActiveIslemTipi(null);
    } else {
      setActiveIslemTipi(tip);
      resetForm();
      // Varsayılan kasa seç
      const nakitKasa = kasalar.find((k) => k.type === "nakit");
      if (nakitKasa) setFormKasaId(nakitKasa.id);
    }
  };

  const handleDetayPress = (cari: Cari) => {
    setSelectedCari(cari);
    setShowDetayModal(true);
  };

  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormAmount("");
    setFormDescription("");
    setFormKasaId("");
    setFormKategoriId("");
    setShowKategoriPicker(false);
  };

  const handleSubmit = async (cari: Cari) => {
    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }
    // Kasa sadece ödeme ve tahsilat için gerekli
    if (
      !formKasaId &&
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat")
    ) {
      Alert.alert("Hata", "Lütfen bir kasa seçin");
      return;
    }

    setFormLoading(true);

    // İşlem tipini belirle
    let islemType: "gider" | "gelir" | "odeme" | "tahsilat";
    let description = formDescription.trim();

    switch (activeIslemTipi) {
      case "alis":
        islemType = "gider";
        if (!description) description = `${cari.name} - Alış`;
        break;
      case "iade":
        islemType = "gelir";
        if (!description) description = `${cari.name} - İade`;
        break;
      case "odeme":
        islemType = "odeme";
        if (!description) description = `${cari.name} - Ödeme`;
        break;
      case "tahsilat":
        islemType = "tahsilat";
        if (!description) description = `${cari.name} - Tahsilat`;
        break;
      default:
        setFormLoading(false);
        return;
    }

    // Alış ve iade için kasa yok, sadece borç kaydı
    const kasaId =
      activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat"
        ? formKasaId
        : undefined;
    // Alış için kategori
    const kategoriId =
      activeIslemTipi === "alis" && formKategoriId ? formKategoriId : undefined;

    const { error } = await addIslem({
      type: islemType,
      amount: parseFloat(formAmount),
      description,
      date: formDate,
      kasa_id: kasaId,
      cari_id: cari.id,
      kategori_id: kategoriId,
    });

    setFormLoading(false);

    if (error) {
      Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
    } else {
      Alert.alert("Başarılı", "İşlem kaydedildi");
      resetForm();
      setActiveIslemTipi(null);
      fetchCariler();
      fetchKasalar();
    }
  };

  // Toplam borç/alacak hesapla
  const toplamTedarikciBorc = cariler
    .filter((c) => c.type === "tedarikci" && c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  const toplamMusteriAlacak = cariler
    .filter((c) => c.type === "musteri" && c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  const nakitBankaKasalar = kasalar.filter(
    (k) => k.type === "nakit" || k.type === "banka"
  );

  const renderCariCard = (cari: Cari) => {
    const isExpanded = expandedCariId === cari.id;
    const balanceInfo = getBalanceText(cari);

    return (
      <View key={cari.id} style={styles.cariContainer}>
        {/* Ana Kart */}
        <TouchableOpacity
          style={[styles.cariCard, isExpanded && styles.cariCardExpanded]}
          onPress={() => handleCariPress(cari)}
          activeOpacity={0.7}
        >
          <View style={styles.cariLeft}>
            <View
              style={[
                styles.cariIcon,
                {
                  backgroundColor:
                    cari.type === "tedarikci" ? "#dbeafe" : "#dcfce7",
                },
              ]}
            >
              {cari.type === "tedarikci" ? (
                <Building2 size={22} color="#3b82f6" />
              ) : (
                <Users size={22} color="#10b981" />
              )}
            </View>
            <View style={styles.cariInfo}>
              <Text style={styles.cariName}>{cari.name}</Text>
              <Text style={[styles.cariBalance, { color: balanceInfo.color }]}>
                {balanceInfo.text}
              </Text>
            </View>
          </View>
          <View style={styles.cariRight}>
            {isExpanded ? (
              <ChevronUp size={22} color="#6b7280" />
            ) : (
              <ChevronDown size={22} color="#6b7280" />
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* İşlem Tipleri */}
            <View style={styles.islemTipleri}>
              {islemTipleri.map((tip) => {
                const Icon = tip.icon;
                const isActive = activeIslemTipi === tip.key;
                return (
                  <TouchableOpacity
                    key={tip.key}
                    style={[
                      styles.islemTipBtn,
                      { backgroundColor: isActive ? tip.color : tip.bgColor },
                    ]}
                    onPress={() => handleIslemTipiPress(tip.key)}
                  >
                    <Icon size={18} color={isActive ? "#fff" : tip.color} />
                    <Text
                      style={[
                        styles.islemTipText,
                        { color: isActive ? "#fff" : tip.color },
                      ]}
                    >
                      {tip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Kalemli Alış Butonu - Sadece Tedarikçi için */}
            {cari.type === "tedarikci" && (
              <TouchableOpacity
                style={styles.kalemliBtn}
                onPress={() => {
                  setSelectedCari(cari);
                  setShowKalemliModal(true);
                }}
              >
                <FileText size={16} color="#8b5cf6" />
                <Text style={styles.kalemliBtnText}>Kalemli Fatura Girişi</Text>
                <ChevronRight size={16} color="#8b5cf6" />
              </TouchableOpacity>
            )}

            {/* Form */}
            {activeIslemTipi && (
              <View style={styles.formContainer}>
                {/* Tarih */}
                <DatePickerField value={formDate} onChange={setFormDate} />

                {/* Kasa Seçimi - Sadece ödeme ve tahsilat için */}
                {(activeIslemTipi === "odeme" ||
                  activeIslemTipi === "tahsilat") && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.kasaScroll}
                  >
                    {nakitBankaKasalar.map((kasa) => (
                      <TouchableOpacity
                        key={kasa.id}
                        style={[
                          styles.kasaChip,
                          formKasaId === kasa.id && styles.kasaChipActive,
                        ]}
                        onPress={() => setFormKasaId(kasa.id)}
                      >
                        <Text
                          style={[
                            styles.kasaChipText,
                            formKasaId === kasa.id && styles.kasaChipTextActive,
                          ]}
                        >
                          {kasa.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {/* Kategori Seçimi - Sadece alış için - Modal açar */}
                {activeIslemTipi === "alis" && (
                  <TouchableOpacity
                    style={styles.kategoriSelectBtn}
                    onPress={() => {
                      setKategoriSearch("");
                      setShowKategoriModal(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.kategoriSelectText,
                        !formKategoriId && styles.kategoriSelectPlaceholder,
                      ]}
                    >
                      {formKategoriId
                        ? kategoriler.find((k) => k.id === formKategoriId)
                            ?.name || "Kategori seç"
                        : "Kategori seç (opsiyonel)"}
                    </Text>
                    <ChevronRight size={18} color="#6b7280" />
                  </TouchableOpacity>
                )}

                {/* Açıklama */}
                <View style={styles.formRow}>
                  <FileText size={18} color="#6b7280" />
                  <TextInput
                    style={styles.formInput}
                    value={formDescription}
                    onChangeText={setFormDescription}
                    placeholder="Açıklama (opsiyonel)"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Tutar ve Kaydet */}
                <View style={styles.amountRow}>
                  <View style={styles.amountBox}>
                    <Text style={styles.currencySign}>₺</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={formAmount}
                      onChangeText={setFormAmount}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.saveBtn,
                      {
                        backgroundColor: islemTipleri.find(
                          (t) => t.key === activeIslemTipi
                        )?.color,
                      },
                      formLoading && styles.saveBtnDisabled,
                    ]}
                    onPress={() => handleSubmit(cari)}
                    disabled={formLoading}
                  >
                    <Text style={styles.saveBtnText}>
                      {formLoading ? "Kaydediliyor..." : "KAYDET"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Detay Butonu */}
            <TouchableOpacity
              style={styles.detayBtn}
              onPress={() => handleDetayPress(cari)}
            >
              <Text style={styles.detayBtnText}>Geçmiş İşlemleri Gör</Text>
              <ChevronRight size={18} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cariler</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Özet Kartları */}
        {(toplamTedarikciBorc > 0 || toplamMusteriAlacak > 0) && (
          <View style={styles.summaryRow}>
            {toplamTedarikciBorc > 0 && (
              <View
                style={[styles.summaryCard, { borderLeftColor: "#ef4444" }]}
              >
                <Text style={styles.summaryLabel}>Tedarikçi Borcu</Text>
                <Text style={[styles.summaryAmount, { color: "#ef4444" }]}>
                  {formatCurrency(toplamTedarikciBorc)}
                </Text>
              </View>
            )}
            {toplamMusteriAlacak > 0 && (
              <View
                style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}
              >
                <Text style={styles.summaryLabel}>Müşteri Alacağı</Text>
                <Text style={[styles.summaryAmount, { color: "#10b981" }]}>
                  {formatCurrency(toplamMusteriAlacak)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Filtre */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "all" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              Tümü ({cariler.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "tedarikci" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("tedarikci")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "tedarikci" && styles.filterTextActive,
              ]}
            >
              Tedarikçi ({cariler.filter((c) => c.type === "tedarikci").length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "musteri" && styles.filterBtnActive,
            ]}
            onPress={() => setFilter("musteri")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "musteri" && styles.filterTextActive,
              ]}
            >
              Müşteri ({cariler.filter((c) => c.type === "musteri").length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Liste */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredCariler.length > 0 ? (
            filteredCariler.map(renderCariCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Building2 size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Cari bulunamadı</Text>
              <Text style={styles.emptyText}>
                Tedarikçi ve müşterilerinizi ekleyerek{"\n"}borç takibi yapın
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Cari Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modaller */}
      <AddCariModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          fetchCariler();
        }}
      />
      <CariDetayModal
        visible={showDetayModal}
        onClose={() => {
          setShowDetayModal(false);
          setSelectedCari(null);
          fetchCariler();
        }}
        cari={selectedCari}
      />
      <KalemliFaturaModal
        visible={showKalemliModal}
        onClose={() => {
          setShowKalemliModal(false);
          setSelectedCari(null);
          fetchCariler();
        }}
        cari={selectedCari}
      />

      {/* Kategori Seçim Modal */}
      <Modal
        visible={showKategoriModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowKategoriModal(false)}
      >
        <SafeAreaView style={styles.kategoriModalContainer}>
          <View style={styles.kategoriModalHeader}>
            <Text style={styles.kategoriModalTitle}>Kategori Seç</Text>
            <TouchableOpacity
              style={styles.kategoriModalCloseBtn}
              onPress={() => setShowKategoriModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Yeni Kategori Ekleme Butonu veya Formu */}
          {!showAddKategori ? (
            <TouchableOpacity
              style={styles.addKategoriBtn}
              onPress={() => setShowAddKategori(true)}
            >
              <PlusCircle size={20} color="#3b82f6" />
              <Text style={styles.addKategoriBtnText}>Yeni Kategori Ekle</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addKategoriForm}>
              <View style={styles.addKategoriHeader}>
                <Text style={styles.addKategoriTitle}>Yeni Kategori</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddKategori(false);
                    setNewKategoriName("");
                    setNewKategoriParentId(null);
                  }}
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.addKategoriInput}
                placeholder="Kategori adı"
                placeholderTextColor="#9ca3af"
                value={newKategoriName}
                onChangeText={setNewKategoriName}
                autoFocus
              />

              {/* Ana Kategori Seçimi */}
              <Text style={styles.addKategoriLabel}>
                Üst Kategori (Opsiyonel)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.parentKategoriScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.parentKategoriChip,
                    newKategoriParentId === null &&
                      styles.parentKategoriChipActive,
                  ]}
                  onPress={() => setNewKategoriParentId(null)}
                >
                  <Text
                    style={[
                      styles.parentKategoriChipText,
                      newKategoriParentId === null &&
                        styles.parentKategoriChipTextActive,
                    ]}
                  >
                    Ana Kategori
                  </Text>
                </TouchableOpacity>
                {kategoriler
                  .filter((k) => k.type === "gider" && !k.parent_id)
                  .map((kat) => (
                    <TouchableOpacity
                      key={kat.id}
                      style={[
                        styles.parentKategoriChip,
                        newKategoriParentId === kat.id &&
                          styles.parentKategoriChipActive,
                      ]}
                      onPress={() => setNewKategoriParentId(kat.id)}
                    >
                      <Text
                        style={[
                          styles.parentKategoriChipText,
                          newKategoriParentId === kat.id &&
                            styles.parentKategoriChipTextActive,
                        ]}
                      >
                        {kat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.addKategoriSaveBtn,
                  addingKategori && styles.addKategoriSaveBtnDisabled,
                ]}
                onPress={handleAddKategori}
                disabled={addingKategori}
              >
                <Text style={styles.addKategoriSaveText}>
                  {addingKategori ? "Ekleniyor..." : "Kategori Ekle"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Arama */}
          <View style={styles.kategoriSearchContainer}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.kategoriSearchInput}
              placeholder="Kategori ara..."
              placeholderTextColor="#9ca3af"
              value={kategoriSearch}
              onChangeText={setKategoriSearch}
            />
          </View>

          {/* Kategori Listesi - Hiyerarşik */}
          <ScrollView
            style={styles.kategoriScrollView}
            contentContainerStyle={styles.kategoriListContent}
          >
            {/* Kategorisiz seçeneği */}
            <TouchableOpacity
              style={[
                styles.kategoriModalItem,
                formKategoriId === "" && styles.kategoriModalItemActive,
              ]}
              onPress={() => {
                setFormKategoriId("");
                setShowKategoriModal(false);
              }}
            >
              <Text
                style={[
                  styles.kategoriModalItemText,
                  formKategoriId === "" && styles.kategoriModalItemTextActive,
                ]}
              >
                Kategorisiz
              </Text>
              {formKategoriId === "" && <Check size={20} color="#10b981" />}
            </TouchableOpacity>

            <View style={styles.kategoriSeparator} />

            {/* Sadece GİDER kategorilerini göster (alış için) */}
            {kategoriler
              .filter((k) => k.type === "gider" && !k.parent_id) // Ana kategoriler
              .filter(
                (k) =>
                  kategoriSearch === "" ||
                  k.name.toLowerCase().includes(kategoriSearch.toLowerCase()) ||
                  kategoriler.some(
                    (sub) =>
                      sub.parent_id === k.id &&
                      sub.name
                        .toLowerCase()
                        .includes(kategoriSearch.toLowerCase())
                  )
              )
              .map((anaKategori) => {
                const altKategoriler = kategoriler
                  .filter((k) => k.parent_id === anaKategori.id)
                  .filter(
                    (k) =>
                      kategoriSearch === "" ||
                      k.name
                        .toLowerCase()
                        .includes(kategoriSearch.toLowerCase())
                  );

                return (
                  <View key={anaKategori.id} style={styles.kategoriGroup}>
                    {/* Ana Kategori Başlığı */}
                    <TouchableOpacity
                      style={[
                        styles.kategoriAnaBaslik,
                        formKategoriId === anaKategori.id &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setFormKategoriId(anaKategori.id);
                        setShowKategoriModal(false);
                      }}
                    >
                      <Text style={styles.kategoriAnaBaslikText}>
                        {anaKategori.name}
                      </Text>
                      {formKategoriId === anaKategori.id && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>

                    {/* Alt Kategoriler */}
                    {altKategoriler.map((altKategori) => (
                      <TouchableOpacity
                        key={altKategori.id}
                        style={[
                          styles.kategoriAltItem,
                          formKategoriId === altKategori.id &&
                            styles.kategoriModalItemActive,
                        ]}
                        onPress={() => {
                          setFormKategoriId(altKategori.id);
                          setShowKategoriModal(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.kategoriAltItemText,
                            formKategoriId === altKategori.id &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {altKategori.name}
                        </Text>
                        {formKategoriId === altKategori.id && (
                          <Check size={20} color="#10b981" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}

            {/* Alt kategorisi olmayan gider kategorileri */}
            {kategoriler
              .filter((k) => k.type === "gider" && !k.parent_id)
              .filter(
                (k) =>
                  kategoriler.filter((sub) => sub.parent_id === k.id).length ===
                  0
              ).length === 0 &&
              kategoriler.filter((k) => k.type === "gider").length === 0 && (
                <View style={styles.emptyKategori}>
                  <Text style={styles.emptyKategoriText}>
                    Henüz gider kategorisi eklenmemiş
                  </Text>
                </View>
              )}
          </ScrollView>

          {/* Yeni Kategori Ekleme Formu */}
          {showAddKategori ? (
            <View style={styles.addKategoriForm}>
              <Text style={styles.addKategoriTitle}>Yeni Kategori Ekle</Text>

              {/* Kategori Adı */}
              <TextInput
                style={styles.addKategoriInput}
                placeholder="Kategori adı"
                placeholderTextColor="#9ca3af"
                value={newKategoriName}
                onChangeText={setNewKategoriName}
                autoFocus
              />

              {/* Ana Kategori Seçimi (Opsiyonel) */}
              <View style={styles.parentSelectContainer}>
                <Text style={styles.parentSelectLabel}>
                  Ana Kategori (Opsiyonel)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                        newKategoriParentId === null &&
                          styles.parentChipTextActive,
                      ]}
                    >
                      Ana Kategori
                    </Text>
                  </TouchableOpacity>
                  {kategoriler
                    .filter((k) => k.type === "gider" && !k.parent_id)
                    .map((k) => (
                      <TouchableOpacity
                        key={k.id}
                        style={[
                          styles.parentChip,
                          newKategoriParentId === k.id &&
                            styles.parentChipActive,
                        ]}
                        onPress={() => setNewKategoriParentId(k.id)}
                      >
                        <Text
                          style={[
                            styles.parentChipText,
                            newKategoriParentId === k.id &&
                              styles.parentChipTextActive,
                          ]}
                        >
                          {k.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              {/* Butonlar */}
              <View style={styles.addKategoriBtns}>
                <TouchableOpacity
                  style={styles.addKategoriCancelBtn}
                  onPress={() => {
                    setShowAddKategori(false);
                    setNewKategoriName("");
                    setNewKategoriParentId(null);
                  }}
                >
                  <Text style={styles.addKategoriCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addKategoriSaveBtn,
                    addingKategori && styles.addKategoriSaveBtnDisabled,
                  ]}
                  onPress={handleAddKategori}
                  disabled={addingKategori}
                >
                  <Text style={styles.addKategoriSaveText}>
                    {addingKategori ? "Ekleniyor..." : "Ekle"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addKategoriBtn}
              onPress={() => setShowAddKategori(true)}
            >
              <Plus size={20} color="#3b82f6" />
              <Text style={styles.addKategoriBtnText}>Yeni Kategori Ekle</Text>
            </TouchableOpacity>
          )}
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
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  filterBtnActive: {
    backgroundColor: "#3b82f6",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cariContainer: {
    marginBottom: 10,
  },
  cariCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  cariCardExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cariLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cariIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cariInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cariName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cariBalance: {
    fontSize: 15,
    marginTop: 2,
  },
  cariRight: {
    padding: 4,
  },
  expandedContent: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 14,
  },
  islemTipleri: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  islemTipBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  islemTipText: {
    fontSize: 15,
    fontWeight: "700",
  },
  kalemliBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ede9fe",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  kalemliBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#8b5cf6",
  },
  formContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 10,
  },
  formInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 12,
  },
  kasaScroll: {
    marginBottom: 10,
  },
  kasaChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kasaChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  kasaChipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  kasaChipTextActive: {
    color: "#fff",
  },
  kategoriSection: {
    marginBottom: 10,
    zIndex: 10,
  },
  kategoriDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kategoriDropdownText: {
    fontSize: 14,
    color: "#111827",
  },
  kategoriDropdownPlaceholder: {
    color: "#9ca3af",
  },
  kategoriPickerContainer: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  kategoriPicker: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  kategoriOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriOptionActive: {
    backgroundColor: "#eff6ff",
  },
  kategoriOptionText: {
    fontSize: 14,
    color: "#111827",
  },
  kategoriOptionTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  amountRow: {
    flexDirection: "row",
    gap: 10,
  },
  amountBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  currencySign: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 10,
    paddingLeft: 6,
  },
  saveBtn: {
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  detayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 6,
  },
  detayBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  // Kategori Seçim Butonu
  kategoriSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  kategoriSelectText: {
    fontSize: 15,
    color: "#111827",
  },
  kategoriSelectPlaceholder: {
    color: "#9ca3af",
  },
  // Kategori Modal
  kategoriModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  kategoriModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  kategoriModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  kategoriModalCloseBtn: {
    padding: 4,
  },
  kategoriSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  kategoriSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  kategoriListContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  kategoriModalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  kategoriModalItemActive: {
    backgroundColor: "#f0fdf4",
    marginHorizontal: -4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  kategoriModalItemText: {
    fontSize: 16,
    color: "#374151",
  },
  kategoriModalItemTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
  kategoriSeparator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  kategoriScrollView: {
    flex: 1,
  },
  kategoriGroup: {
    marginBottom: 16,
  },
  kategoriAnaBaslik: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 4,
  },
  kategoriAnaBaslikText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  kategoriAltItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingLeft: 20,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriAltItemText: {
    fontSize: 15,
    color: "#4b5563",
  },
  emptyKategori: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyKategoriText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  // Yeni Kategori Ekleme Stilleri
  addKategoriBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
  },
  addKategoriBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3b82f6",
  },
  addKategoriForm: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addKategoriHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  addKategoriTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  addKategoriInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  addKategoriLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  parentKategoriScroll: {
    marginBottom: 12,
  },
  parentKategoriChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  parentKategoriChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  parentKategoriChipText: {
    fontSize: 13,
    color: "#4b5563",
  },
  parentKategoriChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  addKategoriSaveBtn: {
    flex: 1,
    backgroundColor: "#10b981",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addKategoriSaveBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  addKategoriSaveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  addKategoriCancelBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addKategoriCancelText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "600",
  },
  addKategoriBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  parentSelectContainer: {
    marginBottom: 12,
  },
  parentSelectLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  parentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  parentChipActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  parentChipText: {
    fontSize: 13,
    color: "#4b5563",
  },
  parentChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
