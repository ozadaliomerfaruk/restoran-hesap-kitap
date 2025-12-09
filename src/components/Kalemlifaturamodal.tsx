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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Plus,
  Trash2,
  Package,
  ChevronDown,
  Calculator,
  FileText,
  Check,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Cari, Urun, Kategori, IslemKalemi } from "../types";
import { supabase } from "../lib/supabase";

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
    fetchKasalar,
  } = useStore();

  const [kalemler, setKalemler] = useState<Kalem[]>([]);
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDescription, setFormDescription] = useState("");
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
  const [addingUrun, setAddingUrun] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUrunler();
      fetchKategoriler();
      // Varsayılan bir boş kalem ekle
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
  };

  // Yeni ürün ekleme
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
      is_active: true,
    });
    setAddingUrun(false);

    if (error) {
      Alert.alert("Hata", "Ürün eklenirken bir hata oluştu");
    } else {
      // Formu sıfırla
      setNewUrunName("");
      setNewUrunUnit("adet");
      setNewUrunPrice("");
      setShowAddUrunForm(false);
      // Ürünleri yenile
      await fetchUrunler();
    }
  };

  // Hesaplamalar
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
    // Validasyon
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

      // 1. Ana işlemi oluştur
      const { data: islem, error: islemError } = await supabase
        .from("islemler")
        .insert({
          type: "gider",
          amount: genelToplam,
          description: formDescription.trim() || `${cari?.name} - Kalemli Alış`,
          date: formDate,
          cari_id: cari?.id,
          restaurant_id: profile?.restaurant_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (islemError) throw islemError;

      // 2. İşlem kalemlerini oluştur
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

      // 3. Cari bakiyesini güncelle (borç artıyor)
      if (cari) {
        await supabase.rpc("update_cari_balance", {
          cari_id: cari.id,
          amount: genelToplam,
        });
      }

      Alert.alert("Başarılı", "Kalemli alış kaydedildi");

      // State'leri sıfırla
      setKalemler([]);
      setFormDescription("");
      setFormDate(new Date().toISOString().split("T")[0]);

      // Verileri yenile
      fetchCariler();
      fetchIslemler();

      onClose();
    } catch (error) {
      console.error("Kalemli alış hatası:", error);
      Alert.alert("Hata", "Kalemli alış kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setKalemler([]);
    setFormDescription("");
    onClose();
  };

  // Gider kategorileri
  const giderKategoriler = kategoriler.filter((k) => k.type === "gider");

  // Ürün araması
  const filteredUrunler = urunler.filter(
    (u) =>
      u.is_active && u.name.toLowerCase().includes(urunSearchText.toLowerCase())
  );

  const renderKalem = (kalem: Kalem, index: number) => (
    <View key={kalem.id} style={styles.kalemCard}>
      <View style={styles.kalemHeader}>
        <Text style={styles.kalemNumber}>Kalem {index + 1}</Text>
        <TouchableOpacity onPress={() => removeKalem(kalem.id)}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Ürün Seçimi */}
      <TouchableOpacity
        style={styles.urunSelectBtn}
        onPress={() => openUrunModal(kalem.id)}
      >
        <Package size={18} color="#6b7280" />
        <Text
          style={[
            styles.urunSelectText,
            !kalem.urun_adi && styles.urunSelectPlaceholder,
          ]}
        >
          {kalem.urun_adi || "Ürün seç veya yaz..."}
        </Text>
        <ChevronDown size={18} color="#6b7280" />
      </TouchableOpacity>

      {/* Manuel Ürün Adı */}
      {!kalem.urun_id ? (
        <TextInput
          style={styles.input}
          value={kalem.urun_adi}
          onChangeText={(text) => updateKalem(kalem.id, "urun_adi", text)}
          placeholder="veya manuel ürün adı girin"
          placeholderTextColor="#9ca3af"
        />
      ) : null}

      {/* Miktar ve Birim */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.fieldLabel}>Miktar</Text>
          <TextInput
            style={styles.input}
            value={kalem.quantity}
            onChangeText={(text) => updateKalem(kalem.id, "quantity", text)}
            keyboardType="decimal-pad"
            placeholder="1"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.fieldLabel}>Birim</Text>
          <TextInput
            style={styles.input}
            value={kalem.unit}
            onChangeText={(text) => updateKalem(kalem.id, "unit", text)}
            placeholder="adet"
          />
        </View>
      </View>

      {/* Fiyat ve KDV */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.fieldLabel}>Birim Fiyat (₺)</Text>
          <TextInput
            style={styles.input}
            value={kalem.unit_price}
            onChangeText={(text) => updateKalem(kalem.id, "unit_price", text)}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.fieldLabel}>KDV</Text>
          <View style={styles.kdvRow}>
            {kdvOranlari.slice(0, 3).map((kdv) => (
              <TouchableOpacity
                key={kdv.value}
                style={[
                  styles.kdvBtn,
                  kalem.kdv_rate === kdv.value && styles.kdvBtnActive,
                ]}
                onPress={() => updateKalem(kalem.id, "kdv_rate", kdv.value)}
              >
                <Text
                  style={[
                    styles.kdvBtnText,
                    kalem.kdv_rate === kdv.value && styles.kdvBtnTextActive,
                  ]}
                >
                  {kdv.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.kdvRow}>
            {kdvOranlari.slice(3).map((kdv) => (
              <TouchableOpacity
                key={kdv.value}
                style={[
                  styles.kdvBtn,
                  kalem.kdv_rate === kdv.value && styles.kdvBtnActive,
                ]}
                onPress={() => updateKalem(kalem.id, "kdv_rate", kdv.value)}
              >
                <Text
                  style={[
                    styles.kdvBtnText,
                    kalem.kdv_rate === kdv.value && styles.kdvBtnTextActive,
                  ]}
                >
                  {kdv.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Kalem Toplam */}
      <View style={styles.kalemTotalRow}>
        <Text style={styles.kalemTotalLabel}>Kalem Toplam:</Text>
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
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Kalemli Alış</Text>
            {cari ? (
              <Text style={styles.headerSubtitle}>{cari.name}</Text>
            ) : null}
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
          {/* Tarih ve Açıklama */}
          <View style={styles.topFields}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>Tarih</Text>
              <View style={styles.dateInput}>
                <TextInput
                  style={styles.dateTextInput}
                  value={formDate}
                  onChangeText={setFormDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
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
            <View style={styles.kalemlerHeader}>
              <Text style={styles.sectionTitle}>Fatura Kalemleri</Text>
              <TouchableOpacity style={styles.addKalemBtn} onPress={addKalem}>
                <Plus size={16} color="#fff" />
                <Text style={styles.addKalemBtnText}>Kalem Ekle</Text>
              </TouchableOpacity>
            </View>

            {kalemler.map((kalem, index) => renderKalem(kalem, index))}
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
              <View style={styles.addUrunForm}>
                <Text style={styles.addUrunTitle}>Yeni Ürün Ekle</Text>
                <TextInput
                  style={styles.addUrunInput}
                  value={newUrunName}
                  onChangeText={setNewUrunName}
                  placeholder="Ürün adı *"
                  placeholderTextColor="#9ca3af"
                />
                <View style={styles.addUrunRow}>
                  <TextInput
                    style={[styles.addUrunInput, { flex: 1 }]}
                    value={newUrunUnit}
                    onChangeText={setNewUrunUnit}
                    placeholder="Birim"
                    placeholderTextColor="#9ca3af"
                  />
                  <TextInput
                    style={[styles.addUrunInput, { flex: 1 }]}
                    value={newUrunPrice}
                    onChangeText={setNewUrunPrice}
                    placeholder="Fiyat (₺)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.addUrunBtn, addingUrun && { opacity: 0.6 }]}
                  onPress={handleAddNewUrun}
                  disabled={addingUrun}
                >
                  <Check size={18} color="#fff" />
                  <Text style={styles.addUrunBtnText}>
                    {addingUrun ? "Ekleniyor..." : "Ürün Ekle"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.urunSearchContainer}>
              <TextInput
                style={styles.urunSearchInput}
                value={urunSearchText}
                onChangeText={setUrunSearchText}
                placeholder="Ürün ara..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <FlatList
              data={filteredUrunler}
              keyExtractor={(item) => item.id}
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
                      {item.unit}{" "}
                      {item.default_price
                        ? `• ${formatCurrency(item.default_price)}`
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
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginTop: 10,
  },
  headerBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topFields: {
    gap: 12,
    marginBottom: 20,
  },
  dateField: {},
  descField: {},
  fieldLabel: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  dateTextInput: {
    fontSize: 19,
    color: "#111827",
    paddingVertical: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 19,
    color: "#111827",
  },
  kalemlerSection: {
    marginBottom: 20,
  },
  kalemlerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  addKalemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addKalemBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
  },
  kalemCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  kalemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kalemNumber: {
    fontSize: 19,
    fontWeight: "600",
    color: "#6b7280",
  },
  urunSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    gap: 10,
  },
  urunSelectText: {
    flex: 1,
    fontSize: 19,
    color: "#111827",
  },
  urunSelectPlaceholder: {
    color: "#9ca3af",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  flex1: {
    flex: 1,
  },
  kdvRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  kdvBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  kdvBtnActive: {
    backgroundColor: "#3b82f6",
  },
  kdvBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#6b7280",
  },
  kdvBtnTextActive: {
    color: "#fff",
  },
  kalemTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  kalemTotalLabel: {
    fontSize: 19,
    color: "#6b7280",
  },
  kalemTotalValue: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  totalSection: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 19,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 19,
    fontWeight: "500",
    color: "#111827",
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 0,
  },
  grandTotalLabel: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10b981",
  },
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
    gap: 10,
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
  },
  // Ürün Modal
  urunModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  urunModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginTop: 10,
  },
  urunModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  urunSearchContainer: {
    padding: 16,
  },
  urunSearchInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 19,
    color: "#111827",
  },
  urunItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  urunItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  urunItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  urunItemName: {
    fontSize: 19,
    fontWeight: "500",
    color: "#111827",
  },
  urunItemMeta: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  emptyUrun: {
    padding: 40,
    alignItems: "center",
  },
  emptyUrunText: {
    fontSize: 19,
    color: "#9ca3af",
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
  },
  emptyAddBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#10b981",
  },
  addUrunForm: {
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  addUrunTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  addUrunInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 19,
    color: "#111827",
  },
  addUrunRow: {
    flexDirection: "row",
    gap: 10,
  },
  addUrunBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  addUrunBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
  },
});
