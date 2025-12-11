import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Plus,
  Trash2,
  Package,
  ChevronDown,
  FileText,
  Check,
  Search,
  Scale,
  UtensilsCrossed,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Cari, MenuItem } from "../types";
import { supabase } from "../lib/supabase";
import DatePickerField from "./DatePickerField";

interface Props {
  visible: boolean;
  onClose: () => void;
  cari: Cari | null;
}

interface Kalem {
  id: string;
  menu_item_id: string | null;
  urun_adi: string;
  quantity: string;
  unit: string;
  unit_price: string;
  kdv_rate: string;
  kategori: string;
}

const kdvOranlari = [
  { value: "0", label: "%0" },
  { value: "1", label: "%1" },
  { value: "10", label: "%10" },
  { value: "20", label: "%20" },
];

const birimler = [
  { value: "porsiyon", label: "porsiyon" },
  { value: "adet", label: "adet" },
  { value: "kg", label: "kg" },
  { value: "gr", label: "gr" },
  { value: "lt", label: "lt" },
  { value: "ml", label: "ml" },
  { value: "paket", label: "paket" },
  { value: "kutu", label: "kutu" },
];

export default function MusteriKalemliFaturaModal({
  visible,
  onClose,
  cari,
}: Props) {
  const { profile, menuItems, fetchMenuItems, fetchCariler, fetchIslemler } =
    useStore();

  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDescription, setFormDescription] = useState("");
  const [faturaTipi, setFaturaTipi] = useState<"satis" | "iade">("satis");
  const [loading, setLoading] = useState(false);

  // Ürün seçme modal
  const [showUrunModal, setShowUrunModal] = useState(false);
  const [activeKalemId, setActiveKalemId] = useState<string | null>(null);
  const [urunSearchText, setUrunSearchText] = useState("");

  // Birim modal
  const [showBirimModal, setShowBirimModal] = useState(false);
  const [activeBirimKalemId, setActiveBirimKalemId] = useState<string | null>(
    null
  );

  // KDV modal
  const [showKdvModal, setShowKdvModal] = useState(false);
  const [activeKdvKalemId, setActiveKdvKalemId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchMenuItems();
      setFormDate(new Date().toISOString().split("T")[0]);
    }
  }, [visible]);

  const addKalem = () => {
    const newKalem: Kalem = {
      id: Date.now().toString(),
      menu_item_id: null,
      urun_adi: "",
      quantity: "1",
      unit: "porsiyon",
      unit_price: "",
      kdv_rate: "10",
      kategori: "",
    };
    setKalemler([...kalemler, newKalem]);
  };

  const removeKalem = (id: string) => {
    setKalemler(kalemler.filter((k) => k.id !== id));
  };

  const updateKalem = (
    id: string,
    field: keyof Kalem,
    value: string | null
  ) => {
    setKalemler(
      kalemler.map((k) => (k.id === id ? { ...k, [field]: value } : k))
    );
  };

  const openUrunModal = (kalemId: string) => {
    setActiveKalemId(kalemId);
    setUrunSearchText("");
    setShowUrunModal(true);
  };

  const selectUrun = (menuItem: MenuItem) => {
    if (activeKalemId) {
      setKalemler(
        kalemler.map((k) =>
          k.id === activeKalemId
            ? {
                ...k,
                menu_item_id: menuItem.id,
                urun_adi: menuItem.name,
                unit_price: menuItem.price?.toString() || "",
                kategori: menuItem.category || "",
              }
            : k
        )
      );
    }
    setShowUrunModal(false);
    setActiveKalemId(null);
  };

  const getGroupedMenuItems = () => {
    const filtered = menuItems.filter(
      (m) =>
        m.is_active &&
        m.name.toLowerCase().includes(urunSearchText.toLowerCase())
    );

    const grouped: { title: string; data: MenuItem[] }[] = [];
    const categories = [...new Set(filtered.map((m) => m.category || "Diğer"))];

    categories.sort((a, b) => a.localeCompare(b, "tr"));

    categories.forEach((cat) => {
      const items = filtered.filter((m) => (m.category || "Diğer") === cat);
      if (items.length > 0) {
        grouped.push({
          title: cat,
          data: items.sort((a, b) => a.name.localeCompare(b.name, "tr")),
        });
      }
    });

    return grouped;
  };

  // Virgülü noktaya çeviren yardımcı fonksiyon (Türkçe klavye desteği)
  const parseAmount = (value: string): number => {
    const normalized = value.replace(",", ".");
    return parseFloat(normalized) || 0;
  };

  const calculateKalemTotal = (kalem: Kalem) => {
    const qty = parseAmount(kalem.quantity);
    const price = parseAmount(kalem.unit_price);
    return qty * price;
  };

  const calculateKalemKdv = (kalem: Kalem) => {
    const total = calculateKalemTotal(kalem);
    const kdvRate = parseAmount(kalem.kdv_rate);
    return total * (kdvRate / 100);
  };

  const araToplam = kalemler.reduce(
    (sum, k) => sum + calculateKalemTotal(k),
    0
  );
  const toplamKdv = kalemler.reduce((sum, k) => sum + calculateKalemKdv(k), 0);
  const genelToplam = araToplam + toplamKdv;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const handleSave = async () => {
    const invalidKalem = kalemler.find(
      (k) => !k.urun_adi.trim() || !k.unit_price
    );
    if (invalidKalem) {
      Alert.alert("Hata", "Tüm kalemler için ürün adı ve fiyat girin");
      return;
    }

    if (genelToplam <= 0) {
      Alert.alert("Hata", "Toplam tutar sıfırdan büyük olmalı");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      // Fatura tipine göre işlem türü ve açıklama
      const islemType = faturaTipi === "satis" ? "satis" : "musteri_iade";
      const defaultDesc =
        faturaTipi === "satis"
          ? `${cari?.name} - Kalemli Satış`
          : `${cari?.name} - Kalemli Satış İadesi`;

      const { data: islem, error: islemError } = await supabase
        .from("islemler")
        .insert({
          type: islemType,
          amount: genelToplam,
          description: formDescription.trim() || defaultDesc,
          date: formDate,
          cari_id: cari?.id,
          restaurant_id: profile?.restaurant_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (islemError) throw islemError;

      // İşlem kalemlerini kaydet
      const kalemlerData = kalemler.map((k) => ({
        islem_id: islem.id,
        urun_id: null, // menuItem için farklı tablo kullanıyoruz
        urun_adi: k.urun_adi,
        quantity: parseAmount(k.quantity) || 1,
        unit: k.unit,
        unit_price: parseAmount(k.unit_price) || 0,
        total_price: calculateKalemTotal(k),
        kdv_rate: parseAmount(k.kdv_rate) || 0,
        kategori_id: null, // MenuItem'da kategori string olarak tutuluyor
      }));

      const { error: kalemlerError } = await supabase
        .from("islem_kalemleri")
        .insert(kalemlerData);

      if (kalemlerError) throw kalemlerError;

      // Cari bakiyesini güncelle
      // Satış: müşteri borcu artar (+), İade: müşteri borcu azalır (-)
      if (cari) {
        const cariMultiplier = faturaTipi === "satis" ? 1 : -1;
        await supabase.rpc("update_cari_balance", {
          cari_id: cari.id,
          amount: genelToplam * cariMultiplier,
        });
      }

      const successMsg =
        faturaTipi === "satis"
          ? "Kalemli satış kaydedildi"
          : "Kalemli satış iadesi kaydedildi";
      Alert.alert("Başarılı", successMsg);

      setKalemler([]);
      setFormDescription("");
      setFormDate(new Date().toISOString().split("T")[0]);
      setFaturaTipi("satis");

      fetchCariler();
      fetchIslemler();

      onClose();
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      Alert.alert("Hata", "Kayıt sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (kalemler.some((k) => k.urun_adi || k.unit_price)) {
      Alert.alert(
        "Çıkış",
        "Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Çık",
            style: "destructive",
            onPress: () => {
              setKalemler([]);
              setFormDescription("");
              setFaturaTipi("satis");
              onClose();
            },
          },
        ]
      );
    } else {
      setKalemler([]);
      setFaturaTipi("satis");
      onClose();
    }
  };

  const renderKalem = (kalem: Kalem, index: number) => (
    <View key={kalem.id} style={styles.kalemCard}>
      <View style={styles.kalemHeader}>
        <Text style={styles.kalemNo}>#{index + 1}</Text>
        <TouchableOpacity
          onPress={() => removeKalem(kalem.id)}
          style={styles.removeKalemBtn}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Ürün Seç */}
      <TouchableOpacity
        style={styles.urunSelectBtn}
        onPress={() => openUrunModal(kalem.id)}
      >
        <Package size={18} color={kalem.urun_adi ? "#10b981" : "#6b7280"} />
        <Text
          style={[
            styles.urunSelectText,
            kalem.urun_adi && styles.urunSelectTextFilled,
          ]}
          numberOfLines={1}
        >
          {kalem.urun_adi || "Ürün Seç"}
        </Text>
        <ChevronDown size={18} color="#6b7280" />
      </TouchableOpacity>

      {/* Kategori gösterimi */}
      {kalem.kategori ? (
        <View style={styles.kategoriTag}>
          <Text style={styles.kategoriTagText}>{kalem.kategori}</Text>
        </View>
      ) : null}

      {/* Miktar ve Birim */}
      <View style={styles.kalemRow}>
        <View style={styles.kalemInputGroup}>
          <Text style={styles.kalemLabel}>Miktar</Text>
          <TextInput
            style={styles.kalemInput}
            value={kalem.quantity}
            onChangeText={(v) => updateKalem(kalem.id, "quantity", v)}
            keyboardType="decimal-pad"
            placeholder="1"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.kalemInputGroup}>
          <Text style={styles.kalemLabel}>Birim</Text>
          <TouchableOpacity
            style={styles.kalemDropdownBtn}
            onPress={() => {
              setActiveBirimKalemId(kalem.id);
              setShowBirimModal(true);
            }}
          >
            <Text style={styles.kalemDropdownText}>{kalem.unit}</Text>
            <ChevronDown size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Birim Fiyat ve KDV */}
      <View style={styles.kalemRow}>
        <View style={styles.kalemInputGroup}>
          <Text style={styles.kalemLabel}>Birim Fiyat</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.kalemPriceInput}
              value={kalem.unit_price}
              onChangeText={(v) => updateKalem(kalem.id, "unit_price", v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
        <View style={styles.kalemInputGroup}>
          <Text style={styles.kalemLabel}>KDV</Text>
          <TouchableOpacity
            style={styles.kalemDropdownBtn}
            onPress={() => {
              setActiveKdvKalemId(kalem.id);
              setShowKdvModal(true);
            }}
          >
            <Text style={styles.kalemDropdownText}>%{kalem.kdv_rate}</Text>
            <ChevronDown size={14} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Kalem Toplamı */}
      <View style={styles.kalemTotalRow}>
        <Text style={styles.kalemTotalLabel}>Kalem Toplamı:</Text>
        <Text style={styles.kalemTotalValue}>
          {formatCurrency(
            calculateKalemTotal(kalem) + calculateKalemKdv(kalem)
          )}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerBtn}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Satış Faturası</Text>
            <Text style={styles.headerSubtitle}>{cari?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.headerBtn}
            disabled={loading || kalemler.length === 0}
          >
            <Check
              size={24}
              color={kalemler.length > 0 ? "#10b981" : "#d1d5db"}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Fatura Tipi Seçimi */}
          <View style={styles.faturaTipiContainer}>
            <TouchableOpacity
              style={[
                styles.faturaTipiBtn,
                faturaTipi === "satis" && styles.faturaTipiBtnActiveSatis,
              ]}
              onPress={() => setFaturaTipi("satis")}
            >
              <Text
                style={[
                  styles.faturaTipiBtnText,
                  faturaTipi === "satis" && styles.faturaTipiBtnTextActive,
                ]}
              >
                Satış Faturası
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.faturaTipiBtn,
                faturaTipi === "iade" && styles.faturaTipiBtnActiveIade,
              ]}
              onPress={() => setFaturaTipi("iade")}
            >
              <Text
                style={[
                  styles.faturaTipiBtnText,
                  faturaTipi === "iade" && styles.faturaTipiBtnTextActive,
                ]}
              >
                Satış İade Faturası
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tarih */}
          <View style={styles.dateSection}>
            <DatePickerField value={formDate} onChange={setFormDate} />
          </View>

          {/* Açıklama */}
          <View style={styles.descriptionSection}>
            <View style={styles.descriptionInputContainer}>
              <FileText size={18} color="#6b7280" />
              <TextInput
                style={styles.descriptionInput}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Açıklama (opsiyonel)"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Kalemler */}
          <View style={styles.kalemlerSection}>
            <Text style={styles.sectionTitle}>Fatura Kalemleri</Text>
            {kalemler.map((kalem, index) => renderKalem(kalem, index))}

            {/* Yeni Kalem Ekle */}
            <TouchableOpacity style={styles.addKalemBtn} onPress={addKalem}>
              <Plus size={20} color="#3b82f6" />
              <Text style={styles.addKalemText}>Yeni Kalem Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Toplam */}
          {kalemler.length > 0 && (
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Ara Toplam:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(araToplam)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Toplam KDV:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(toplamKdv)}
                </Text>
              </View>
              <View style={styles.totalRowFinal}>
                <Text style={styles.totalLabelFinal}>Genel Toplam:</Text>
                <Text style={styles.totalValueFinal}>
                  {formatCurrency(genelToplam)}
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Kaydet Butonu (Sabit Alt) */}
        {kalemler.length > 0 && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[
                styles.saveBtn,
                faturaTipi === "satis"
                  ? styles.saveBtnSatis
                  : styles.saveBtnIade,
                loading && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveBtnText}>
                {loading
                  ? "Kaydediliyor..."
                  : `${
                      faturaTipi === "satis" ? "SATIŞI" : "İADEYİ"
                    } KAYDET - ${formatCurrency(genelToplam)}`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Ürün Seçme Modal */}
      <Modal
        visible={showUrunModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={styles.urunModalContainer}
          edges={["top", "left", "right"]}
        >
          <View style={styles.urunModalHeader}>
            <Text style={styles.urunModalTitle}>Ürün Seç</Text>
            <TouchableOpacity
              style={styles.urunModalCloseBtn}
              onPress={() => {
                setShowUrunModal(false);
                setActiveKalemId(null);
              }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Arama */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Ürün ara..."
              placeholderTextColor="#9ca3af"
              value={urunSearchText}
              onChangeText={setUrunSearchText}
            />
          </View>

          {/* Ürün Listesi */}
          <SectionList
            sections={getGroupedMenuItems()}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <UtensilsCrossed size={16} color="#6b7280" />
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.urunItem}
                onPress={() => selectUrun(item)}
              >
                <View style={styles.urunItemLeft}>
                  <Text style={styles.urunItemName}>{item.name}</Text>
                  <Text style={styles.urunItemCategory}>{item.category}</Text>
                </View>
                <Text style={styles.urunItemPrice}>
                  {formatCurrency(item.price)}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>
                  {urunSearchText
                    ? "Ürün bulunamadı"
                    : "Henüz ürün tanımlı değil"}
                </Text>
                <Text style={styles.emptyListSubtext}>
                  Ürünler "Satış Takip" sayfasından eklenebilir
                </Text>
              </View>
            }
            stickySectionHeadersEnabled
          />
        </SafeAreaView>
      </Modal>

      {/* Birim Seçme Modal */}
      <Modal
        visible={showBirimModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={styles.pickerModalContainer}
          edges={["top", "left", "right"]}
        >
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>Birim Seç</Text>
            <TouchableOpacity
              style={styles.pickerModalCloseBtn}
              onPress={() => setShowBirimModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.pickerScrollView}
            contentContainerStyle={styles.pickerListContent}
          >
            {birimler.map((birim) => {
              const isSelected = activeBirimKalemId
                ? kalemler.find((k) => k.id === activeBirimKalemId)?.unit ===
                  birim.value
                : false;
              return (
                <TouchableOpacity
                  key={birim.value}
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    if (activeBirimKalemId) {
                      updateKalem(activeBirimKalemId, "unit", birim.value);
                    }
                    setShowBirimModal(false);
                    setActiveBirimKalemId(null);
                  }}
                >
                  <View style={styles.pickerItemContent}>
                    <Scale
                      size={18}
                      color={isSelected ? "#10b981" : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.pickerItemText,
                        isSelected && styles.pickerItemTextActive,
                      ]}
                    >
                      {birim.label}
                    </Text>
                  </View>
                  {isSelected && <Check size={20} color="#10b981" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* KDV Seçme Modal */}
      <Modal
        visible={showKdvModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView
          style={styles.pickerModalContainer}
          edges={["top", "left", "right"]}
        >
          <View style={styles.pickerModalHeader}>
            <Text style={styles.pickerModalTitle}>KDV Oranı Seç</Text>
            <TouchableOpacity
              style={styles.pickerModalCloseBtn}
              onPress={() => setShowKdvModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.pickerScrollView}
            contentContainerStyle={styles.pickerListContent}
          >
            {kdvOranlari.map((kdv) => {
              const isSelected = activeKdvKalemId
                ? kalemler.find((k) => k.id === activeKdvKalemId)?.kdv_rate ===
                  kdv.value
                : false;
              return (
                <TouchableOpacity
                  key={kdv.value}
                  style={[
                    styles.pickerItem,
                    isSelected && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    if (activeKdvKalemId) {
                      updateKalem(activeKdvKalemId, "kdv_rate", kdv.value);
                    }
                    setShowKdvModal(false);
                    setActiveKdvKalemId(null);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextActive,
                    ]}
                  >
                    {kdv.label}
                  </Text>
                  {isSelected && <Check size={20} color="#10b981" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBtn: { padding: 12 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  content: { flex: 1 },

  // Fatura Tipi
  faturaTipiContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    margin: 16,
    marginBottom: 0,
  },
  faturaTipiBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  faturaTipiBtnActiveSatis: { backgroundColor: "#10b981" },
  faturaTipiBtnActiveIade: { backgroundColor: "#f59e0b" },
  faturaTipiBtnText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  faturaTipiBtnTextActive: { color: "#fff" },

  // Tarih
  dateSection: { padding: 16, paddingBottom: 0 },

  // Açıklama
  descriptionSection: { padding: 16, paddingTop: 0 },
  descriptionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  descriptionInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },

  // Kalemler
  kalemlerSection: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  kalemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kalemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kalemNo: { fontSize: 14, fontWeight: "700", color: "#6b7280" },
  removeKalemBtn: { padding: 4 },

  // Ürün Seç
  urunSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  urunSelectText: { flex: 1, fontSize: 15, color: "#9ca3af" },
  urunSelectTextFilled: { color: "#111827", fontWeight: "500" },

  // Kategori Tag
  kategoriTag: {
    alignSelf: "flex-start",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  kategoriTagText: { fontSize: 12, color: "#3b82f6", fontWeight: "500" },

  // Kalem Row
  kalemRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  kalemInputGroup: { flex: 1 },
  kalemLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  kalemInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kalemDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kalemDropdownText: { fontSize: 15, color: "#111827" },

  // Price Input
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currencySymbol: { fontSize: 15, color: "#6b7280", marginRight: 4 },
  kalemPriceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },

  // Kalem Total
  kalemTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  kalemTotalLabel: { fontSize: 14, color: "#6b7280" },
  kalemTotalValue: { fontSize: 16, fontWeight: "700", color: "#111827" },

  // Add Kalem
  addKalemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
  },
  addKalemText: { fontSize: 15, fontWeight: "600", color: "#3b82f6" },

  // Toplam
  totalSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 14, color: "#111827" },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalLabelFinal: { fontSize: 16, fontWeight: "700", color: "#111827" },
  totalValueFinal: { fontSize: 18, fontWeight: "700", color: "#10b981" },

  // Bottom Bar
  bottomBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnSatis: { backgroundColor: "#10b981" },
  saveBtnIade: { backgroundColor: "#f59e0b" },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Ürün Modal
  urunModalContainer: { flex: 1, backgroundColor: "#fff" },
  urunModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  urunModalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  urunModalCloseBtn: { padding: 4 },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Ürün Item
  urunItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  urunItemLeft: { flex: 1 },
  urunItemName: { fontSize: 15, fontWeight: "500", color: "#111827" },
  urunItemCategory: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  urunItemPrice: { fontSize: 15, fontWeight: "600", color: "#10b981" },

  // Empty List
  emptyList: { alignItems: "center", paddingVertical: 40 },
  emptyListText: { fontSize: 15, color: "#6b7280", marginBottom: 4 },
  emptyListSubtext: { fontSize: 13, color: "#9ca3af" },

  // Picker Modal
  pickerModalContainer: { flex: 1, backgroundColor: "#fff" },
  pickerModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerModalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  pickerModalCloseBtn: { padding: 4 },
  pickerScrollView: { flex: 1 },
  pickerListContent: { padding: 16 },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pickerItemActive: { backgroundColor: "#f0fdf4", borderColor: "#10b981" },
  pickerItemContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  pickerItemText: { fontSize: 16, color: "#374151", fontWeight: "500" },
  pickerItemTextActive: { color: "#10b981", fontWeight: "600" },
});
