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
  FlatList,
} from "react-native";
import {
  X,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Edit3,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Kasa, Islem } from "../types";
import { formatCurrency, formatDate } from "../shared/utils";

interface KasaDetayModalProps {
  visible: boolean;
  onClose: () => void;
  kasa: Kasa | null;
}

const kasaIcons: Record<string, any> = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
  kredi_karti: { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" },
  birikim: { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" },
};

export default function KasaDetayModal({
  visible,
  onClose,
  kasa,
}: KasaDetayModalProps) {
  const {
    islemler,
    fetchIslemler,
    updateIslem,
    deleteIslem,
    addIslem,
    updateKasa,
    deleteKasa,
    fetchKasalar,
  } = useStore();
  const [editingIslem, setEditingIslem] = useState<Islem | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditKasaModal, setShowEditKasaModal] = useState(false);
  const [addType, setAddType] = useState<"gelir" | "gider">("gelir");
  const [addAmount, setAddAmount] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Kasa düzenleme state
  const [editKasaName, setEditKasaName] = useState("");
  const [editKasaType, setEditKasaType] = useState<string>("nakit");
  const [islemlerLoading, setIslemlerLoading] = useState(false);

  // Bu kasaya ait işlemler - tarihe göre sırala
  const kasaIslemleri = islemler
    .filter((i) => i.kasa_id === kasa?.id || i.kasa_hedef_id === kasa?.id)
    .sort((a, b) => {
      // Önce tarihe göre (yeniden eskiye)
      const dateCompare =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      // Aynı tarihse created_at'a göre
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    })
    .slice(0, 100);

  useEffect(() => {
    const loadIslemler = async () => {
      if (visible && kasa) {
        setIslemlerLoading(true);
        await fetchIslemler(200);
        setIslemlerLoading(false);
      }
    };
    loadIslemler();
  }, [visible, kasa]);

  const getIslemIcon = (type: string, isIncoming: boolean) => {
    if (type === "transfer") {
      return { icon: ArrowLeftRight, color: "#8b5cf6", bgColor: "#ede9fe" };
    }
    if (type === "gelir" || type === "tahsilat" || isIncoming) {
      return { icon: ArrowDownLeft, color: "#10b981", bgColor: "#dcfce7" };
    }
    return { icon: ArrowUpRight, color: "#ef4444", bgColor: "#fee2e2" };
  };

  const handleEditPress = (islem: Islem) => {
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

    setLoading(true);
    const { error } = await updateIslem(editingIslem.id, {
      amount: parseFloat(editAmount),
      description: editDescription.trim() || undefined,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "İşlem güncellenirken bir hata oluştu");
    } else {
      setShowEditModal(false);
      setEditingIslem(null);
      fetchIslemler(100);
    }
  };

  const handleDeleteIslem = async (islem: Islem) => {
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
            const { error } = await deleteIslem(islem.id);
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  const handleAddIslem = async () => {
    if (!kasa) return;

    if (!addAmount || parseFloat(addAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    setLoading(true);
    const { error } = await addIslem({
      type: addType,
      amount: parseFloat(addAmount),
      description:
        addDescription.trim() || (addType === "gelir" ? "Gelir" : "Gider"),
      date: new Date().toISOString().split("T")[0],
      kasa_id: kasa.id,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "İşlem eklenirken bir hata oluştu");
    } else {
      setShowAddModal(false);
      setAddAmount("");
      setAddDescription("");
      fetchIslemler(100);
    }
  };

  // Kasa düzenleme
  const openEditKasaModal = () => {
    if (kasa) {
      setEditKasaName(kasa.name);
      setEditKasaType(kasa.type);
      setShowEditKasaModal(true);
    }
  };

  const handleUpdateKasa = async () => {
    if (!kasa) return;

    if (!editKasaName.trim()) {
      Alert.alert("Hata", "Kasa adı girin");
      return;
    }

    setLoading(true);
    const { error } = await updateKasa(kasa.id, {
      name: editKasaName.trim(),
      type: editKasaType as any,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Kasa güncellenirken bir hata oluştu");
    } else {
      setShowEditKasaModal(false);
      fetchKasalar();
    }
  };

  const handleDeleteKasa = () => {
    if (!kasa) return;

    if (kasa.balance !== 0) {
      Alert.alert(
        "Uyarı",
        "Bakiyesi olan kasa silinemez. Önce bakiyeyi sıfırlayın."
      );
      return;
    }

    Alert.alert(
      "Kasa Sil",
      `"${kasa.name}" kasasını silmek istediğinize emin misiniz?\n\nBu kasaya ait tüm işlemler de silinecektir.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const { error } = await deleteKasa(kasa.id);
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Kasa silinirken bir hata oluştu");
            } else {
              onClose();
            }
          },
        },
      ]
    );
  };

  const renderIslemItem = ({ item }: { item: Islem }) => {
    const isIncoming = item.kasa_hedef_id === kasa?.id;
    const iconConfig = getIslemIcon(item.type, isIncoming);
    const IconComponent = iconConfig.icon;

    const isPositive =
      item.type === "gelir" || item.type === "tahsilat" || isIncoming;

    return (
      <View style={styles.islemCard}>
        <View style={styles.islemLeft}>
          <View
            style={[styles.islemIcon, { backgroundColor: iconConfig.bgColor }]}
          >
            <IconComponent size={18} color={iconConfig.color} />
          </View>
          <View style={styles.islemInfo}>
            <Text style={styles.islemDescription} numberOfLines={1}>
              {item.description ||
                (item.type === "transfer"
                  ? "Transfer"
                  : item.type === "gelir"
                  ? "Gelir"
                  : "Gider")}
            </Text>
            <Text style={styles.islemDate}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={styles.islemRight}>
          <Text
            style={[
              styles.islemAmount,
              isPositive ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {isPositive ? "+" : "-"}
            {formatCurrency(item.amount)}
          </Text>
          <View style={styles.islemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditPress(item)}
            >
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteIslem(item)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (!kasa) return null;

  const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
  const IconComponent = iconConfig.icon;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Kasa Detay</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Kasa Bilgisi */}
        <View style={styles.kasaCard}>
          <View
            style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}
          >
            <IconComponent size={32} color={iconConfig.color} />
          </View>
          <Text style={styles.kasaName}>{kasa.name}</Text>
          <Text style={styles.kasaBalance}>{formatCurrency(kasa.balance)}</Text>
          <Text style={styles.kasaType}>
            {kasa.type === "nakit"
              ? "Nakit Kasa"
              : kasa.type === "banka"
              ? "Banka Hesabı"
              : kasa.type === "kredi_karti"
              ? "Kredi Kartı"
              : "Birikim"}
          </Text>

          {/* Kasa İşlemleri */}
          <View style={styles.kasaActions}>
            <TouchableOpacity
              style={styles.kasaActionBtn}
              onPress={openEditKasaModal}
            >
              <Edit3 size={16} color="#3b82f6" />
              <Text style={styles.kasaActionBtnText}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.kasaActionBtn, styles.kasaActionBtnDanger]}
              onPress={handleDeleteKasa}
            >
              <Trash2 size={16} color="#ef4444" />
              <Text
                style={[
                  styles.kasaActionBtnText,
                  styles.kasaActionBtnTextDanger,
                ]}
              >
                Sil
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* İşlem Listesi */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Son İşlemler</Text>
          <Text style={styles.listCount}>
            {islemlerLoading
              ? "Yükleniyor..."
              : `${kasaIslemleri.length} işlem`}
          </Text>
        </View>

        {islemlerLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>İşlemler yükleniyor...</Text>
          </View>
        ) : kasaIslemleri.length > 0 ? (
          <FlatList
            data={kasaIslemleri}
            renderItem={renderIslemItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Bu hesapta henüz işlem yok</Text>
            <Text style={styles.emptySubtext}>
              Yukarıdaki + butonuyla işlem ekleyebilirsiniz
            </Text>
          </View>
        )}

        {/* İşlem Düzenleme Modal */}
        <Modal visible={showEditModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>İşlemi Düzenle</Text>

              <Text style={styles.editLabel}>Tutar</Text>
              <View style={styles.editAmountContainer}>
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

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.editCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editSaveButton}
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

        {/* Yeni İşlem Ekleme Modal */}
        <Modal visible={showAddModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>Yeni İşlem Ekle</Text>

              <Text style={styles.editLabel}>İşlem Tipi</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    addType === "gelir" && styles.typeButtonActiveGelir,
                  ]}
                  onPress={() => setAddType("gelir")}
                >
                  <ArrowDownLeft
                    size={18}
                    color={addType === "gelir" ? "#fff" : "#10b981"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      addType === "gelir" && styles.typeButtonTextActive,
                    ]}
                  >
                    Gelir
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    addType === "gider" && styles.typeButtonActiveGider,
                  ]}
                  onPress={() => setAddType("gider")}
                >
                  <ArrowUpRight
                    size={18}
                    color={addType === "gider" ? "#fff" : "#ef4444"}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      addType === "gider" && styles.typeButtonTextActive,
                    ]}
                  >
                    Gider
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.editLabel}>Tutar</Text>
              <View style={styles.editAmountContainer}>
                <Text style={styles.editCurrency}>₺</Text>
                <TextInput
                  style={styles.editAmountInput}
                  value={addAmount}
                  onChangeText={setAddAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
              </View>

              <Text style={styles.editLabel}>Açıklama</Text>
              <TextInput
                style={styles.editInput}
                value={addDescription}
                onChangeText={setAddDescription}
                placeholder="Açıklama (opsiyonel)"
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setAddAmount("");
                    setAddDescription("");
                  }}
                >
                  <Text style={styles.editCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.editSaveButton,
                    addType === "gider" && styles.editSaveButtonGider,
                  ]}
                  onPress={handleAddIslem}
                  disabled={loading}
                >
                  <Text style={styles.editSaveText}>
                    {loading ? "Ekleniyor..." : "Ekle"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Kasa Düzenleme Modal */}
        <Modal visible={showEditKasaModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>Kasa Düzenle</Text>

              <Text style={styles.editLabel}>Kasa Adı</Text>
              <TextInput
                style={styles.editInput}
                value={editKasaName}
                onChangeText={setEditKasaName}
                placeholder="Kasa adı"
              />

              <Text style={styles.editLabel}>Kasa Tipi</Text>
              <View style={styles.kasaTypeButtons}>
                {[
                  { key: "nakit", label: "Nakit", icon: Wallet },
                  { key: "banka", label: "Banka", icon: Building2 },
                  {
                    key: "kredi_karti",
                    label: "Kredi Kartı",
                    icon: CreditCard,
                  },
                  { key: "birikim", label: "Birikim", icon: PiggyBank },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = editKasaType === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.kasaTypeBtn,
                        isActive && styles.kasaTypeBtnActive,
                      ]}
                      onPress={() => setEditKasaType(item.key)}
                    >
                      <IconComp
                        size={18}
                        color={isActive ? "#fff" : "#6b7280"}
                      />
                      <Text
                        style={[
                          styles.kasaTypeBtnText,
                          isActive && styles.kasaTypeBtnTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelButton}
                  onPress={() => setShowEditKasaModal(false)}
                >
                  <Text style={styles.editCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editSaveButton}
                  onPress={handleUpdateKasa}
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
      </View>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#10b981",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  kasaCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kasaIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  kasaName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  kasaBalance: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  kasaType: {
    fontSize: 14,
    color: "#6b7280",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  listCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  islemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
  },
  islemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  islemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: {
    flex: 1,
  },
  islemDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  islemDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  islemRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  islemAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  amountPositive: {
    color: "#10b981",
  },
  amountNegative: {
    color: "#ef4444",
  },
  islemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editModal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  editAmountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editCurrency: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6b7280",
  },
  editAmountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
    paddingLeft: 8,
  },
  editInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  editCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  editCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  editSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  editSaveButtonGider: {
    backgroundColor: "#ef4444",
  },
  editSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  typeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  typeButtonActiveGelir: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  typeButtonActiveGider: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  kasaActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  kasaActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    paddingVertical: 10,
    borderRadius: 10,
  },
  kasaActionBtnDanger: {
    backgroundColor: "#fef2f2",
  },
  kasaActionBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  kasaActionBtnTextDanger: {
    color: "#ef4444",
  },
  kasaTypeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  kasaTypeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kasaTypeBtnActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  kasaTypeBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
  },
  kasaTypeBtnTextActive: {
    color: "#fff",
  },
});
