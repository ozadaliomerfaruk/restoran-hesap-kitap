import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Camera,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Personel, PersonelIslem } from "../types";
import { supabase } from "../lib/supabase";

interface PersonelDetayModalProps {
  visible: boolean;
  onClose: () => void;
  personel: Personel | null;
}

type IslemTab = "gider" | "odeme" | "tahsilat";

const giderKategorileri = [
  { value: "maas", label: "Maaş" },
  { value: "mesai", label: "Mesai" },
  { value: "prim", label: "Prim" },
  { value: "tazminat", label: "Tazminat" },
  { value: "komisyon", label: "Komisyon" },
  { value: "diger", label: "Diğer" },
];

export default function PersonelDetayModal({
  visible,
  onClose,
  personel: initialPersonel,
}: PersonelDetayModalProps) {
  const {
    personelIslemler,
    fetchPersonelIslemler,
    kasalar,
    fetchKasalar,
    addPersonelIslem,
    fetchPersoneller,
    personeller,
  } = useStore();

  const [activeTab, setActiveTab] = useState<IslemTab>("gider");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("maas");
  const [selectedKasa, setSelectedKasa] = useState("");
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [showKasaPicker, setShowKasaPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIslem, setEditingIslem] = useState<PersonelIslem | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const currentPersonel =
    personeller.find((p) => p.id === initialPersonel?.id) || initialPersonel;

  const personelIslemleri = personelIslemler
    .filter((i) => i.personel_id === currentPersonel?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (visible && initialPersonel) {
      fetchPersonelIslemler();
      fetchKasalar();
      fetchPersoneller();
      resetForm();
    }
  }, [visible, initialPersonel]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setAmount("");
    setDescription("");
    setSelectedKategori("maas");
    setSelectedKasa("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getBalanceInfo = () => {
    if (!currentPersonel)
      return { amount: 0, text: "Borç yok", color: "#6b7280" };
    const balance = currentPersonel.balance || 0;
    if (balance > 0) {
      return {
        amount: balance,
        text: `Borcumuz: ${formatCurrency(balance)}`,
        color: "#ef4444",
      };
    } else if (balance < 0) {
      return {
        amount: Math.abs(balance),
        text: `Personel borcu: ${formatCurrency(Math.abs(balance))}`,
        color: "#10b981",
      };
    }
    return { amount: 0, text: "Borç yok", color: "#6b7280" };
  };

  const handleSubmit = async () => {
    if (!currentPersonel) return;
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }
    if ((activeTab === "odeme" || activeTab === "tahsilat") && !selectedKasa) {
      Alert.alert("Hata", "Lütfen bir hesap seçin");
      return;
    }

    setLoading(true);
    let islemType: string;
    let desc = description.trim();

    if (activeTab === "gider") {
      islemType = selectedKategori;
      const kategoriLabel =
        giderKategorileri.find((k) => k.value === selectedKategori)?.label ||
        "Gider";
      if (!desc) desc = kategoriLabel;
    } else if (activeTab === "odeme") {
      islemType = "odeme";
      if (!desc) desc = "Personel ödemesi";
    } else {
      islemType = "kesinti";
      if (!desc) desc = "Personelden tahsilat";
    }

    const { error } = await addPersonelIslem({
      personel_id: currentPersonel.id,
      type: islemType as any,
      amount: parseFloat(amount),
      description: desc,
      date,
      kasa_id:
        activeTab === "odeme" || activeTab === "tahsilat"
          ? selectedKasa
          : undefined,
      restaurant_id: "",
      updated_at: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
    } else {
      Alert.alert("Başarılı", "İşlem kaydedildi");
      resetForm();
      fetchPersonelIslemler();
      fetchPersoneller();
    }
  };

  const handleEditPress = (islem: PersonelIslem) => {
    setEditingIslem(islem);
    setEditAmount(islem.amount.toString());
    setEditDescription(islem.description || "");
    setShowEditModal(true);
  };

  const handleUpdateIslem = async () => {
    if (!editingIslem) return;
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    const amountDiff = parseFloat(editAmount) - editingIslem.amount;
    setLoading(true);

    const { error } = await supabase
      .from("personel_islemler")
      .update({
        amount: parseFloat(editAmount),
        description: editDescription.trim() || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingIslem.id);

    if (!error && amountDiff !== 0 && currentPersonel) {
      const isGider = [
        "maas",
        "prim",
        "mesai",
        "tazminat",
        "komisyon",
        "diger",
      ].includes(editingIslem.type);
      const balanceChange = isGider ? amountDiff : -amountDiff;
      await supabase.rpc("update_personel_balance", {
        personel_id: currentPersonel.id,
        amount: balanceChange,
      });
    }

    setLoading(false);
    if (error) {
      Alert.alert("Hata", "İşlem güncellenirken bir hata oluştu");
    } else {
      setShowEditModal(false);
      setEditingIslem(null);
      fetchPersonelIslemler();
      fetchPersoneller();
    }
  };

  const handleDeleteIslem = async (islem: PersonelIslem) => {
    Alert.alert(
      "İşlemi Sil",
      `${formatCurrency(
        islem.amount
      )} tutarındaki işlemi silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            if (currentPersonel) {
              const isGider = [
                "maas",
                "prim",
                "mesai",
                "tazminat",
                "komisyon",
                "diger",
              ].includes(islem.type);
              const balanceChange = isGider ? -islem.amount : islem.amount;
              await supabase.rpc("update_personel_balance", {
                personel_id: currentPersonel.id,
                amount: balanceChange,
              });

              if (islem.kasa_id) {
                if (islem.type === "odeme") {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount: islem.amount,
                  });
                } else if (islem.type === "kesinti") {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount: -islem.amount,
                  });
                }
              }
            }

            const { error } = await supabase
              .from("personel_islemler")
              .delete()
              .eq("id", islem.id);

            setLoading(false);
            if (error) {
              Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
            } else {
              fetchPersonelIslemler();
              fetchPersoneller();
              fetchKasalar();
            }
          },
        },
      ]
    );
  };

  const getIslemTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      maas: "MAAŞ",
      mesai: "MESAİ",
      prim: "PRİM",
      tazminat: "TAZMİNAT",
      komisyon: "KOMİSYON",
      diger: "DİĞER",
      odeme: "ÖDEME",
      avans: "AVANS",
      kesinti: "TAHSİLAT",
    };
    return labels[type] || type.toUpperCase();
  };

  const getIslemColor = (type: string) => {
    if (
      ["maas", "mesai", "prim", "tazminat", "komisyon", "diger"].includes(type)
    )
      return "#ef4444";
    if (type === "odeme") return "#111827";
    return "#10b981";
  };

  const renderIslemItem = (item: PersonelIslem) => {
    const isGider = [
      "maas",
      "mesai",
      "prim",
      "tazminat",
      "komisyon",
      "diger",
    ].includes(item.type);
    return (
      <View key={item.id} style={styles.islemItem}>
        <View style={styles.islemLeft}>
          <Text style={[styles.islemType, { color: getIslemColor(item.type) }]}>
            {getIslemTypeLabel(item.type)}
          </Text>
          <Text style={styles.islemDate}>{formatDate(item.date)}</Text>
          {item.description && (
            <Text style={styles.islemDesc} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          {item.kasa && (
            <Text style={styles.islemKasa}>← {item.kasa.name}</Text>
          )}
        </View>
        <View style={styles.islemRight}>
          <Text
            style={[styles.islemAmount, { color: getIslemColor(item.type) }]}
          >
            {isGider ? "-" : "+"}
            {formatCurrency(item.amount)}
          </Text>
          <View style={styles.islemActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleEditPress(item)}
            >
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeleteIslem(item)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!currentPersonel) return null;

  const balanceInfo = getBalanceInfo();
  const nakitBankaKasalar = kasalar.filter(
    (k) => k.type === "nakit" || k.type === "banka"
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentPersonel.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View
            style={[styles.balanceCard, { borderLeftColor: balanceInfo.color }]}
          >
            <Text style={styles.balanceLabel}>Bakiye Durumu</Text>
            <Text style={[styles.balanceAmount, { color: balanceInfo.color }]}>
              {formatCurrency(balanceInfo.amount)}
            </Text>
            <Text style={[styles.balanceStatus, { color: balanceInfo.color }]}>
              {balanceInfo.text}
            </Text>
          </View>

          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>
              Geçmiş İşlemler ({personelIslemleri.length})
            </Text>
            {personelIslemleri.length > 0 ? (
              personelIslemleri.map(renderIslemItem)
            ) : (
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.formContainer}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Tarih:</Text>
            <TextInput
              style={styles.dateInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
            <Calendar size={20} color="#6b7280" />
          </View>

          {(activeTab === "odeme" || activeTab === "tahsilat") && (
            <TouchableOpacity
              style={styles.selectRow}
              onPress={() => setShowKasaPicker(true)}
            >
              <Text style={styles.selectLabel}>
                {activeTab === "odeme" ? "Kaynak hesap → " : "Hedef hesap → "}
              </Text>
              <Text style={styles.selectValue}>
                {kasalar.find((k) => k.id === selectedKasa)?.name ||
                  "Hesap seçin"}
              </Text>
            </TouchableOpacity>
          )}

          {activeTab === "gider" && (
            <TouchableOpacity
              style={styles.selectRow}
              onPress={() => setShowKategoriPicker(true)}
            >
              <Text style={styles.selectLabel}>Kategori: </Text>
              <Text style={styles.selectValue}>
                {giderKategorileri.find((k) => k.value === selectedKategori)
                  ?.label || "Seçin"}
              </Text>
              <ChevronDown size={18} color="#6b7280" />
            </TouchableOpacity>
          )}

          <View style={styles.descRow}>
            <TextInput
              style={styles.descInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Açıklama"
              placeholderTextColor="#9ca3af"
            />
            <Camera size={22} color="#9ca3af" />
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountBox}>
              <Text style={styles.currencySign}>₺</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Plus size={18} color="#fff" />
              <Text style={styles.saveBtnText}>KAYDET</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "gider" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("gider")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "gider" && styles.tabTextActive,
                ]}
              >
                PERSONEL{"\n"}GİDERİ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "odeme" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("odeme")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "odeme" && styles.tabTextActive,
                ]}
              >
                ÖDEME
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "tahsilat" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("tahsilat")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "tahsilat" && styles.tabTextActive,
                ]}
              >
                TAHSİLAT
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showKategoriPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowKategoriPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Kategori Seç</Text>
              {giderKategorileri.map((kat) => (
                <TouchableOpacity
                  key={kat.value}
                  style={[
                    styles.pickerItem,
                    selectedKategori === kat.value && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setSelectedKategori(kat.value);
                    setShowKategoriPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{kat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showKasaPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowKasaPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Hesap Seç</Text>
              {nakitBankaKasalar.map((kasa) => (
                <TouchableOpacity
                  key={kasa.id}
                  style={[
                    styles.pickerItem,
                    selectedKasa === kasa.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setSelectedKasa(kasa.id);
                    setShowKasaPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{kasa.name}</Text>
                  <Text style={styles.pickerItemSub}>
                    {formatCurrency(kasa.balance)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showEditModal} transparent animationType="fade">
          <View style={styles.editOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>İşlemi Düzenle</Text>
              <Text style={styles.editLabel}>Tutar</Text>
              <View style={styles.editAmountBox}>
                <Text style={styles.editCurrency}>₺</Text>
                <TextInput
                  style={styles.editAmountInput}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
              </View>
              <Text style={styles.editLabel}>Açıklama</Text>
              <TextInput
                style={styles.editInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Açıklama"
              />
              <View style={styles.editBtns}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.editCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editSaveBtn}
                  onPress={handleUpdateIslem}
                  disabled={loading}
                >
                  <Text style={styles.editSaveText}>
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
  content: { flex: 1 },
  balanceCard: {
    backgroundColor: "#f9fafb",
    padding: 24,
    alignItems: "center",
    borderLeftWidth: 4,
  },
  balanceLabel: { fontSize: 19, color: "#6b7280", marginBottom: 8 },
  balanceAmount: { fontSize: 40, fontWeight: "700" },
  balanceStatus: { fontSize: 19, marginTop: 8, fontWeight: "500" },
  historySection: { padding: 16 },
  historyTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  islemItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  islemLeft: { flex: 1 },
  islemType: { fontSize: 19, fontWeight: "700", letterSpacing: 0.5 },
  islemDate: { fontSize: 19, color: "#6b7280", marginTop: 2 },
  islemDesc: { fontSize: 19, color: "#374151", marginTop: 2 },
  islemKasa: { fontSize: 19, color: "#3b82f6", marginTop: 2 },
  islemRight: { alignItems: "flex-end" },
  islemAmount: { fontSize: 19, fontWeight: "600", marginBottom: 6 },
  islemActions: { flexDirection: "row", gap: 12 },
  actionBtn: { padding: 4 },
  emptyText: {
    fontSize: 19,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 30,
  },
  formContainer: {
    backgroundColor: "#e0f2fe",
    borderTopWidth: 2,
    borderTopColor: "#3b82f6",
    padding: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  dateLabel: { fontSize: 19, color: "#6b7280" },
  dateInput: { flex: 1, fontSize: 19, color: "#111827", marginLeft: 8 },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  selectLabel: { fontSize: 19, color: "#3b82f6" },
  selectValue: { flex: 1, fontSize: 19, color: "#3b82f6", fontWeight: "500" },
  descRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  descInput: { flex: 1, fontSize: 19, color: "#111827" },
  amountRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  amountBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySign: { fontSize: 20, fontWeight: "600", color: "#6b7280" },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 10,
    paddingLeft: 6,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6b7280",
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 19, fontWeight: "700", color: "#fff" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#bae6fd",
    borderRadius: 8,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: "#fff" },
  tabText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#0369a1",
    textAlign: "center",
  },
  tabTextActive: { color: "#0284c7" },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginBottom: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  pickerItemActive: { backgroundColor: "#e0f2fe" },
  pickerItemText: { fontSize: 19, color: "#111827" },
  pickerItemSub: { fontSize: 19, color: "#6b7280" },
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 19,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  editAmountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  editCurrency: { fontSize: 22, fontWeight: "600", color: "#6b7280" },
  editAmountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  editInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 19,
    color: "#111827",
    marginBottom: 20,
  },
  editBtns: { flexDirection: "row", gap: 12 },
  editCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  editCancelText: { fontSize: 19, fontWeight: "600", color: "#6b7280" },
  editSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  editSaveText: { fontSize: 19, fontWeight: "600", color: "#fff" },
});
