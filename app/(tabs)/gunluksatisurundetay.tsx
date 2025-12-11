import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeft,
  Package,
  Edit3,
  Trash2,
  Calendar,
  TrendingUp,
  Hash,
  DollarSign,
  Eye,
  EyeOff,
  ChevronDown,
  AlertTriangle,
  Check,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { supabase } from "../../src/lib/supabase";
import { MenuItem, SatisKaydi } from "../../src/types";

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

export default function gunluksatisurundetayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    menuItems,
    fetchMenuItems,
    updateMenuItem,
    satisKayitlari,
    fetchSatisKayitlari,
    profile,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ürün bulma
  const urun = menuItems.find((m) => m.id === id);

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  // Satış tarihi düzenleme
  const [editingSatisId, setEditingSatisId] = useState<string | null>(null);
  const [editSatisDate, setEditSatisDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Satış düzenleme modal
  const [showEditSatisModal, setShowEditSatisModal] = useState(false);
  const [editingSatis, setEditingSatis] = useState<SatisKaydi | null>(null);
  const [editSatisAdet, setEditSatisAdet] = useState("");
  const [editSatisFiyat, setEditSatisFiyat] = useState("");

  useEffect(() => {
    if (urun) {
      setEditName(urun.name);
      setEditPrice(urun.price?.toString() || "");
      setEditUnit(urun.unit || "Adet");
    }
  }, [urun]);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateHeader = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDateKey = (dateStr: string) => dateStr.split("T")[0];

  // Bu ürüne ait satışlar
  const urunSatislari = useMemo(() => {
    return satisKayitlari
      .filter((s) => s.menu_item_id === id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [satisKayitlari, id]);

  // İstatistikler
  const stats = useMemo(() => {
    const toplamAdet = urunSatislari.reduce((sum, s) => sum + s.quantity, 0);
    const toplamCiro = urunSatislari.reduce((sum, s) => sum + s.total_price, 0);
    return { toplamAdet, toplamCiro };
  }, [urunSatislari]);

  // Ad değiştirme (uyarı ile)
  const handleNameChange = () => {
    if (!editName.trim()) {
      Alert.alert("Hata", "Ürün adı boş olamaz");
      return;
    }

    if (editName.trim() === urun?.name) {
      return; // Değişiklik yok
    }

    Alert.alert(
      "Ürün Adı Değişikliği",
      `"${
        urun?.name
      }" adını "${editName.trim()}" olarak değiştirmek istediğinize emin misiniz?\n\nBu değişiklik tüm geçmiş kayıtlarda da görünecektir.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Değiştir",
          onPress: async () => {
            setLoading(true);
            const { error } = await updateMenuItem(id!, {
              name: editName.trim(),
            });
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Ürün adı güncellenemedi");
            } else {
              Alert.alert("Başarılı", "Ürün adı güncellendi");
            }
          },
        },
      ]
    );
  };

  // Fiyat değiştirme
  const handlePriceChange = async () => {
    const price = parseFloat(editPrice.replace(",", "."));
    if (isNaN(price) || price < 0) {
      Alert.alert("Hata", "Geçerli bir fiyat girin");
      return;
    }

    if (price === urun?.price) return;

    setLoading(true);
    const { error } = await updateMenuItem(id!, { price });
    setLoading(false);
    if (error) {
      Alert.alert("Hata", "Fiyat güncellenemedi");
    } else {
      Alert.alert("Başarılı", "Fiyat güncellendi. Eski satışlar etkilenmedi.");
    }
  };

  // Birim değiştirme
  const handleUnitChange = async (newUnit: string) => {
    setEditUnit(newUnit);
    setShowUnitPicker(false);

    if (newUnit === urun?.unit) return;

    setLoading(true);
    const { error } = await updateMenuItem(id!, { unit: newUnit });
    setLoading(false);
    if (error) {
      Alert.alert("Hata", "Birim güncellenemedi");
    }
  };

  // Faturada gösterme toggle
  const handleToggleInvoice = async () => {
    const newValue = !urun?.include_in_invoice;
    setLoading(true);
    const { error } = await updateMenuItem(id!, {
      include_in_invoice: newValue,
    });
    setLoading(false);
    if (error) {
      console.error("Toggle invoice error:", error);
      Alert.alert(
        "Hata",
        "Ayar güncellenemedi: " + (error.message || JSON.stringify(error))
      );
    }
  };

  // Satış tarihi düzenleme
  const handleEditSatisDate = (satis: SatisKaydi) => {
    setEditingSatisId(satis.id);
    setEditSatisDate(new Date(satis.date));
    setShowDatePicker(true);
  };

  const saveSatisDate = async () => {
    if (!editingSatisId) return;

    setLoading(true);
    const { error } = await supabase
      .from("satis_kayitlari")
      .update({ date: editSatisDate.toISOString().split("T")[0] })
      .eq("id", editingSatisId);

    setLoading(false);
    setShowDatePicker(false);
    setEditingSatisId(null);

    if (error) {
      Alert.alert("Hata", "Tarih güncellenemedi");
    } else {
      fetchSatisKayitlari();
    }
  };

  // Satış düzenleme modal'ı aç
  const handleEditSatis = (satis: SatisKaydi) => {
    setEditingSatis(satis);
    setEditSatisAdet(satis.quantity.toString());
    setEditSatisFiyat(satis.unit_price.toString());
    setEditSatisDate(new Date(satis.date));
    setShowEditSatisModal(true);
  };

  // Satış düzenlemeyi kaydet
  const saveEditSatis = async () => {
    if (!editingSatis) return;

    const adet = parseFloat(editSatisAdet.replace(",", "."));
    const fiyat = parseFloat(editSatisFiyat.replace(",", "."));

    if (isNaN(adet) || adet <= 0) {
      Alert.alert("Hata", "Geçerli bir adet girin");
      return;
    }

    if (isNaN(fiyat) || fiyat < 0) {
      Alert.alert("Hata", "Geçerli bir fiyat girin");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("satis_kayitlari")
      .update({
        quantity: adet,
        unit_price: fiyat,
        date: editSatisDate.toISOString().split("T")[0],
      })
      .eq("id", editingSatis.id);

    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Satış güncellenemedi");
    } else {
      setShowEditSatisModal(false);
      setEditingSatis(null);
      fetchSatisKayitlari();
      Alert.alert("Başarılı", "Satış güncellendi");
    }
  };

  // Satış sil
  const handleDeleteSatis = (satis: SatisKaydi) => {
    Alert.alert(
      "Satış Kaydını Sil",
      `${satis.quantity} adet satışı silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("satis_kayitlari")
              .delete()
              .eq("id", satis.id);
            if (!error) {
              fetchSatisKayitlari();
            }
          },
        },
      ]
    );
  };

  if (!urun) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/gunluksatis")}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürün Bulunamadı</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/gunluksatis")}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {urun.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Özet Kartı */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconBox}>
            <Package size={32} color="#8b5cf6" />
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Hash size={16} color="#6b7280" />
              <Text style={styles.statValue}>{stats.toplamAdet}</Text>
              <Text style={styles.statLabel}>Toplam Satış</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#6b7280" />
              <Text style={styles.statValue}>
                {formatCurrency(stats.toplamCiro)}
              </Text>
              <Text style={styles.statLabel}>Toplam Ciro</Text>
            </View>
          </View>
        </View>

        {/* Ürün Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>

          {/* Ad */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Ürün Adı</Text>
            <View style={styles.fieldInputRow}>
              <TextInput
                style={styles.fieldInput}
                value={editName}
                onChangeText={setEditName}
                onBlur={handleNameChange}
                placeholder="Ürün adı"
              />
              {editName !== urun.name && (
                <TouchableOpacity
                  style={styles.saveFieldBtn}
                  onPress={handleNameChange}
                >
                  <Check size={18} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Fiyat */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Satış Fiyatı (KDV Dahil)</Text>
            <View style={styles.fieldInputRow}>
              <View style={styles.priceInputBox}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  style={styles.priceInput}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  onBlur={handlePriceChange}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              {editPrice !== urun.price?.toString() && (
                <TouchableOpacity
                  style={styles.saveFieldBtn}
                  onPress={handlePriceChange}
                >
                  <Check size={18} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.fieldHint}>
              Fiyat değişikliği eski satışları etkilemez
            </Text>
          </View>

          {/* Birim */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Birim</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowUnitPicker(true)}
            >
              <Text style={styles.pickerBtnText}>{editUnit || "Seçin"}</Text>
              <ChevronDown size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Kategori */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kategori</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{urun.category}</Text>
            </View>
          </View>

          {/* Faturada Göster */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={handleToggleInvoice}
          >
            <View style={styles.toggleLeft}>
              {urun.include_in_invoice !== false ? (
                <Eye size={20} color="#10b981" />
              ) : (
                <EyeOff size={20} color="#9ca3af" />
              )}
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Satış Faturasında Göster</Text>
                <Text style={styles.toggleHint}>
                  {urun.include_in_invoice !== false
                    ? "Kalemli satış ekranında görünür"
                    : "Kalemli satış ekranında gizli"}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                urun.include_in_invoice !== false && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  urun.include_in_invoice !== false && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Satış Geçmişi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Satış Geçmişi ({urunSatislari.length})
          </Text>

          {urunSatislari.length > 0 ? (
            urunSatislari.map((satis, index) => {
              const prevSatis = index > 0 ? urunSatislari[index - 1] : null;
              const showDateHeader =
                !prevSatis ||
                getDateKey(prevSatis.date) !== getDateKey(satis.date);

              return (
                <View key={satis.id}>
                  {showDateHeader && (
                    <View style={styles.dateSeparator}>
                      <View style={styles.dateSeparatorLine} />
                      <Text style={styles.dateSeparatorText}>
                        {formatDateHeader(satis.date)}
                      </Text>
                      <View style={styles.dateSeparatorLine} />
                    </View>
                  )}

                  <View style={styles.satisItem}>
                    <View style={styles.satisLeft}>
                      <View style={styles.satisIconBox}>
                        <Package size={16} color="#8b5cf6" />
                      </View>
                      <View style={styles.satisInfo}>
                        <Text style={styles.satisAdet}>
                          {satis.quantity} {editUnit || "adet"}
                        </Text>
                        <Text style={styles.satisFiyat}>
                          Birim: {formatCurrency(satis.unit_price)}
                        </Text>
                        {satis.notes && (
                          <Text style={styles.satisNotes}>{satis.notes}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.satisRight}>
                      <Text style={styles.satisToplam}>
                        {formatCurrency(satis.total_price)}
                      </Text>
                      <View style={styles.satisActions}>
                        <TouchableOpacity
                          style={styles.satisActionBtn}
                          onPress={() => handleEditSatis(satis)}
                        >
                          <Edit3 size={16} color="#8b5cf6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.satisActionBtn}
                          onPress={() => handleEditSatisDate(satis)}
                        >
                          <Calendar size={16} color="#3b82f6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.satisActionBtn}
                          onPress={() => handleDeleteSatis(satis)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz satış kaydı yok</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

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
                    editUnit === birim && styles.pickerItemSelected,
                  ]}
                  onPress={() => handleUnitChange(birim)}
                >
                  <Text style={styles.pickerItemText}>{birim}</Text>
                  {editUnit === birim && <Check size={20} color="#8b5cf6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
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
                value={editSatisDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  if (date) setEditSatisDate(date);
                }}
                locale="tr-TR"
              />
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerCancelBtn}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePickerSaveBtn}
                  onPress={saveSatisDate}
                >
                  <Text style={styles.datePickerSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Satış Düzenleme Modal */}
      <Modal visible={showEditSatisModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEditSatisModal(false)}
        >
          <View style={styles.editSatisModal}>
            <Text style={styles.pickerTitle}>Satışı Düzenle</Text>

            <View style={styles.editSatisRow}>
              <Text style={styles.editSatisLabel}>Adet</Text>
              <TextInput
                style={styles.editSatisInput}
                value={editSatisAdet}
                onChangeText={setEditSatisAdet}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editSatisRow}>
              <Text style={styles.editSatisLabel}>Birim Fiyat (₺)</Text>
              <TextInput
                style={styles.editSatisInput}
                value={editSatisFiyat}
                onChangeText={setEditSatisFiyat}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.editSatisRow}>
              <Text style={styles.editSatisLabel}>Tarih</Text>
              <TouchableOpacity
                style={styles.editSatisDateBtn}
                onPress={() => {
                  setShowEditSatisModal(false);
                  setTimeout(() => {
                    setEditingSatisId(editingSatis?.id || null);
                    setShowDatePicker(true);
                  }, 300);
                }}
              >
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.editSatisDateText}>
                  {editSatisDate.toLocaleDateString("tr-TR")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editSatisToplam}>
              <Text style={styles.editSatisToplamLabel}>Toplam:</Text>
              <Text style={styles.editSatisToplamValue}>
                {formatCurrency(
                  (parseFloat(editSatisAdet.replace(",", ".")) || 0) *
                    (parseFloat(editSatisFiyat.replace(",", ".")) || 0)
                )}
              </Text>
            </View>

            <View style={styles.editSatisActions}>
              <TouchableOpacity
                style={styles.editSatisCancelBtn}
                onPress={() => setShowEditSatisModal(false)}
              >
                <Text style={styles.editSatisCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editSatisSaveBtn, loading && { opacity: 0.6 }]}
                onPress={saveEditSatis}
                disabled={loading}
              >
                <Text style={styles.editSatisSaveText}>
                  {loading ? "..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  summaryStats: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 12,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  fieldInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  saveFieldBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },
  priceInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currencySymbol: {
    fontSize: 16,
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
  fieldHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  pickerBtn: {
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
  pickerBtnText: {
    fontSize: 15,
    color: "#111827",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8b5cf6",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  toggleHint: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#10b981",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleKnobActive: {
    marginLeft: "auto",
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  satisItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  satisLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  satisIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  satisInfo: {
    marginLeft: 12,
    flex: 1,
  },
  satisAdet: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  satisFiyat: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  satisNotes: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
    fontStyle: "italic",
  },
  satisRight: {
    alignItems: "flex-end",
  },
  satisToplam: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  satisActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  satisActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "60%",
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
  datePickerModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 16,
  },
  datePickerActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  datePickerCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  datePickerCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  datePickerSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
  },
  datePickerSaveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  // Satış Düzenleme Modal
  editSatisModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    padding: 20,
  },
  editSatisRow: {
    marginBottom: 16,
  },
  editSatisLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  editSatisInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  editSatisDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
  },
  editSatisDateText: {
    fontSize: 15,
    color: "#111827",
  },
  editSatisToplam: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  editSatisToplamLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  editSatisToplamValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  editSatisActions: {
    flexDirection: "row",
    gap: 12,
  },
  editSatisCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  editSatisCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  editSatisSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
  },
  editSatisSaveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
