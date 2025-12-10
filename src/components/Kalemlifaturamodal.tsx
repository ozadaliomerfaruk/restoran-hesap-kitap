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
  Tag,
  Scale,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Cari, Urun, Kategori } from "../types";
import { supabase } from "../lib/supabase";
import DatePickerField from "./DatePickerField";

interface Props {
  visible: boolean;
  onClose: () => void;
  cari: Cari | null;
}

interface Kalem {
  id: string;
  urun_id: string | null;
  urun_adi: string;
  quantity: string;
  unit: string;
  unit_price: string;
  kdv_rate: string;
  kategori_id: string | null;
}

const kdvOranlari = [
  { value: "0", label: "%0" },
  { value: "1", label: "%1" },
  { value: "10", label: "%10" },
  { value: "20", label: "%20" },
];

const birimler = [
  { value: "kg", label: "kg" },
  { value: "gr", label: "gr" },
  { value: "lt", label: "lt" },
  { value: "ml", label: "ml" },
  { value: "adet", label: "adet" },
  { value: "paket", label: "paket" },
  { value: "kutu", label: "kutu" },
  { value: "koli", label: "koli" },
  { value: "bidon", label: "bidon" },
  { value: "porsiyon", label: "porsiyon" },
  { value: "deste", label: "deste" },
];

export default function KalemliFaturaModal({ visible, onClose, cari }: Props) {
  const {
    profile,
    urunler,
    fetchUrunler,
    addUrun,
    kategoriler,
    fetchKategoriler,
    fetchCariler,
    fetchIslemler,
  } = useStore();

  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDescription, setFormDescription] = useState("");
  const [faturaTipi, setFaturaTipi] = useState<"alis" | "iade">("alis");
  const [loading, setLoading] = useState(false);

  // Ürün seçme modal
  const [showUrunModal, setShowUrunModal] = useState(false);
  const [activeKalemId, setActiveKalemId] = useState<string | null>(null);
  const [urunSearchText, setUrunSearchText] = useState("");

  // Ürün ekleme state
  const [showAddUrunForm, setShowAddUrunForm] = useState(false);
  const [newUrunName, setNewUrunName] = useState("");
  const [newUrunUnit, setNewUrunUnit] = useState("adet");
  const [newUrunPrice, setNewUrunPrice] = useState("");
  const [newUrunKdvRate, setNewUrunKdvRate] = useState("10");
  const [newUrunKategoriId, setNewUrunKategoriId] = useState<string | null>(
    null
  );
  const [addingUrun, setAddingUrun] = useState(false);
  const [showNewUrunBirimModal, setShowNewUrunBirimModal] = useState(false);
  const [showNewUrunKdvDropdown, setShowNewUrunKdvDropdown] = useState(false);
  const [showNewUrunKategoriModal, setShowNewUrunKategoriModal] =
    useState(false);

  // Kalem dropdown'ları
  const [activeKdvKalemId, setActiveKdvKalemId] = useState<string | null>(null);
  const [activeBirimKalemId, setActiveBirimKalemId] = useState<string | null>(
    null
  );

  // Tedarikçi kategorileri (ürün kategorileri)
  const tedarikciKategori = kategoriler.find(
    (k) => k.name.toLowerCase() === "tedarikçi" && k.type === "gider"
  );
  const urunKategoriler = tedarikciKategori
    ? kategoriler.filter((k) => k.parent_id === tedarikciKategori.id)
    : [];

  useEffect(() => {
    if (visible) {
      fetchUrunler();
      fetchKategoriler();
      if (kalemler.length === 0) {
        addKalem();
      }
    }
  }, [visible]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addKalem = () => {
    const newKalem: Kalem = {
      id: generateId(),
      urun_id: null,
      urun_adi: "",
      quantity: "1",
      unit: "adet",
      unit_price: "",
      kdv_rate: "10",
      kategori_id: null,
    };
    setKalemler([...kalemler, newKalem]);
  };

  const removeKalem = (id: string) => {
    if (kalemler.length === 1) {
      Alert.alert("Uyarı", "En az bir kalem olmalı");
      return;
    }
    setKalemler(kalemler.filter((k) => k.id !== id));
  };

  const updateKalem = (
    id: string,
    field: keyof Kalem,
    value: string | null
  ) => {
    setKalemler(
      kalemler.map((k) => {
        if (k.id === id) {
          return { ...k, [field]: value };
        }
        return k;
      })
    );
  };

  const selectUrun = (urun: Urun) => {
    if (activeKalemId) {
      setKalemler(
        kalemler.map((k) => {
          if (k.id === activeKalemId) {
            return {
              ...k,
              urun_id: urun.id,
              urun_adi: urun.name,
              unit: urun.unit,
              unit_price: urun.default_price?.toString() || "",
              kdv_rate: urun.kdv_rate?.toString() || "10",
              kategori_id: urun.kategori_id || null,
            };
          }
          return k;
        })
      );
    }
    setShowUrunModal(false);
    setActiveKalemId(null);
    setUrunSearchText("");
  };

  const openUrunModal = (kalemId: string) => {
    setActiveKalemId(kalemId);
    setShowUrunModal(true);
    setShowAddUrunForm(false);
    setUrunSearchText("");
  };

  const handleAddNewUrun = async () => {
    if (!newUrunName.trim()) {
      Alert.alert("Hata", "Ürün adı girin");
      return;
    }

    setAddingUrun(true);
    const { error } = await addUrun({
      restaurant_id: profile?.restaurant_id || "",
      name: newUrunName.trim(),
      unit: newUrunUnit || "adet",
      default_price: newUrunPrice ? parseFloat(newUrunPrice) : undefined,
      kdv_rate: newUrunKdvRate ? parseInt(newUrunKdvRate) : 10,
      kategori_id: newUrunKategoriId || undefined,
      is_active: true,
    });
    setAddingUrun(false);

    if (error) {
      Alert.alert("Hata", "Ürün eklenirken bir hata oluştu");
    } else {
      await fetchUrunler();
      setNewUrunName("");
      setNewUrunUnit("adet");
      setNewUrunPrice("");
      setNewUrunKdvRate("10");
      setNewUrunKategoriId(null);
      setShowAddUrunForm(false);
    }
  };

  const getGroupedUrunler = () => {
    const filtered = urunler.filter(
      (u) =>
        u.is_active &&
        u.name.toLowerCase().includes(urunSearchText.toLowerCase())
    );

    const grouped: {
      title: string;
      data: Urun[];
      kategoriId: string | null;
    }[] = [];

    const kategorisiz = filtered.filter((u) => !u.kategori_id);
    if (kategorisiz.length > 0) {
      grouped.push({
        title: "Kategorisiz",
        data: kategorisiz.sort((a, b) => a.name.localeCompare(b.name, "tr")),
        kategoriId: null,
      });
    }

    urunKategoriler.forEach((kat) => {
      const katUrunler = filtered.filter((u) => u.kategori_id === kat.id);
      if (katUrunler.length > 0) {
        grouped.push({
          title: kat.name,
          data: katUrunler.sort((a, b) => a.name.localeCompare(b.name, "tr")),
          kategoriId: kat.id,
        });
      }
    });

    return grouped;
  };

  const calculateKalemTotal = (kalem: Kalem) => {
    const qty = parseFloat(kalem.quantity) || 0;
    const price = parseFloat(kalem.unit_price) || 0;
    return qty * price;
  };

  const calculateKalemKdv = (kalem: Kalem) => {
    const total = calculateKalemTotal(kalem);
    const kdvRate = parseFloat(kalem.kdv_rate) || 0;
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
      const islemType = faturaTipi === "alis" ? "gider" : "iade";
      const defaultDesc =
        faturaTipi === "alis"
          ? `${cari?.name} - Kalemli Alış`
          : `${cari?.name} - Kalemli İade`;

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

      const kalemlerData = kalemler.map((k) => ({
        islem_id: islem.id,
        urun_id: k.urun_id,
        urun_adi: k.urun_adi,
        quantity: parseFloat(k.quantity) || 1,
        unit: k.unit,
        unit_price: parseFloat(k.unit_price) || 0,
        total_price: calculateKalemTotal(k),
        kdv_rate: parseFloat(k.kdv_rate) || 0,
        kategori_id: k.kategori_id,
      }));

      const { error: kalemlerError } = await supabase
        .from("islem_kalemleri")
        .insert(kalemlerData);

      if (kalemlerError) throw kalemlerError;

      // Cari bakiyesini güncelle
      // Alış: borç artar (+), İade: borç azalır (-)
      if (cari) {
        const cariMultiplier = faturaTipi === "alis" ? 1 : -1;
        await supabase.rpc("update_cari_balance", {
          cari_id: cari.id,
          amount: genelToplam * cariMultiplier,
        });
      }

      const successMsg =
        faturaTipi === "alis"
          ? "Kalemli alış kaydedildi"
          : "Kalemli iade kaydedildi";
      Alert.alert("Başarılı", successMsg);

      setKalemler([]);
      setFormDescription("");
      setFormDate(new Date().toISOString().split("T")[0]);
      setFaturaTipi("alis");

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
              setFaturaTipi("alis");
              onClose();
            },
          },
        ]
      );
    } else {
      setKalemler([]);
      setFaturaTipi("alis");
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

      <TouchableOpacity
        style={styles.urunSelectBtn}
        onPress={() => openUrunModal(kalem.id)}
      >
        <Package size={18} color={kalem.urun_adi ? "#3b82f6" : "#9ca3af"} />
        <Text
          style={[styles.urunSelectText, !kalem.urun_adi && styles.placeholder]}
        >
          {kalem.urun_adi || "Ürün Seç"}
        </Text>
        <ChevronDown size={18} color="#9ca3af" />
      </TouchableOpacity>

      <View style={styles.kalemRow}>
        <View style={styles.qtyBox}>
          <Text style={styles.kalemLabel}>Miktar</Text>
          <TextInput
            style={styles.qtyInput}
            value={kalem.quantity}
            onChangeText={(v) => updateKalem(kalem.id, "quantity", v)}
            keyboardType="decimal-pad"
            placeholder="1"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.unitBox}>
          <Text style={styles.kalemLabel}>Birim</Text>
          <TouchableOpacity
            style={styles.unitSelectBtn}
            onPress={() =>
              setActiveBirimKalemId(
                activeBirimKalemId === kalem.id ? null : kalem.id
              )
            }
          >
            <Text style={styles.unitSelectText}>{kalem.unit}</Text>
            <ChevronDown size={14} color="#6b7280" />
          </TouchableOpacity>
          {activeBirimKalemId === kalem.id && (
            <View style={styles.birimDropdown}>
              <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                {birimler.map((b) => (
                  <TouchableOpacity
                    key={b.value}
                    style={styles.birimDropdownItem}
                    onPress={() => {
                      updateKalem(kalem.id, "unit", b.value);
                      setActiveBirimKalemId(null);
                    }}
                  >
                    <Text style={styles.birimDropdownText}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.kalemLabel}>B. Fiyat</Text>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencySmall}>₺</Text>
            <TextInput
              style={styles.priceInput}
              value={kalem.unit_price}
              onChangeText={(v) => updateKalem(kalem.id, "unit_price", v)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </View>

      <View style={styles.kalemRow}>
        <View style={styles.kdvBox}>
          <Text style={styles.kalemLabel}>KDV</Text>
          <TouchableOpacity
            style={styles.kdvSelectBtn}
            onPress={() =>
              setActiveKdvKalemId(
                activeKdvKalemId === kalem.id ? null : kalem.id
              )
            }
          >
            <Text style={styles.kdvSelectText}>%{kalem.kdv_rate}</Text>
            <ChevronDown size={14} color="#6b7280" />
          </TouchableOpacity>
          {activeKdvKalemId === kalem.id && (
            <View style={styles.kdvDropdown}>
              {kdvOranlari.map((k) => (
                <TouchableOpacity
                  key={k.value}
                  style={styles.kdvDropdownItem}
                  onPress={() => {
                    updateKalem(kalem.id, "kdv_rate", k.value);
                    setActiveKdvKalemId(null);
                  }}
                >
                  <Text style={styles.kdvDropdownText}>{k.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.kalemKategoriBox}>
          <Text style={styles.kalemLabel}>Kategori</Text>
          <Text style={styles.kalemKategoriText} numberOfLines={1}>
            {kalem.kategori_id
              ? kategoriler.find((k) => k.id === kalem.kategori_id)?.name || "-"
              : "-"}
          </Text>
        </View>
        <View style={styles.kalemTotalBox}>
          <Text style={styles.kalemLabel}>Toplam</Text>
          <Text style={styles.kalemTotalText}>
            {formatCurrency(calculateKalemTotal(kalem))}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header - Padding artırıldı */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Kalemli Fatura</Text>
            {cari && <Text style={styles.headerSubtitle}>{cari.name}</Text>}
          </View>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleSave}
            disabled={loading}
          >
            <Check size={24} color={loading ? "#9ca3af" : "#10b981"} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Fatura Tipi Seçici */}
          <View style={styles.faturaTipiContainer}>
            <TouchableOpacity
              style={[
                styles.faturaTipiBtn,
                faturaTipi === "alis" && styles.faturaTipiBtnActiveAlis,
              ]}
              onPress={() => setFaturaTipi("alis")}
            >
              <Text
                style={[
                  styles.faturaTipiBtnText,
                  faturaTipi === "alis" && styles.faturaTipiBtnTextActive,
                ]}
              >
                Alış Faturası
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
                İade Faturası
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tarih ve Açıklama */}
          <View style={styles.topFields}>
            <View style={styles.dateField}>
              <DatePickerField
                value={formDate}
                onChange={setFormDate}
                label="Tarih"
              />
            </View>
            <View style={styles.descField}>
              <Text style={styles.fieldLabel}>Fatura Açıklaması</Text>
              <TextInput
                style={styles.input}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Opsiyonel açıklama"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Kalemler */}
          <View style={styles.kalemlerSection}>
            <Text style={styles.sectionTitle}>Fatura Kalemleri</Text>

            {kalemler.map((kalem, index) => (
              <View key={kalem.id}>{renderKalem(kalem, index)}</View>
            ))}

            {/* Kalem Ekle - Kalemlerin altında */}
            <TouchableOpacity style={styles.addKalemBtn} onPress={addKalem}>
              <Plus size={18} color="#3b82f6" />
              <Text style={styles.addKalemBtnText}>Yeni Kalem Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Toplam */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Ara Toplam</Text>
              <Text style={styles.totalValue}>{formatCurrency(araToplam)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam KDV</Text>
              <Text style={styles.totalValue}>{formatCurrency(toplamKdv)}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Genel Toplam</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(genelToplam)}
              </Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Kaydet Butonu */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <FileText size={20} color="#fff" />
            <Text style={styles.saveBtnText}>
              {loading
                ? "Kaydediliyor..."
                : `Kaydet (${formatCurrency(genelToplam)})`}
            </Text>
          </TouchableOpacity>
        </View>

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
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => {
                  setShowUrunModal(false);
                  setShowAddUrunForm(false);
                  setUrunSearchText("");
                }}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.urunModalTitle}>Ürün Seç</Text>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setShowAddUrunForm(!showAddUrunForm)}
              >
                <Plus
                  size={24}
                  color={showAddUrunForm ? "#ef4444" : "#10b981"}
                />
              </TouchableOpacity>
            </View>

            {/* Ürün Ekleme Formu */}
            {showAddUrunForm && (
              <ScrollView style={styles.addUrunFormScroll} nestedScrollEnabled>
                <View style={styles.addUrunForm}>
                  <Text style={styles.addUrunTitle}>Yeni Ürün Ekle</Text>

                  <Text style={styles.addUrunLabel}>Ürün Adı *</Text>
                  <TextInput
                    style={styles.addUrunInput}
                    value={newUrunName}
                    onChangeText={setNewUrunName}
                    placeholder="Örn: Domates, Tavuk Göğsü"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.addUrunLabel}>Kategori</Text>
                  <TouchableOpacity
                    style={styles.addUrunDropdownBtn}
                    onPress={() => setShowNewUrunKategoriModal(true)}
                  >
                    <Text
                      style={[
                        styles.addUrunDropdownText,
                        !newUrunKategoriId && styles.placeholder,
                      ]}
                    >
                      {newUrunKategoriId
                        ? kategoriler.find((k) => k.id === newUrunKategoriId)
                            ?.name || "Kategori Seç"
                        : "Kategori Seç"}
                    </Text>
                    <ChevronDown size={18} color="#6b7280" />
                  </TouchableOpacity>

                  <Text style={styles.addUrunLabel}>Birim *</Text>
                  <TouchableOpacity
                    style={styles.addUrunDropdownBtn}
                    onPress={() => setShowNewUrunBirimModal(true)}
                  >
                    <Text style={styles.addUrunDropdownText}>
                      {birimler.find((b) => b.value === newUrunUnit)?.label ||
                        "Adet"}
                    </Text>
                    <ChevronDown size={18} color="#6b7280" />
                  </TouchableOpacity>

                  <View style={styles.addUrunRowTwo}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addUrunLabel}>Varsayılan Fiyat</Text>
                      <View style={styles.addUrunPriceInput}>
                        <Text style={styles.addUrunCurrency}>₺</Text>
                        <TextInput
                          style={styles.addUrunPriceTextInput}
                          value={newUrunPrice}
                          onChangeText={setNewUrunPrice}
                          placeholder="0.00"
                          placeholderTextColor="#9ca3af"
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.addUrunLabel}>KDV Oranı</Text>
                      <TouchableOpacity
                        style={styles.addUrunDropdownBtn}
                        onPress={() =>
                          setShowNewUrunKdvDropdown(!showNewUrunKdvDropdown)
                        }
                      >
                        <Text style={styles.addUrunDropdownText}>
                          %{newUrunKdvRate} KDV
                        </Text>
                        <ChevronDown size={18} color="#6b7280" />
                      </TouchableOpacity>
                      {showNewUrunKdvDropdown && (
                        <View style={styles.addUrunDropdownList}>
                          {kdvOranlari.map((kdv) => (
                            <TouchableOpacity
                              key={kdv.value}
                              style={styles.addUrunDropdownItem}
                              onPress={() => {
                                setNewUrunKdvRate(kdv.value);
                                setShowNewUrunKdvDropdown(false);
                              }}
                            >
                              <Text style={styles.addUrunDropdownItemText}>
                                {kdv.label} KDV
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.addUrunSaveBtn,
                      addingUrun && { opacity: 0.6 },
                    ]}
                    onPress={handleAddNewUrun}
                    disabled={addingUrun}
                  >
                    <Check size={18} color="#fff" />
                    <Text style={styles.addUrunSaveBtnText}>
                      {addingUrun ? "Ekleniyor..." : "Ürün Ekle"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {/* Arama */}
            <View style={styles.urunSearchContainer}>
              <Search size={20} color="#9ca3af" />
              <TextInput
                style={styles.urunSearchInput}
                value={urunSearchText}
                onChangeText={setUrunSearchText}
                placeholder="Ürün ara..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Kategoriye göre gruplanmış ürün listesi */}
            <SectionList
              sections={getGroupedUrunler()}
              keyExtractor={(item) => item.id}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <Tag size={14} color="#6b7280" />
                  <Text style={styles.sectionHeaderText}>{section.title}</Text>
                  <Text style={styles.sectionHeaderCount}>
                    ({section.data.length})
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.urunItem}
                  onPress={() => selectUrun(item)}
                >
                  <View style={styles.urunItemIcon}>
                    <Package size={20} color="#3b82f6" />
                  </View>
                  <View style={styles.urunItemInfo}>
                    <Text style={styles.urunItemName}>{item.name}</Text>
                    <Text style={styles.urunItemMeta}>
                      {item.unit}
                      {item.default_price
                        ? ` • ${formatCurrency(item.default_price)}`
                        : ""}
                      {item.kdv_rate !== undefined
                        ? ` • %${item.kdv_rate} KDV`
                        : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyUrun}>
                  <Text style={styles.emptyUrunText}>
                    {urunSearchText
                      ? "Ürün bulunamadı"
                      : "Henüz ürün tanımlı değil"}
                  </Text>
                  {!showAddUrunForm && (
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={() => setShowAddUrunForm(true)}
                    >
                      <Plus size={16} color="#10b981" />
                      <Text style={styles.emptyAddBtnText}>Ürün Ekle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
              stickySectionHeadersEnabled
            />

            {/* Ürün Kategorisi Seçme Modal - Ürün Modal içinde */}
            <Modal
              visible={showNewUrunKategoriModal}
              animationType="slide"
              presentationStyle="pageSheet"
            >
              <SafeAreaView
                style={styles.kategoriModalContainer}
                edges={["top", "left", "right"]}
              >
                <View style={styles.kategoriModalHeader}>
                  <Text style={styles.kategoriModalTitle}>Kategori Seç</Text>
                  <TouchableOpacity
                    style={styles.kategoriModalCloseBtn}
                    onPress={() => setShowNewUrunKategoriModal(false)}
                  >
                    <X size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.kategoriScrollView}
                  contentContainerStyle={styles.kategoriListContent}
                >
                  {/* Kategorisiz seçeneği */}
                  <TouchableOpacity
                    style={[
                      styles.kategoriModalItem,
                      newUrunKategoriId === null &&
                        styles.kategoriModalItemActive,
                    ]}
                    onPress={() => {
                      setNewUrunKategoriId(null);
                      setShowNewUrunKategoriModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.kategoriModalItemText,
                        newUrunKategoriId === null &&
                          styles.kategoriModalItemTextActive,
                      ]}
                    >
                      Kategorisiz
                    </Text>
                    {newUrunKategoriId === null && (
                      <Check size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>

                  <View style={styles.kategoriSeparator} />

                  {/* Tedarikçi alt kategorileri (ürün kategorileri) */}
                  {urunKategoriler.map((kategori) => (
                    <TouchableOpacity
                      key={kategori.id}
                      style={[
                        styles.kategoriModalItem,
                        newUrunKategoriId === kategori.id &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setNewUrunKategoriId(kategori.id);
                        setShowNewUrunKategoriModal(false);
                      }}
                    >
                      <View style={styles.kategoriItemContent}>
                        <Tag
                          size={18}
                          color={
                            newUrunKategoriId === kategori.id
                              ? "#10b981"
                              : "#6b7280"
                          }
                        />
                        <Text
                          style={[
                            styles.kategoriModalItemText,
                            newUrunKategoriId === kategori.id &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {kategori.name}
                        </Text>
                      </View>
                      {newUrunKategoriId === kategori.id && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}

                  {urunKategoriler.length === 0 && (
                    <View style={styles.emptyKategori}>
                      <Text style={styles.emptyKategoriText}>
                        Henüz ürün kategorisi tanımlı değil
                      </Text>
                      <Text style={styles.emptyKategoriSubtext}>
                        Kategoriler, Cari sayfasından eklenebilir
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </SafeAreaView>
            </Modal>

            {/* Birim Seçme Modal - Ürün Modal içinde */}
            <Modal
              visible={showNewUrunBirimModal}
              animationType="slide"
              presentationStyle="pageSheet"
            >
              <SafeAreaView
                style={styles.kategoriModalContainer}
                edges={["top", "left", "right"]}
              >
                <View style={styles.kategoriModalHeader}>
                  <Text style={styles.kategoriModalTitle}>Birim Seç</Text>
                  <TouchableOpacity
                    style={styles.kategoriModalCloseBtn}
                    onPress={() => setShowNewUrunBirimModal(false)}
                  >
                    <X size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.kategoriScrollView}
                  contentContainerStyle={styles.kategoriListContent}
                >
                  {birimler.map((birim) => (
                    <TouchableOpacity
                      key={birim.value}
                      style={[
                        styles.kategoriModalItem,
                        newUrunUnit === birim.value &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setNewUrunUnit(birim.value);
                        setShowNewUrunBirimModal(false);
                      }}
                    >
                      <View style={styles.kategoriItemContent}>
                        <Scale
                          size={18}
                          color={
                            newUrunUnit === birim.value ? "#10b981" : "#6b7280"
                          }
                        />
                        <Text
                          style={[
                            styles.kategoriModalItemText,
                            newUrunUnit === birim.value &&
                              styles.kategoriModalItemTextActive,
                          ]}
                        >
                          {birim.label}
                        </Text>
                      </View>
                      {newUrunUnit === birim.value && (
                        <Check size={20} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </SafeAreaView>
            </Modal>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
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
    paddingTop: 30,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBtn: { padding: 12 },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  content: { flex: 1, padding: 16 },

  // Fatura Tipi Seçici
  faturaTipiContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  faturaTipiBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  faturaTipiBtnActiveAlis: {
    backgroundColor: "#3b82f6",
  },
  faturaTipiBtnActiveIade: {
    backgroundColor: "#f59e0b",
  },
  faturaTipiBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  faturaTipiBtnTextActive: {
    color: "#fff",
  },

  topFields: { flexDirection: "row", gap: 12, marginBottom: 16 },
  dateField: { flex: 1 },
  descField: { flex: 1 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Kalemler Section
  kalemlerSection: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  // Kalem Ekle Butonu - Alta taşındı
  addKalemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
  },
  addKalemBtnText: { fontSize: 15, fontWeight: "600", color: "#3b82f6" },

  // Kalem Card
  kalemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kalemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kalemNo: { fontSize: 13, fontWeight: "700", color: "#6b7280" },
  removeKalemBtn: { padding: 4 },
  urunSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  urunSelectText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  placeholder: { color: "#9ca3af", fontWeight: "400" },
  kalemRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  qtyBox: { flex: 1 },
  unitBox: { flex: 1, position: "relative", zIndex: 20 },
  priceBox: { flex: 1.2 },
  kdvBox: { flex: 0.8, position: "relative", zIndex: 10 },
  kalemKategoriBox: { flex: 1.2 },
  kalemTotalBox: { flex: 1, alignItems: "flex-end" },
  kalemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  qtyInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  // Birim Select
  unitSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  unitSelectText: { fontSize: 14, color: "#111827" },
  birimDropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  birimDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  birimDropdownText: { fontSize: 14, color: "#374151" },

  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currencySmall: { fontSize: 14, color: "#6b7280", marginRight: 4 },
  priceInput: { flex: 1, paddingVertical: 8, fontSize: 14, color: "#111827" },
  kdvSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kdvSelectText: { fontSize: 14, color: "#111827" },
  kdvDropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  kdvDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kdvDropdownText: { fontSize: 14, color: "#374151" },
  kalemKategoriText: {
    fontSize: 13,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  kalemTotalText: { fontSize: 15, fontWeight: "700", color: "#111827" },

  // Total Section
  totalSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: { fontSize: 14, color: "#6b7280" },
  totalValue: { fontSize: 15, fontWeight: "600", color: "#374151" },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
    paddingTop: 20,
  },
  grandTotalLabel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  grandTotalValue: { fontSize: 20, fontWeight: "700", color: "#10b981" },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveBtnDisabled: { backgroundColor: "#9ca3af" },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  // Ürün Modal
  urunModalContainer: { flex: 1, backgroundColor: "#fff" },
  urunModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  urunModalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  urunSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  urunSearchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionHeaderCount: { fontSize: 12, color: "#6b7280" },
  urunItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  urunItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  urunItemInfo: { flex: 1 },
  urunItemName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  urunItemMeta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  emptyUrun: { alignItems: "center", paddingVertical: 40 },
  emptyUrunText: { fontSize: 14, color: "#9ca3af", marginBottom: 12 },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#dcfce7",
    borderRadius: 8,
  },
  emptyAddBtnText: { fontSize: 14, fontWeight: "600", color: "#10b981" },

  // Add Urun Form
  addUrunFormScroll: {
    maxHeight: 400,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  addUrunForm: { padding: 16, backgroundColor: "#f9fafb" },
  addUrunTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  addUrunLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  addUrunInput: {
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
  addUrunDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  addUrunDropdownText: { fontSize: 15, color: "#111827" },
  addUrunDropdownList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    maxHeight: 150,
  },
  addUrunDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  addUrunDropdownItemText: { fontSize: 15, color: "#374151" },
  addUrunRowTwo: { flexDirection: "row", marginBottom: 12 },
  addUrunPriceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addUrunCurrency: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 4,
  },
  addUrunPriceTextInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  addUrunSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  addUrunSaveBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  // Kategori Modal
  kategoriModalContainer: { flex: 1, backgroundColor: "#fff" },
  kategoriModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  kategoriModalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  kategoriModalCloseBtn: { padding: 4 },
  kategoriScrollView: { flex: 1 },
  kategoriListContent: { padding: 16 },
  kategoriModalItem: {
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
  kategoriModalItemActive: {
    backgroundColor: "#f0fdf4",
    borderColor: "#10b981",
  },
  kategoriModalItemText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  kategoriModalItemTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
  kategoriItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  kategoriSeparator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  emptyKategori: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyKategoriText: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 4,
  },
  emptyKategoriSubtext: {
    fontSize: 13,
    color: "#9ca3af",
  },
});
