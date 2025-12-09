import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  Trash2,
  ShoppingCart,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Users,
  MoreVertical,
  X,
  Edit3,
  Archive,
  EyeOff,
  Eye,
  Tag,
  Wallet,
  ChevronRight,
  Package,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Cari, Islem } from "../types";
import { supabase } from "../lib/supabase";
import DatePickerField from "./DatePickerField";

interface CariDetayModalProps {
  visible: boolean;
  onClose: () => void;
  cari: Cari | null;
}

interface IslemKalemi {
  id: string;
  urun_adi: string;
  quantity: number;
  unit: string;
  unit_price: number;
  kdv_rate: number;
  total_price: number;
}

export default function CariDetayModal({
  visible,
  onClose,
  cari,
}: CariDetayModalProps) {
  const {
    islemler,
    fetchIslemler,
    fetchCariler,
    fetchKasalar,
    cariler,
    deleteCari,
    updateCari,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");

  // İşlem Detay Modal State
  const [showIslemDetay, setShowIslemDetay] = useState(false);
  const [selectedIslem, setSelectedIslem] = useState<Islem | null>(null);
  const [islemKalemleri, setIslemKalemleri] = useState<IslemKalemi[]>([]);
  const [loadingKalemler, setLoadingKalemler] = useState(false);

  // İşlem Düzenleme State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIslemAmount, setEditIslemAmount] = useState("");
  const [editIslemDate, setEditIslemDate] = useState("");
  const [editIslemDescription, setEditIslemDescription] = useState("");
  const [savingIslem, setSavingIslem] = useState(false);
  const [editKalemler, setEditKalemler] = useState<IslemKalemi[]>([]);

  // Güncel cari bilgisini store'dan al
  const currentCari = cariler.find((c) => c.id === cari?.id) || cari;

  // Bu cariye ait işlemler - en eski üstte, en yeni altta
  const cariIslemleri = islemler
    .filter((i) => i.cari_id === currentCari?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Modal kapanınca temizlik
  const handleClose = () => {
    setShowMenu(false);
    setShowEditModal(false);
    setShowIslemDetay(false);
    setIsEditMode(false);
    setSelectedIslem(null);
    setIslemKalemleri([]);
    setEditKalemler([]);
    onClose();
  };

  // visible değiştiğinde state'leri resetle
  useEffect(() => {
    if (!visible) {
      setShowMenu(false);
      setShowEditModal(false);
      setShowIslemDetay(false);
      setIsEditMode(false);
      setSelectedIslem(null);
      setIslemKalemleri([]);
      setEditKalemler([]);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && cari) {
      fetchIslemler();
      fetchCariler();
      setEditName(cari.name);
    }
  }, [visible, cari]);

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
    if (!currentCari) return { text: "Borç yok", color: "#6b7280" };
    const balance = currentCari.balance || 0;

    if (currentCari.type === "tedarikci") {
      if (balance > 0) {
        return {
          text: `Borcumuz: ${formatCurrency(balance)}`,
          color: "#ef4444",
        };
      } else if (balance < 0) {
        return {
          text: `Alacağımız: ${formatCurrency(Math.abs(balance))}`,
          color: "#10b981",
        };
      }
    } else {
      if (balance > 0) {
        return {
          text: `Alacağımız: ${formatCurrency(balance)}`,
          color: "#10b981",
        };
      } else if (balance < 0) {
        return {
          text: `Borcumuz: ${formatCurrency(Math.abs(balance))}`,
          color: "#ef4444",
        };
      }
    }
    return { text: "Borç yok", color: "#6b7280" };
  };

  const getIslemIcon = (type: string) => {
    switch (type) {
      case "gider":
        return <ShoppingCart size={16} color="#ef4444" />;
      case "gelir":
        return <RotateCcw size={16} color="#f59e0b" />;
      case "odeme":
        return <ArrowUpRight size={16} color="#3b82f6" />;
      case "tahsilat":
        return <ArrowDownLeft size={16} color="#10b981" />;
      default:
        return null;
    }
  };

  const getIslemLabel = (type: string) => {
    const labels: Record<string, string> = {
      gider: "ALIŞ",
      gelir: "İADE",
      odeme: "ÖDEME",
      tahsilat: "TAHSİLAT",
    };
    return labels[type] || type.toUpperCase();
  };

  const getIslemColor = (type: string) => {
    const colors: Record<string, string> = {
      gider: "#ef4444",
      gelir: "#f59e0b",
      odeme: "#3b82f6",
      tahsilat: "#10b981",
    };
    return colors[type] || "#6b7280";
  };

  // İşlem Detay Modalını Kapat
  const closeIslemDetay = () => {
    setIsEditMode(false);
    setShowIslemDetay(false);
    setSelectedIslem(null);
    setIslemKalemleri([]);
    setEditKalemler([]);
  };

  // İşlem Detayını Aç
  const openIslemDetay = async (islem: Islem) => {
    setSelectedIslem(islem);
    setShowIslemDetay(true);
    setIsEditMode(false); // Edit modunu kapat
    setIslemKalemleri([]);

    // Kalemli fatura mı kontrol et
    setLoadingKalemler(true);
    try {
      const { data, error } = await supabase
        .from("islem_kalemleri")
        .select("*")
        .eq("islem_id", islem.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setIslemKalemleri(data);
      }
    } catch (error) {
      console.error("Kalemler yüklenirken hata:", error);
    } finally {
      setLoadingKalemler(false);
    }
  };

  // İşlem Kaydet
  const handleSaveIslem = async () => {
    if (!selectedIslem) return;

    const isKalemliFatura = editKalemler.length > 0;

    // Kalemli faturada toplam tutarı hesapla
    let newAmount: number;
    if (isKalemliFatura) {
      newAmount = editKalemler.reduce((sum, k) => sum + k.total_price, 0);
    } else {
      newAmount = parseFloat(editIslemAmount);
      if (isNaN(newAmount) || newAmount <= 0) {
        Alert.alert("Hata", "Geçerli bir tutar girin");
        return;
      }
    }

    setSavingIslem(true);

    try {
      const oldAmount = selectedIslem.amount;
      const amountDiff = newAmount - oldAmount;

      // İşlemi güncelle
      const { error: updateError } = await supabase
        .from("islemler")
        .update({
          amount: newAmount,
          date: editIslemDate,
          description: editIslemDescription.trim() || null,
        })
        .eq("id", selectedIslem.id);

      if (updateError) throw updateError;

      // Kalemli faturaysa kalemleri de güncelle
      if (isKalemliFatura) {
        for (const kalem of editKalemler) {
          const { error: kalemError } = await supabase
            .from("islem_kalemleri")
            .update({
              quantity: kalem.quantity,
              unit_price: kalem.unit_price,
              total_price: kalem.total_price,
            })
            .eq("id", kalem.id);

          if (kalemError) {
            console.error("Kalem güncellenirken hata:", kalemError);
          }
        }
      }

      // Bakiye farkını güncelle (sadece tutar değiştiyse)
      if (amountDiff !== 0 && currentCari) {
        // Cari bakiyesi güncelle
        if (
          selectedIslem.type === "gider" ||
          selectedIslem.type === "tahsilat"
        ) {
          await supabase.rpc("update_cari_balance", {
            cari_id: currentCari.id,
            amount: amountDiff,
          });
        } else if (
          selectedIslem.type === "gelir" ||
          selectedIslem.type === "odeme"
        ) {
          await supabase.rpc("update_cari_balance", {
            cari_id: currentCari.id,
            amount: -amountDiff,
          });
        }

        // Kasa bakiyesi güncelle (eğer kasalı işlemse)
        if (selectedIslem.kasa_id) {
          if (
            selectedIslem.type === "odeme" ||
            selectedIslem.type === "gider"
          ) {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: selectedIslem.kasa_id,
              amount: -amountDiff,
            });
          } else {
            await supabase.rpc("update_kasa_balance", {
              kasa_id: selectedIslem.kasa_id,
              amount: amountDiff,
            });
          }
        }
      }

      // Verileri yenile
      fetchIslemler();
      fetchCariler();
      fetchKasalar();

      // State'leri temizle ve modalları kapat
      setSavingIslem(false);
      setEditKalemler([]);
      setIslemKalemleri([]);
      setSelectedIslem(null);
      setIsEditMode(false);
      setShowIslemDetay(false);
    } catch (error) {
      console.error("İşlem güncellenirken hata:", error);
      setSavingIslem(false);
      Alert.alert("Hata", "İşlem güncellenirken bir hata oluştu");
    }
  };

  // Kalem güncelleme fonksiyonu
  const updateEditKalem = (
    kalemId: string,
    field: "quantity" | "unit_price",
    value: string
  ) => {
    setEditKalemler((prev) =>
      prev.map((k) => {
        if (k.id === kalemId) {
          const newQuantity =
            field === "quantity" ? parseFloat(value) || 0 : k.quantity;
          const newUnitPrice =
            field === "unit_price" ? parseFloat(value) || 0 : k.unit_price;
          const kdvMultiplier = 1 + k.kdv_rate / 100;
          const newTotal = newQuantity * newUnitPrice * kdvMultiplier;

          return {
            ...k,
            [field]: field === "quantity" ? newQuantity : newUnitPrice,
            total_price: newTotal,
          };
        }
        return k;
      })
    );
  };

  // Düzenlenen kalemlerin toplam tutarı
  const editKalemlerToplam = editKalemler.reduce(
    (sum, k) => sum + k.total_price,
    0
  );

  // İşlem Silme (detay modaldan)
  const handleDeleteIslemFromDetay = async () => {
    if (!selectedIslem) return;

    Alert.alert(
      "İşlemi Sil",
      `${formatCurrency(
        selectedIslem.amount
      )} tutarındaki işlemi silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Önce kalemleri sil (varsa)
              await supabase
                .from("islem_kalemleri")
                .delete()
                .eq("islem_id", selectedIslem.id);

              // Bakiyeleri geri al
              if (currentCari) {
                if (
                  selectedIslem.type === "gider" ||
                  selectedIslem.type === "tahsilat"
                ) {
                  await supabase.rpc("update_cari_balance", {
                    cari_id: currentCari.id,
                    amount: -selectedIslem.amount,
                  });
                } else {
                  await supabase.rpc("update_cari_balance", {
                    cari_id: currentCari.id,
                    amount: selectedIslem.amount,
                  });
                }
              }

              if (selectedIslem.kasa_id) {
                if (
                  selectedIslem.type === "odeme" ||
                  selectedIslem.type === "gider"
                ) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: selectedIslem.kasa_id,
                    amount: selectedIslem.amount,
                  });
                } else {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: selectedIslem.kasa_id,
                    amount: -selectedIslem.amount,
                  });
                }
              }

              // İşlemi sil
              await supabase
                .from("islemler")
                .delete()
                .eq("id", selectedIslem.id);

              setShowIslemDetay(false);
              fetchIslemler();
              fetchCariler();
              fetchKasalar();
            } catch (error) {
              Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Cari Silme
  const handleDeleteCari = () => {
    setShowMenu(false);
    Alert.alert(
      "Cariyi Sil",
      `"${currentCari?.name}" carisini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve tüm işlem geçmişi silinecektir.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!currentCari) return;
            setLoading(true);
            const { error } = await deleteCari(currentCari.id);
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Cari silinirken bir hata oluştu");
            } else {
              Alert.alert("Başarılı", "Cari silindi");
              handleClose();
            }
          },
        },
      ]
    );
  };

  // İsim Düzenleme
  const handleEditName = async () => {
    if (!editName.trim()) {
      Alert.alert("Hata", "İsim boş olamaz");
      return;
    }
    if (!currentCari) return;

    setLoading(true);
    const { error } = await updateCari(currentCari.id, {
      name: editName.trim(),
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "İsim güncellenirken bir hata oluştu");
    } else {
      setShowEditModal(false);
      fetchCariler();
    }
  };

  // Arşive Alma
  const handleArchive = () => {
    setShowMenu(false);
    Alert.alert(
      "Arşive Al",
      `"${currentCari?.name}" carisini arşive almak istediğinize emin misiniz?\n\nArşivdeki cariler listelerde görünmez ama verileri korunur.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşive Al",
          onPress: async () => {
            if (!currentCari) return;
            setLoading(true);
            const { error } = await updateCari(currentCari.id, {
              is_archived: true,
            });
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Arşive alınırken bir hata oluştu");
            } else {
              Alert.alert("Başarılı", "Cari arşive alındı");
              handleClose();
            }
          },
        },
      ]
    );
  };

  // Raporlara Dahil Toggle
  const handleToggleIncludeInReports = async () => {
    if (!currentCari) return;
    setShowMenu(false);
    setLoading(true);
    const { error } = await updateCari(currentCari.id, {
      include_in_reports: !currentCari.include_in_reports,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Hata", "Ayar güncellenirken bir hata oluştu");
    } else {
      fetchCariler();
    }
  };

  if (!currentCari) return null;

  const balanceInfo = getBalanceInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentCari.name}
          </Text>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.menuButton}
          >
            <MoreVertical size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Cari Bilgi Kartı */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View
                style={[
                  styles.typeIcon,
                  {
                    backgroundColor:
                      currentCari.type === "tedarikci" ? "#fef3c7" : "#dbeafe",
                  },
                ]}
              >
                {currentCari.type === "tedarikci" ? (
                  <Building2 size={28} color="#f59e0b" />
                ) : (
                  <Users size={28} color="#3b82f6" />
                )}
              </View>
              <View style={styles.infoMain}>
                <Text style={styles.cariName}>{currentCari.name}</Text>
                <Text style={styles.cariType}>
                  {currentCari.type === "tedarikci" ? "Tedarikçi" : "Müşteri"}
                </Text>
                {!currentCari.include_in_reports && (
                  <View style={styles.excludedBadge}>
                    <EyeOff size={10} color="#f59e0b" />
                    <Text style={styles.excludedBadgeText}>
                      Raporlara dahil değil
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {(currentCari.phone ||
              currentCari.email ||
              currentCari.address) && (
              <View style={styles.contactSection}>
                {currentCari.phone && (
                  <View style={styles.contactRow}>
                    <Phone size={16} color="#6b7280" />
                    <Text style={styles.contactText}>{currentCari.phone}</Text>
                  </View>
                )}
                {currentCari.email && (
                  <View style={styles.contactRow}>
                    <Mail size={16} color="#6b7280" />
                    <Text style={styles.contactText}>{currentCari.email}</Text>
                  </View>
                )}
                {currentCari.address && (
                  <View style={styles.contactRow}>
                    <MapPin size={16} color="#6b7280" />
                    <Text style={styles.contactText}>
                      {currentCari.address}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View
              style={[
                styles.balanceBox,
                { borderLeftColor: balanceInfo.color },
              ]}
            >
              <Text style={styles.balanceLabel}>Bakiye Durumu</Text>
              <Text
                style={[styles.balanceAmount, { color: balanceInfo.color }]}
              >
                {formatCurrency(Math.abs(currentCari.balance || 0))}
              </Text>
              <Text
                style={[styles.balanceStatus, { color: balanceInfo.color }]}
              >
                {balanceInfo.text}
              </Text>
            </View>
          </View>

          {/* İşlem Geçmişi */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>
              İşlem Geçmişi (
              {cariIslemleri.length +
                (currentCari.initial_balance !== 0 ? 1 : 0)}
              )
            </Text>

            {/* Başlangıç bakiyesi */}
            {currentCari.initial_balance !== 0 && (
              <View style={styles.islemItem}>
                <View style={styles.islemLeft}>
                  <View
                    style={[
                      styles.islemIconBox,
                      { backgroundColor: "#f3f4f6" },
                    ]}
                  >
                    <Wallet size={16} color="#6b7280" />
                  </View>
                  <View style={styles.islemInfo}>
                    <Text style={[styles.islemType, { color: "#6b7280" }]}>
                      BAŞLANGIÇ
                    </Text>
                    <Text style={styles.islemDate}>
                      {formatDate(currentCari.created_at)}
                    </Text>
                    <Text style={styles.islemDesc}>
                      {currentCari.type === "tedarikci"
                        ? currentCari.initial_balance > 0
                          ? "Biz borçluyduk"
                          : "Tedarikçi borçluydu"
                        : currentCari.initial_balance > 0
                        ? "Müşteri borçluydu"
                        : "Biz borçluyduk"}
                    </Text>
                  </View>
                </View>
                <View style={styles.islemRight}>
                  <Text style={[styles.islemAmount, { color: "#6b7280" }]}>
                    {formatCurrency(Math.abs(currentCari.initial_balance))}
                  </Text>
                </View>
              </View>
            )}

            {cariIslemleri.length > 0 ? (
              cariIslemleri.map((islem) => (
                <TouchableOpacity
                  key={islem.id}
                  style={styles.islemItem}
                  onPress={() => openIslemDetay(islem)}
                  activeOpacity={0.7}
                >
                  <View style={styles.islemLeft}>
                    <View
                      style={[
                        styles.islemIconBox,
                        { backgroundColor: `${getIslemColor(islem.type)}15` },
                      ]}
                    >
                      {getIslemIcon(islem.type)}
                    </View>
                    <View style={styles.islemInfo}>
                      <Text
                        style={[
                          styles.islemType,
                          { color: getIslemColor(islem.type) },
                        ]}
                      >
                        {getIslemLabel(islem.type)}
                      </Text>
                      <Text style={styles.islemDate}>
                        {formatDate(islem.date)}
                      </Text>
                      {islem.description && (
                        <Text style={styles.islemDesc} numberOfLines={1}>
                          {islem.description}
                        </Text>
                      )}
                      {islem.kategori && (
                        <View style={styles.islemKategori}>
                          <Tag size={10} color="#8b5cf6" />
                          <Text style={styles.islemKategoriText}>
                            {islem.kategori.name}
                          </Text>
                        </View>
                      )}
                      {islem.kasa && (
                        <Text style={styles.islemKasa}>
                          {islem.type === "odeme" || islem.type === "gider"
                            ? "← "
                            : "→ "}
                          {islem.kasa.name}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.islemRight}>
                    <Text
                      style={[
                        styles.islemAmount,
                        { color: getIslemColor(islem.type) },
                      ]}
                    >
                      {islem.type === "gider" || islem.type === "odeme"
                        ? "-"
                        : "+"}
                      {formatCurrency(islem.amount)}
                    </Text>
                    <ChevronRight size={16} color="#9ca3af" />
                  </View>
                </TouchableOpacity>
              ))
            ) : currentCari.initial_balance === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Henüz işlem yok</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* İşlem Detay Modal */}
        <Modal
          visible={showIslemDetay && !isEditMode}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.detayContainer} edges={["top"]}>
            <View style={styles.detayHeader}>
              <TouchableOpacity
                onPress={closeIslemDetay}
                style={styles.headerBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.detayTitle}>İşlem Detayı</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!selectedIslem) return;
                  setEditIslemAmount(String(selectedIslem.amount));
                  setEditIslemDate(selectedIslem.date);
                  setEditIslemDescription(selectedIslem.description || "");
                  setEditKalemler([...islemKalemleri]);
                  setIsEditMode(true);
                }}
                style={styles.headerBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Edit3 size={22} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            {selectedIslem && (
              <ScrollView style={styles.detayContent}>
                {/* İşlem Özet */}
                <View
                  style={[
                    styles.detayCard,
                    { borderLeftColor: getIslemColor(selectedIslem.type) },
                  ]}
                >
                  <View style={styles.detayCardHeader}>
                    <View
                      style={[
                        styles.detayIconBox,
                        {
                          backgroundColor: `${getIslemColor(
                            selectedIslem.type
                          )}15`,
                        },
                      ]}
                    >
                      {getIslemIcon(selectedIslem.type)}
                    </View>
                    <View style={styles.detayCardInfo}>
                      <Text
                        style={[
                          styles.detayType,
                          { color: getIslemColor(selectedIslem.type) },
                        ]}
                      >
                        {getIslemLabel(selectedIslem.type)}
                      </Text>
                      <Text style={styles.detayDate}>
                        {formatDate(selectedIslem.date)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.detayAmount,
                        { color: getIslemColor(selectedIslem.type) },
                      ]}
                    >
                      {formatCurrency(selectedIslem.amount)}
                    </Text>
                  </View>

                  {selectedIslem.description && (
                    <View style={styles.detayRow}>
                      <Text style={styles.detayLabel}>Açıklama</Text>
                      <Text style={styles.detayValue}>
                        {selectedIslem.description}
                      </Text>
                    </View>
                  )}

                  {selectedIslem.kategori && (
                    <View style={styles.detayRow}>
                      <Text style={styles.detayLabel}>Kategori</Text>
                      <View style={styles.kategoriTag}>
                        <Tag size={12} color="#8b5cf6" />
                        <Text style={styles.kategoriTagText}>
                          {selectedIslem.kategori.name}
                        </Text>
                      </View>
                    </View>
                  )}

                  {selectedIslem.kasa && (
                    <View style={styles.detayRow}>
                      <Text style={styles.detayLabel}>Kasa</Text>
                      <Text style={styles.detayValue}>
                        {selectedIslem.kasa.name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Kalemler */}
                {loadingKalemler ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.loadingText}>
                      Kalemler yükleniyor...
                    </Text>
                  </View>
                ) : islemKalemleri.length > 0 ? (
                  <View style={styles.kalemlerSection}>
                    <View style={styles.kalemlerHeader}>
                      <Package size={18} color="#374151" />
                      <Text style={styles.kalemlerTitle}>
                        Fatura Kalemleri ({islemKalemleri.length})
                      </Text>
                    </View>
                    {islemKalemleri.map((kalem, index) => (
                      <View key={kalem.id} style={styles.kalemItem}>
                        <View style={styles.kalemHeader}>
                          <Text style={styles.kalemNo}>{index + 1}.</Text>
                          <Text style={styles.kalemAdi}>{kalem.urun_adi}</Text>
                        </View>
                        <View style={styles.kalemDetails}>
                          <Text style={styles.kalemDetail}>
                            {kalem.quantity} {kalem.unit} ×{" "}
                            {formatCurrency(kalem.unit_price)}
                          </Text>
                          <Text style={styles.kalemKdv}>
                            KDV: %{kalem.kdv_rate}
                          </Text>
                        </View>
                        <Text style={styles.kalemTotal}>
                          {formatCurrency(kalem.total_price)}
                        </Text>
                      </View>
                    ))}
                    <View style={styles.kalemlerTotal}>
                      <Text style={styles.kalemlerTotalLabel}>Toplam</Text>
                      <Text style={styles.kalemlerTotalValue}>
                        {formatCurrency(selectedIslem.amount)}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Silme Butonu */}
                <TouchableOpacity
                  style={styles.deleteIslemBtn}
                  onPress={handleDeleteIslemFromDetay}
                >
                  <Trash2 size={18} color="#ef4444" />
                  <Text style={styles.deleteIslemBtnText}>İşlemi Sil</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </SafeAreaView>
        </Modal>

        {/* İşlem Düzenleme Modal - AYRI TAM EKRAN */}
        <Modal
          visible={isEditMode}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.detayContainer} edges={["top"]}>
            <View style={styles.detayHeader}>
              <TouchableOpacity
                onPress={() => {
                  setIsEditMode(false);
                  setEditKalemler([]);
                }}
                style={styles.headerBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.detayTitle}>İşlemi Düzenle</Text>
              <View style={styles.headerBtn} />
            </View>

            <ScrollView style={styles.detayContent}>
              {/* Kalemli fatura düzenleme */}
              {editKalemler.length > 0 ? (
                <View style={styles.editKalemlerSection}>
                  <Text style={styles.editSectionTitle}>Fatura Kalemleri</Text>
                  {editKalemler.map((kalem, index) => (
                    <View key={kalem.id} style={styles.editKalemItem}>
                      <Text style={styles.editKalemName}>
                        {index + 1}. {kalem.urun_adi}
                      </Text>
                      <View style={styles.editKalemRow}>
                        <View style={styles.editKalemField}>
                          <Text style={styles.editKalemLabel}>Adet</Text>
                          <TextInput
                            style={styles.editKalemInput}
                            value={String(kalem.quantity)}
                            onChangeText={(val) =>
                              updateEditKalem(kalem.id, "quantity", val)
                            }
                            keyboardType="decimal-pad"
                          />
                        </View>
                        <Text style={styles.editKalemUnit}>{kalem.unit}</Text>
                        <View style={styles.editKalemField}>
                          <Text style={styles.editKalemLabel}>Birim Fiyat</Text>
                          <View style={styles.editKalemPriceInput}>
                            <Text style={styles.editKalemCurrency}>₺</Text>
                            <TextInput
                              style={styles.editKalemInput}
                              value={String(kalem.unit_price)}
                              onChangeText={(val) =>
                                updateEditKalem(kalem.id, "unit_price", val)
                              }
                              keyboardType="decimal-pad"
                            />
                          </View>
                        </View>
                        <View style={styles.editKalemTotalBox}>
                          <Text style={styles.editKalemLabel}>Toplam</Text>
                          <Text style={styles.editKalemTotal}>
                            {formatCurrency(kalem.total_price)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  <View style={styles.editKalemlerGrandTotal}>
                    <Text style={styles.editKalemlerGrandLabel}>
                      Genel Toplam
                    </Text>
                    <Text style={styles.editKalemlerGrandValue}>
                      {formatCurrency(editKalemlerToplam)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>Tutar</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>₺</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={editIslemAmount}
                      onChangeText={setEditIslemAmount}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                  </View>
                </View>
              )}

              <View style={styles.editSection}>
                <DatePickerField
                  value={editIslemDate}
                  onChange={setEditIslemDate}
                  label="Tarih"
                />
              </View>

              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Açıklama</Text>
                <TextInput
                  style={styles.editInput}
                  value={editIslemDescription}
                  onChangeText={setEditIslemDescription}
                  placeholder="Açıklama (opsiyonel)"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.editButtonsBottom}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => {
                    setIsEditMode(false);
                    setEditKalemler([]);
                  }}
                >
                  <Text style={styles.editCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.editSaveBtn,
                    savingIslem && styles.editSaveBtnDisabled,
                  ]}
                  onPress={handleSaveIslem}
                  disabled={savingIslem}
                >
                  <Text style={styles.editSaveText}>
                    {savingIslem ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Hamburger Menü Modal */}
        <Modal visible={showMenu} transparent animationType="fade">
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={styles.menuContainer}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Ayarlar</Text>
                <TouchableOpacity onPress={() => setShowMenu(false)}>
                  <X size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  setShowEditModal(true);
                }}
              >
                <Edit3 size={20} color="#3b82f6" />
                <Text style={styles.menuItemText}>İsmi Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleToggleIncludeInReports}
              >
                {currentCari.include_in_reports ? (
                  <EyeOff size={20} color="#f59e0b" />
                ) : (
                  <Eye size={20} color="#10b981" />
                )}
                <Text style={styles.menuItemText}>
                  {currentCari.include_in_reports
                    ? "Hesaba Dahil Etme"
                    : "Hesaba Dahil Et"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
                <Archive size={20} color="#8b5cf6" />
                <Text style={styles.menuItemText}>Arşive Al</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDeleteCari}
              >
                <Trash2 size={20} color="#ef4444" />
                <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                  Cariyi Sil
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* İsim Düzenleme Modal */}
        <Modal visible={showEditModal} transparent animationType="fade">
          <View style={styles.editOverlay}>
            <View style={styles.editContainer}>
              <Text style={styles.editTitle}>İsmi Düzenle</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Cari adı"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.editCancelText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editSaveBtn}
                  onPress={handleEditName}
                  disabled={loading}
                >
                  <Text style={styles.editSaveText}>
                    {loading ? "..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
  },
  menuButton: { padding: 4 },
  content: { flex: 1 },
  infoCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  infoMain: { marginLeft: 14, flex: 1 },
  cariName: { fontSize: 20, fontWeight: "700", color: "#111827" },
  cariType: { fontSize: 14, color: "#6b7280", marginTop: 2 },
  excludedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
    alignSelf: "flex-start",
  },
  excludedBadgeText: { fontSize: 11, color: "#f59e0b", fontWeight: "500" },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 16,
    gap: 10,
  },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  contactText: { fontSize: 14, color: "#374151", flex: 1 },
  balanceBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  balanceLabel: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  balanceAmount: { fontSize: 28, fontWeight: "700" },
  balanceStatus: { fontSize: 14, fontWeight: "500", marginTop: 4 },
  historySection: { paddingHorizontal: 16, paddingBottom: 30 },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  islemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  islemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  islemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: { marginLeft: 12, flex: 1 },
  islemType: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  islemDate: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  islemDesc: { fontSize: 12, color: "#374151", marginTop: 2 },
  islemKategori: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  islemKategoriText: { fontSize: 11, color: "#8b5cf6", fontWeight: "500" },
  islemKasa: { fontSize: 12, color: "#3b82f6", marginTop: 2 },
  islemRight: { alignItems: "flex-end", gap: 6 },
  islemAmount: { fontSize: 14, fontWeight: "600" },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#9ca3af" },
  // İşlem Detay Modal
  detayContainer: { flex: 1, backgroundColor: "#f9fafb" },
  detayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerBtn: { padding: 8, borderRadius: 8 },
  detayTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  detayContent: { flex: 1, padding: 16 },
  detayCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  detayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detayIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  detayCardInfo: { marginLeft: 12, flex: 1 },
  detayType: { fontSize: 14, fontWeight: "700" },
  detayDate: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  detayAmount: { fontSize: 20, fontWeight: "700" },
  detayRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    marginTop: 12,
  },
  detayLabel: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  detayValue: { fontSize: 14, color: "#374151" },
  kategoriTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  kategoriTagText: { fontSize: 13, color: "#8b5cf6", fontWeight: "500" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  loadingText: { fontSize: 14, color: "#6b7280" },
  // Kalemler
  kalemlerSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  kalemlerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  kalemlerTitle: { fontSize: 15, fontWeight: "600", color: "#374151" },
  kalemItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  kalemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  kalemNo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 6,
  },
  kalemAdi: { fontSize: 14, fontWeight: "600", color: "#111827", flex: 1 },
  kalemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  kalemDetail: { fontSize: 13, color: "#6b7280" },
  kalemKdv: { fontSize: 12, color: "#9ca3af" },
  kalemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    textAlign: "right",
  },
  kalemlerTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 8,
  },
  kalemlerTotalLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  kalemlerTotalValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  deleteIslemBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  deleteIslemBtnText: { fontSize: 15, fontWeight: "600", color: "#ef4444" },
  // Hamburger Menü
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: { fontSize: 16, color: "#374151" },
  menuDivider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 8 },
  // Düzenleme Modal
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  editTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  editScrollContent: { maxHeight: 400 },
  editContainerLarge: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "85%",
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  // Kalem düzenleme stilleri
  editKalemlerSection: { marginBottom: 16 },
  editSectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  editSection: { marginBottom: 16 },
  editKalemItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  editKalemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  editKalemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  editKalemField: { flex: 1 },
  editKalemLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  editKalemInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minWidth: 60,
  },
  editKalemUnit: { fontSize: 13, color: "#6b7280", marginTop: 16 },
  editKalemPriceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingLeft: 8,
  },
  editKalemCurrency: { fontSize: 14, color: "#6b7280" },
  editKalemTotalBox: { minWidth: 80, alignItems: "flex-end" },
  editKalemTotal: { fontSize: 14, fontWeight: "600", color: "#10b981" },
  editKalemlerGrandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    marginTop: 8,
  },
  editKalemlerGrandLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  editKalemlerGrandValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  kalemliWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  kalemliWarningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  currencySymbol: { fontSize: 18, fontWeight: "600", color: "#6b7280" },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  editButtons: { flexDirection: "row", gap: 12 },
  editButtonsBottom: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  editCancelBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editCancelText: { fontSize: 16, fontWeight: "600", color: "#374151" },
  editSaveBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editSaveBtnDisabled: { backgroundColor: "#93c5fd" },
  editSaveText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
