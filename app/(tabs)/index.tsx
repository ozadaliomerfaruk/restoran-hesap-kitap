import { useEffect, useState } from "react";
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
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../src/context/AuthContext";
import { useStore } from "../../src/store/useStore";
import GunlukCiroModal from "../../src/components/GunlukCiroModal";
import HakedisModal from "../../src/components/HakedisModal";
import { Kasa } from "../../src/types";
import { supabase } from "../../src/lib/supabase";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CreditCard,
  Users,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  X,
  Calendar,
  Truck,
  ShoppingBag,
  Banknote,
  Scale,
  Info,
  Plus,
  Search,
  PlusCircle,
  Check,
} from "lucide-react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IslemTipi = "gelir" | "gider" | "odeme" | "tahsilat" | "transfer";

const kasaIcons: Record<string, any> = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
  kredi_karti: { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" },
  birikim: { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    profile,
    fetchProfile,
    kasalar,
    fetchKasalar,
    islemler,
    fetchIslemler,
    cariler,
    fetchCariler,
    personeller,
    fetchPersoneller,
    personelIslemler,
    fetchPersonelIslemler,
    kategoriler,
    fetchKategoriler,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCiroModal, setShowCiroModal] = useState(false);
  const [showHakedisModal, setShowHakedisModal] = useState(false);
  const [expandedKasaId, setExpandedKasaId] = useState<string | null>(null);
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetKasaId, setFormTargetKasaId] = useState<string | null>(null);
  const [formTargetType, setFormTargetType] = useState<
    "personel" | "cari" | null
  >(null);
  const [formTargetId, setFormTargetId] = useState<string | null>(null);
  const [formKategoriId, setFormKategoriId] = useState<string>("");
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [kategoriSearch, setKategoriSearch] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

  // Hesap Ekleme
  const [showAddKasaModal, setShowAddKasaModal] = useState(false);
  const [newKasaName, setNewKasaName] = useState("");
  const [newKasaType, setNewKasaType] = useState<
    "nakit" | "banka" | "kredi_karti" | "birikim"
  >("nakit");
  const [newKasaBalance, setNewKasaBalance] = useState("");
  const [addingKasa, setAddingKasa] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
      fetchIslemler();
      fetchCariler();
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const loadAllData = async () => {
    await fetchProfile();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    if (profile?.restaurant_id) {
      await Promise.all([
        fetchKasalar(),
        fetchIslemler(),
        fetchCariler(),
        fetchPersoneller(),
        fetchPersonelIslemler(),
      ]);
    }
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  // ========== HESAPLAMALAR ==========

  // Hesaplardaki toplam para (tüm kasalar)
  const toplamHesaplar = kasalar
    .filter((k) => !k.is_archived)
    .reduce((sum, k) => sum + k.balance, 0);

  // Tedarikçiler: pozitif bakiye = biz borçluyuz, negatif bakiye = bize borçlu (alacak)
  const tedarikciler = cariler.filter(
    (c) => c.type === "tedarikci" && !c.is_archived
  );
  const tedarikcidenAlacak = tedarikciler
    .filter((c) => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const tedarikciyeBorcumuz = tedarikciler
    .filter((c) => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);

  // Müşteriler: pozitif bakiye = müşteri bize borçlu (alacak), negatif = biz borçluyuz
  const musteriler = cariler.filter(
    (c) => c.type === "musteri" && !c.is_archived
  );
  const musterilerdenAlacak = musteriler
    .filter((c) => c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);
  const musterilereBorcumuz = musteriler
    .filter((c) => c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);

  // Personel: pozitif bakiye = biz borçluyuz (maaş), negatif = personel bize borçlu (avans)
  const aktifPersoneller = personeller.filter((p) => !p.is_archived);
  const personeldenAlacak = aktifPersoneller
    .filter((p) => p.balance < 0)
    .reduce((sum, p) => sum + Math.abs(p.balance), 0);
  const personeleBorcumuz = aktifPersoneller
    .filter((p) => p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);

  // Toplamlar
  const toplamAlacaklar =
    tedarikcidenAlacak + musterilerdenAlacak + personeldenAlacak;
  const toplamBorclar =
    tedarikciyeBorcumuz + musterilereBorcumuz + personeleBorcumuz;

  // Net Durum
  const netDurum = toplamHesaplar + toplamAlacaklar - toplamBorclar;

  // ========== FORM İŞLEMLERİ ==========

  const toggleExpand = (kasaId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedKasaId === kasaId) {
      setExpandedKasaId(null);
      setActiveIslemTipi(null);
    } else {
      setExpandedKasaId(kasaId);
      setActiveIslemTipi(null);
    }
    resetForm();
  };

  const selectIslemTipi = (tipi: IslemTipi) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeIslemTipi === tipi) {
      setActiveIslemTipi(null);
    } else {
      setActiveIslemTipi(tipi);
      if (tipi === "transfer") {
        const otherKasalar = kasalar.filter(
          (k) => k.id !== expandedKasaId && !k.is_archived
        );
        if (otherKasalar.length > 0) setFormTargetKasaId(otherKasalar[0].id);
      }
    }
    resetForm();
  };

  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormAmount("");
    setFormDescription("");
    setFormTargetKasaId(null);
    setFormTargetType(null);
    setFormTargetId(null);
    setFormKategoriId("");
    setShowKategoriPicker(false);
  };

  const handleSubmit = async (kasa: Kasa) => {
    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }
    if (
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat") &&
      !formTargetId
    ) {
      Alert.alert("Hata", "Lütfen bir personel veya cari seçin");
      return;
    }
    if (activeIslemTipi === "transfer" && !formTargetKasaId) {
      Alert.alert("Hata", "Lütfen hedef kasa seçin");
      return;
    }

    setFormLoading(true);
    const amount = parseFloat(formAmount);
    let description = formDescription.trim();

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Kullanıcı bulunamadı");

      if (activeIslemTipi === "gelir") {
        if (!description) description = `${kasa.name} - Gelir`;
        await supabase.from("islemler").insert({
          type: "gelir",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kategori_id: formKategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: amount,
        });
      } else if (activeIslemTipi === "gider") {
        if (!description) description = `${kasa.name} - Gider`;
        await supabase.from("islemler").insert({
          type: "gider",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kategori_id: formKategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: -amount,
        });
      } else if (activeIslemTipi === "odeme") {
        if (formTargetType === "personel") {
          const personel = personeller.find((p) => p.id === formTargetId);
          if (!description)
            description = `${personel?.name || "Personel"} - Ödeme`;
          await supabase.from("personel_islemler").insert({
            type: "odeme",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            personel_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: -amount,
          });
          await supabase.rpc("update_personel_balance", {
            personel_id: formTargetId,
            amount: -amount,
          });
        } else if (formTargetType === "cari") {
          const cari = cariler.find((c) => c.id === formTargetId);
          if (!description) description = `${cari?.name || "Cari"} - Ödeme`;
          await supabase.from("islemler").insert({
            type: "odeme",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            cari_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: -amount,
          });
          await supabase.rpc("update_cari_balance", {
            cari_id: formTargetId,
            amount: -amount,
          });
        }
      } else if (activeIslemTipi === "tahsilat") {
        if (formTargetType === "personel") {
          const personel = personeller.find((p) => p.id === formTargetId);
          if (!description)
            description = `${personel?.name || "Personel"} - Tahsilat`;
          await supabase.from("personel_islemler").insert({
            type: "tahsilat",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            personel_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: amount,
          });
          await supabase.rpc("update_personel_balance", {
            personel_id: formTargetId,
            amount: amount,
          });
        } else if (formTargetType === "cari") {
          const cari = cariler.find((c) => c.id === formTargetId);
          if (!description) description = `${cari?.name || "Cari"} - Tahsilat`;
          await supabase.from("islemler").insert({
            type: "tahsilat",
            amount,
            description,
            date: formDate,
            kasa_id: kasa.id,
            cari_id: formTargetId,
            restaurant_id: profile?.restaurant_id,
            created_by: currentUser.id,
          });
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: amount,
          });
          await supabase.rpc("update_cari_balance", {
            cari_id: formTargetId,
            amount: amount,
          });
        }
      } else if (activeIslemTipi === "transfer") {
        const targetKasa = kasalar.find((k) => k.id === formTargetKasaId);
        if (!description)
          description = `${kasa.name} → ${targetKasa?.name || "Hedef Kasa"}`;
        await supabase.from("islemler").insert({
          type: "transfer",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kasa_hedef_id: formTargetKasaId,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: -amount,
        });
        await supabase.rpc("update_kasa_balance", {
          kasa_id: formTargetKasaId,
          amount: amount,
        });
      }

      Alert.alert("Başarılı", "İşlem kaydedildi");
      resetForm();
      setActiveIslemTipi(null);
      fetchKasalar();
      fetchIslemler();
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchCariler();
    } catch (error) {
      console.error("İşlem hatası:", error);
      Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const selectTarget = (type: "personel" | "cari", id: string) => {
    setFormTargetType(type);
    setFormTargetId(id);
    setShowTargetModal(false);
  };

  const getTargetName = () => {
    if (!formTargetId) return "Seçiniz";
    if (formTargetType === "personel") {
      return personeller.find((p) => p.id === formTargetId)?.name || "Seçiniz";
    }
    return cariler.find((c) => c.id === formTargetId)?.name || "Seçiniz";
  };

  // Hesap Ekleme
  const handleAddKasa = async () => {
    if (!newKasaName.trim()) {
      Alert.alert("Hata", "Hesap adı girin");
      return;
    }

    setAddingKasa(true);
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Kullanıcı bulunamadı");

      const { error } = await supabase.from("kasalar").insert({
        name: newKasaName.trim(),
        type: newKasaType,
        balance: newKasaBalance ? parseFloat(newKasaBalance) : 0,
        restaurant_id: profile?.restaurant_id,
        created_by: currentUser.id,
      });

      if (error) throw error;

      Alert.alert("Başarılı", "Hesap eklendi");
      setNewKasaName("");
      setNewKasaType("nakit");
      setNewKasaBalance("");
      setShowAddKasaModal(false);
      fetchKasalar();
    } catch (error) {
      console.error("Hesap ekleme hatası:", error);
      Alert.alert("Hata", "Hesap eklenirken bir hata oluştu");
    } finally {
      setAddingKasa(false);
    }
  };

  const tumKasalar = kasalar.filter((k) => !k.is_archived);

  const renderKasaCard = (kasa: Kasa) => {
    const isExpanded = expandedKasaId === kasa.id;
    const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
    const IconComponent = iconConfig.icon;
    const otherKasalar = kasalar.filter(
      (k) => k.id !== kasa.id && !k.is_archived
    );

    return (
      <View key={kasa.id} style={styles.kasaCard}>
        <TouchableOpacity
          style={styles.kasaCardHeader}
          onPress={() => toggleExpand(kasa.id)}
          activeOpacity={0.7}
        >
          <View style={styles.kasaLeft}>
            <View
              style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}
            >
              <IconComponent size={20} color={iconConfig.color} />
            </View>
            <View style={styles.kasaInfo}>
              <Text style={styles.kasaName}>{kasa.name}</Text>
              <Text style={styles.kasaType}>
                {kasa.type === "nakit"
                  ? "Nakit"
                  : kasa.type === "banka"
                  ? "Banka"
                  : kasa.type === "kredi_karti"
                  ? "Kredi Kartı"
                  : "Birikim"}
              </Text>
            </View>
          </View>
          <View style={styles.kasaRight}>
            <Text
              style={[
                styles.kasaBalance,
                kasa.balance < 0 && styles.negativeText,
              ]}
            >
              {formatCurrency(kasa.balance)}
            </Text>
            {isExpanded ? (
              <ChevronUp size={18} color="#9ca3af" />
            ) : (
              <ChevronDown size={18} color="#9ca3af" />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Hesap Detayları Butonu */}
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => router.push(`/kasadetay?id=${kasa.id}`)}
            >
              <Info size={18} color="#6b7280" />
              <Text style={styles.historyBtnText}>Hesap Detaylarını Gör</Text>
              <ChevronRight size={18} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.islemBtnRow}>
              <TouchableOpacity
                style={[
                  styles.islemBtn,
                  activeIslemTipi === "gelir" && {
                    backgroundColor: "#10b981",
                    borderColor: "#10b981",
                  },
                ]}
                onPress={() => selectIslemTipi("gelir")}
              >
                <ArrowDownLeft
                  size={16}
                  color={activeIslemTipi === "gelir" ? "#fff" : "#10b981"}
                />
                <Text
                  style={[
                    styles.islemBtnText,
                    { color: activeIslemTipi === "gelir" ? "#fff" : "#10b981" },
                  ]}
                >
                  Gelir
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.islemBtn,
                  activeIslemTipi === "gider" && {
                    backgroundColor: "#ef4444",
                    borderColor: "#ef4444",
                  },
                ]}
                onPress={() => selectIslemTipi("gider")}
              >
                <ArrowUpRight
                  size={16}
                  color={activeIslemTipi === "gider" ? "#fff" : "#ef4444"}
                />
                <Text
                  style={[
                    styles.islemBtnText,
                    { color: activeIslemTipi === "gider" ? "#fff" : "#ef4444" },
                  ]}
                >
                  Gider
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.islemBtn,
                  activeIslemTipi === "odeme" && {
                    backgroundColor: "#3b82f6",
                    borderColor: "#3b82f6",
                  },
                ]}
                onPress={() => selectIslemTipi("odeme")}
              >
                <ArrowUpRight
                  size={16}
                  color={activeIslemTipi === "odeme" ? "#fff" : "#3b82f6"}
                />
                <Text
                  style={[
                    styles.islemBtnText,
                    { color: activeIslemTipi === "odeme" ? "#fff" : "#3b82f6" },
                  ]}
                >
                  Ödeme
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.islemBtnRow}>
              <TouchableOpacity
                style={[
                  styles.islemBtn,
                  activeIslemTipi === "tahsilat" && {
                    backgroundColor: "#8b5cf6",
                    borderColor: "#8b5cf6",
                  },
                ]}
                onPress={() => selectIslemTipi("tahsilat")}
              >
                <ArrowDownLeft
                  size={16}
                  color={activeIslemTipi === "tahsilat" ? "#fff" : "#8b5cf6"}
                />
                <Text
                  style={[
                    styles.islemBtnText,
                    {
                      color:
                        activeIslemTipi === "tahsilat" ? "#fff" : "#8b5cf6",
                    },
                  ]}
                >
                  Tahsilat
                </Text>
              </TouchableOpacity>
              {otherKasalar.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.islemBtn,
                    activeIslemTipi === "transfer" && {
                      backgroundColor: "#f59e0b",
                      borderColor: "#f59e0b",
                    },
                  ]}
                  onPress={() => selectIslemTipi("transfer")}
                >
                  <ArrowRightLeft
                    size={16}
                    color={activeIslemTipi === "transfer" ? "#fff" : "#f59e0b"}
                  />
                  <Text
                    style={[
                      styles.islemBtnText,
                      {
                        color:
                          activeIslemTipi === "transfer" ? "#fff" : "#f59e0b",
                      },
                    ]}
                  >
                    Transfer
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {activeIslemTipi && (
              <View style={styles.formContainer}>
                <TouchableOpacity
                  style={styles.dateRow}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.dateText}>{formatDate(formDate)}</Text>
                  <ChevronDown size={16} color="#6b7280" />
                </TouchableOpacity>

                {/* iOS Date Picker */}
                {showDatePicker && Platform.OS === "ios" && (
                  <View style={styles.iosDatePicker}>
                    <DateTimePicker
                      value={new Date(formDate)}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => {
                        if (date) setFormDate(date.toISOString().split("T")[0]);
                      }}
                      locale="tr-TR"
                    />
                    <TouchableOpacity
                      style={styles.datePickerDoneBtn}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.datePickerDoneBtnText}>Tamam</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Android Date Picker */}
                {showDatePicker && Platform.OS === "android" && (
                  <DateTimePicker
                    value={new Date(formDate)}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setFormDate(date.toISOString().split("T")[0]);
                    }}
                  />
                )}

                {(activeIslemTipi === "odeme" ||
                  activeIslemTipi === "tahsilat") && (
                  <View>
                    <Text style={styles.formLabel}>
                      {activeIslemTipi === "odeme"
                        ? "Kime Ödeme?"
                        : "Kimden Tahsilat?"}
                    </Text>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() => setShowTargetModal(true)}
                    >
                      <Text style={styles.selectBtnText}>
                        {getTargetName()}
                      </Text>
                      <ChevronRight size={18} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                )}

                {activeIslemTipi === "transfer" && (
                  <View>
                    <Text style={styles.formLabel}>Hedef Kasa</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.chipRow}>
                        {otherKasalar.map((k) => {
                          const kIcon = kasaIcons[k.type] || kasaIcons.nakit;
                          const KIcon = kIcon.icon;
                          return (
                            <TouchableOpacity
                              key={k.id}
                              style={[
                                styles.chip,
                                formTargetKasaId === k.id && styles.chipActive,
                              ]}
                              onPress={() => setFormTargetKasaId(k.id)}
                            >
                              <KIcon
                                size={14}
                                color={
                                  formTargetKasaId === k.id
                                    ? "#fff"
                                    : kIcon.color
                                }
                              />
                              <Text
                                style={[
                                  styles.chipText,
                                  formTargetKasaId === k.id &&
                                    styles.chipTextActive,
                                ]}
                              >
                                {k.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {(activeIslemTipi === "gelir" ||
                  activeIslemTipi === "gider") && (
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => setShowKategoriPicker(true)}
                  >
                    <Text
                      style={[
                        styles.selectBtnText,
                        !formKategoriId && { color: "#9ca3af" },
                      ]}
                    >
                      {formKategoriId
                        ? kategoriler.find((k) => k.id === formKategoriId)?.name
                        : "Kategori (opsiyonel)"}
                    </Text>
                    <ChevronDown size={18} color="#6b7280" />
                  </TouchableOpacity>
                )}

                <TextInput
                  style={styles.input}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Açıklama (opsiyonel)"
                  placeholderTextColor="#9ca3af"
                />

                <View style={styles.amountRow}>
                  <View style={styles.amountInputBox}>
                    <Text style={styles.currencySymbol}>₺</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={formAmount}
                      onChangeText={setFormAmount}
                      placeholder="0"
                      placeholderTextColor="#d1d5db"
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      {
                        backgroundColor:
                          activeIslemTipi === "gelir"
                            ? "#10b981"
                            : activeIslemTipi === "gider"
                            ? "#ef4444"
                            : activeIslemTipi === "odeme"
                            ? "#3b82f6"
                            : activeIslemTipi === "tahsilat"
                            ? "#8b5cf6"
                            : "#f59e0b",
                      },
                      formLoading && { opacity: 0.6 },
                    ]}
                    onPress={() => handleSubmit(kasa)}
                    disabled={formLoading}
                  >
                    <Text style={styles.submitBtnText}>
                      {formLoading ? "..." : "Kaydet"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Merhaba, {profile?.name?.split(" ")[0] || "Kullanıcı"}
          </Text>
        </View>

        {/* ========== FİNANSAL ÖZET PANELİ ========== */}
        <View style={styles.summaryPanel}>
          {/* Üst Satır: Varlıklar ve Borçlar */}
          <View style={styles.summaryRow}>
            {/* Sol: Varlıklar */}
            <View style={styles.summaryColumn}>
              <View style={styles.summaryHeader}>
                <TrendingUp size={16} color="#10b981" />
                <Text style={styles.summaryHeaderText}>Varlıklar</Text>
              </View>

              <View style={styles.summaryMainItem}>
                <Wallet size={16} color="#3b82f6" />
                <Text style={styles.summaryItemLabel}>Hesaplarım</Text>
                <Text
                  style={[
                    styles.summaryItemValue,
                    toplamHesaplar < 0 && styles.negativeText,
                  ]}
                >
                  {formatCurrency(toplamHesaplar)}
                </Text>
              </View>

              {tedarikcidenAlacak > 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Tedarikçilerden</Text>
                  <Text style={styles.summarySubValue}>
                    {formatCurrency(tedarikcidenAlacak)}
                  </Text>
                </View>
              )}

              {musterilerdenAlacak > 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Müşterilerden</Text>
                  <Text style={styles.summarySubValue}>
                    {formatCurrency(musterilerdenAlacak)}
                  </Text>
                </View>
              )}

              {personeldenAlacak > 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Personelden</Text>
                  <Text style={styles.summarySubValue}>
                    {formatCurrency(personeldenAlacak)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Toplam</Text>
                <Text style={[styles.summaryTotalValue, { color: "#10b981" }]}>
                  {formatCurrency(toplamHesaplar + toplamAlacaklar)}
                </Text>
              </View>
            </View>

            {/* Dikey Çizgi */}
            <View style={styles.divider} />

            {/* Sağ: Borçlar */}
            <View style={styles.summaryColumn}>
              <View style={styles.summaryHeader}>
                <TrendingDown size={16} color="#ef4444" />
                <Text style={[styles.summaryHeaderText, { color: "#ef4444" }]}>
                  Borçlar
                </Text>
              </View>

              {tedarikciyeBorcumuz > 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Tedarikçilere</Text>
                  <Text style={[styles.summarySubValue, styles.negativeText]}>
                    {formatCurrency(tedarikciyeBorcumuz)}
                  </Text>
                </View>
              )}

              {personeleBorcumuz > 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Personele</Text>
                  <Text style={[styles.summarySubValue, styles.negativeText]}>
                    {formatCurrency(personeleBorcumuz)}
                  </Text>
                </View>
              )}

              {musterilereBorcumuz > 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Müşterilere</Text>
                  <Text style={[styles.summarySubValue, styles.negativeText]}>
                    {formatCurrency(musterilereBorcumuz)}
                  </Text>
                </View>
              )}

              {toplamBorclar === 0 && (
                <View style={styles.summarySubItem}>
                  <Text style={styles.summarySubLabel}>Borcunuz yok</Text>
                  <Text style={styles.summarySubValue}>₺0</Text>
                </View>
              )}

              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Toplam</Text>
                <Text style={[styles.summaryTotalValue, { color: "#ef4444" }]}>
                  {toplamBorclar > 0 ? "-" : ""}
                  {formatCurrency(toplamBorclar)}
                </Text>
              </View>
            </View>
          </View>

          {/* Net Durum */}
          <View
            style={[
              styles.netDurumBox,
              netDurum >= 0 ? styles.netDurumPositive : styles.netDurumNegative,
            ]}
          >
            <View style={styles.netDurumLeft}>
              <Scale size={20} color={netDurum >= 0 ? "#10b981" : "#ef4444"} />
              <Text style={styles.netDurumLabel}>Net Durum</Text>
            </View>
            <Text
              style={[
                styles.netDurumValue,
                netDurum >= 0 ? { color: "#10b981" } : { color: "#ef4444" },
              ]}
            >
              {netDurum >= 0 ? "+" : ""}
              {formatCurrency(netDurum)}
            </Text>
          </View>
        </View>

        {/* ========== HESAPLAR ========== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hesaplarım</Text>
            <TouchableOpacity
              style={styles.addKasaBtn}
              onPress={() => setShowAddKasaModal(true)}
            >
              <Plus size={16} color="#3b82f6" />
              <Text style={styles.addKasaBtnText}>Hesap Ekle</Text>
            </TouchableOpacity>
          </View>

          {tumKasalar.length > 0 ? (
            <View style={styles.kasaList}>
              {tumKasalar.map((kasa) => renderKasaCard(kasa))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() => setShowAddKasaModal(true)}
            >
              <Wallet size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>Kasa eklemek için tıklayın</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ========== HIZLI İŞLEMLER ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => setShowCiroModal(true)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#dcfce7" }]}
              >
                <TrendingUp size={22} color="#10b981" />
              </View>
              <Text style={styles.quickActionText}>Günlük Ciro Gir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => setShowHakedisModal(true)}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#ede9fe" }]}
              >
                <Banknote size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.quickActionText}>Personel Hakediş</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Hedef Seçme Modal */}
      <Modal
        visible={showTargetModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTargetModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {activeIslemTipi === "odeme" ? "Kime Ödeme?" : "Kimden Tahsilat?"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {aktifPersoneller.length > 0 && (
              <>
                <Text style={styles.modalSectionTitle}>Personel</Text>
                {aktifPersoneller.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.targetItem}
                    onPress={() => selectTarget("personel", p.id)}
                  >
                    <View
                      style={[
                        styles.targetItemIcon,
                        { backgroundColor: "#fef3c7" },
                      ]}
                    >
                      <Users size={18} color="#f59e0b" />
                    </View>
                    <View style={styles.targetItemInfo}>
                      <Text style={styles.targetItemName}>{p.name}</Text>
                      <Text style={styles.targetItemBalance}>
                        Bakiye: {formatCurrency(p.balance)}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {tedarikciler.length > 0 && (
              <>
                <Text style={[styles.modalSectionTitle, { marginTop: 20 }]}>
                  Tedarikçiler
                </Text>
                {tedarikciler.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.targetItem}
                    onPress={() => selectTarget("cari", c.id)}
                  >
                    <View
                      style={[
                        styles.targetItemIcon,
                        { backgroundColor: "#fee2e2" },
                      ]}
                    >
                      <Truck size={18} color="#ef4444" />
                    </View>
                    <View style={styles.targetItemInfo}>
                      <Text style={styles.targetItemName}>{c.name}</Text>
                      <Text style={styles.targetItemBalance}>
                        Bakiye: {formatCurrency(c.balance)}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {musteriler.length > 0 && (
              <>
                <Text style={[styles.modalSectionTitle, { marginTop: 20 }]}>
                  Müşteriler
                </Text>
                {musteriler.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.targetItem}
                    onPress={() => selectTarget("cari", c.id)}
                  >
                    <View
                      style={[
                        styles.targetItemIcon,
                        { backgroundColor: "#dcfce7" },
                      ]}
                    >
                      <ShoppingBag size={18} color="#10b981" />
                    </View>
                    <View style={styles.targetItemInfo}>
                      <Text style={styles.targetItemName}>{c.name}</Text>
                      <Text style={styles.targetItemBalance}>
                        Bakiye: {formatCurrency(c.balance)}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Kategori Seçme Modal - Tam Ekran */}
      <Modal
        visible={showKategoriPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowKategoriPicker(false);
          setKategoriSearch("");
        }}
      >
        <SafeAreaView style={styles.kategoriModalContainer}>
          <View style={styles.kategoriModalHeader}>
            <Text style={styles.kategoriModalTitle}>Kategori Seç</Text>
            <TouchableOpacity
              style={styles.kategoriModalCloseBtn}
              onPress={() => {
                setShowKategoriPicker(false);
                setKategoriSearch("");
              }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

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

          {/* Kategori Listesi */}
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
                setShowKategoriPicker(false);
                setKategoriSearch("");
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

            {/* Ana kategoriler ve alt kategoriler */}
            {kategoriler
              .filter((k) => k.type === activeIslemTipi && !k.parent_id)
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
                    {/* Ana Kategori */}
                    <TouchableOpacity
                      style={[
                        styles.kategoriAnaBaslik,
                        formKategoriId === anaKategori.id &&
                          styles.kategoriModalItemActive,
                      ]}
                      onPress={() => {
                        setFormKategoriId(anaKategori.id);
                        setShowKategoriPicker(false);
                        setKategoriSearch("");
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
                          setShowKategoriPicker(false);
                          setKategoriSearch("");
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

            {kategoriler.filter((k) => k.type === activeIslemTipi).length ===
              0 && (
              <View style={styles.emptyKategori}>
                <Text style={styles.emptyKategoriText}>
                  Henüz kategori eklenmemiş
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Hesap Ekleme Modal */}
      <Modal visible={showAddKasaModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.addKasaModal}>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.addKasaTitle}>Yeni Hesap Ekle</Text>

                    <Text style={styles.addKasaLabel}>Hesap Adı</Text>
                    <TextInput
                      style={styles.addKasaInput}
                      value={newKasaName}
                      onChangeText={setNewKasaName}
                      placeholder="Örn: Ana Kasa, Ziraat Bankası"
                      placeholderTextColor="#9ca3af"
                    />

                    <Text style={styles.addKasaLabel}>Hesap Türü</Text>
                    <View style={styles.kasaTypeRow}>
                      {[
                        {
                          type: "nakit",
                          label: "Nakit",
                          icon: Wallet,
                          color: "#10b981",
                        },
                        {
                          type: "banka",
                          label: "Banka",
                          icon: Building2,
                          color: "#3b82f6",
                        },
                        {
                          type: "kredi_karti",
                          label: "Kredi K.",
                          icon: CreditCard,
                          color: "#f59e0b",
                        },
                        {
                          type: "birikim",
                          label: "Birikim",
                          icon: PiggyBank,
                          color: "#8b5cf6",
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <TouchableOpacity
                            key={item.type}
                            style={[
                              styles.kasaTypeBtn,
                              newKasaType === item.type && {
                                backgroundColor: item.color,
                                borderColor: item.color,
                              },
                            ]}
                            onPress={() => setNewKasaType(item.type as any)}
                          >
                            <Icon
                              size={16}
                              color={
                                newKasaType === item.type ? "#fff" : item.color
                              }
                            />
                            <Text
                              style={[
                                styles.kasaTypeBtnText,
                                newKasaType === item.type && { color: "#fff" },
                              ]}
                            >
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={styles.addKasaLabel}>
                      Açılış Bakiyesi (Opsiyonel)
                    </Text>
                    <View style={styles.addKasaAmountRow}>
                      <Text style={styles.addKasaCurrency}>₺</Text>
                      <TextInput
                        style={styles.addKasaAmountInput}
                        value={newKasaBalance}
                        onChangeText={setNewKasaBalance}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.addKasaBtnRow}>
                      <TouchableOpacity
                        style={styles.addKasaCancelBtn}
                        onPress={() => {
                          Keyboard.dismiss();
                          setShowAddKasaModal(false);
                        }}
                      >
                        <Text style={styles.addKasaCancelBtnText}>İptal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.addKasaSaveBtn,
                          addingKasa && { opacity: 0.6 },
                        ]}
                        onPress={handleAddKasa}
                        disabled={addingKasa}
                      >
                        <Text style={styles.addKasaSaveBtnText}>
                          {addingKasa ? "..." : "Ekle"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <GunlukCiroModal
        visible={showCiroModal}
        onClose={() => setShowCiroModal(false)}
      />
      <HakedisModal
        visible={showHakedisModal}
        onClose={() => setShowHakedisModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { paddingVertical: 16 },
  greeting: { fontSize: 20, fontWeight: "600", color: "#111827" },

  // Finansal Özet Panel
  summaryPanel: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: "row" },
  summaryColumn: { flex: 1 },
  divider: { width: 1, backgroundColor: "#e5e7eb", marginHorizontal: 12 },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  summaryHeaderText: { fontSize: 14, fontWeight: "600", color: "#10b981" },
  summaryMainItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  summaryItemLabel: { flex: 1, fontSize: 13, color: "#6b7280" },
  summaryItemValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  summarySubItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 22,
    marginBottom: 6,
  },
  summarySubLabel: { fontSize: 12, color: "#9ca3af" },
  summarySubValue: { fontSize: 12, fontWeight: "500", color: "#10b981" },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 8,
    marginTop: 8,
  },
  summaryTotalLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  summaryTotalValue: { fontSize: 14, fontWeight: "700" },

  // Net Durum
  netDurumBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  netDurumPositive: { backgroundColor: "#dcfce7" },
  netDurumNegative: { backgroundColor: "#fee2e2" },
  netDurumLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  netDurumLabel: { fontSize: 15, fontWeight: "600", color: "#374151" },
  netDurumValue: { fontSize: 20, fontWeight: "700" },

  negativeText: { color: "#ef4444" },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: "#111827" },
  sectionLink: { fontSize: 14, color: "#3b82f6", fontWeight: "500" },

  // Kasa Kartları
  kasaList: { gap: 10 },
  kasaCard: { backgroundColor: "#fff", borderRadius: 14, overflow: "hidden" },
  kasaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  kasaLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  kasaIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  kasaInfo: { marginLeft: 12, flex: 1 },
  kasaName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  kasaType: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  kasaRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  kasaBalance: { fontSize: 15, fontWeight: "700", color: "#111827" },

  // Expanded
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
  },
  historyBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  islemBtnRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  islemBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  islemBtnText: { fontSize: 13, fontWeight: "600" },

  // Form
  formContainer: { marginTop: 14, gap: 10 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  dateText: { fontSize: 14, color: "#374151", flex: 1 },
  iosDatePicker: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  datePickerDoneBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    alignItems: "center",
  },
  datePickerDoneBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  selectBtnText: { fontSize: 14, color: "#111827" },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  chipActive: { backgroundColor: "#f59e0b" },
  chipText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  chipTextActive: { color: "#fff" },
  // Picker Modal
  pickerOverlay: {
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
    overflow: "hidden",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerList: { maxHeight: 300 },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerItemSelected: { backgroundColor: "#dcfce7" },
  pickerItemText: { fontSize: 15, color: "#111827" },
  emptyPickerText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    padding: 20,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  amountRow: { flexDirection: "row", gap: 10 },
  amountInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9ca3af",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 10,
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyText: { fontSize: 14, color: "#6b7280", marginTop: 12 },

  // Quick Actions
  quickActionsRow: { flexDirection: "row", gap: 12 },
  quickActionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },

  // Modal
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
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  modalContent: { flex: 1, padding: 16 },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
  },
  targetItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  targetItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  targetItemInfo: { flex: 1, marginLeft: 12 },
  targetItemName: { fontSize: 15, fontWeight: "600", color: "#111827" },
  targetItemBalance: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  // Hesap Ekle Butonu
  addKasaBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addKasaBtnText: { fontSize: 14, color: "#3b82f6", fontWeight: "500" },

  // Hesap Ekleme Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addKasaModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxHeight: "80%",
    padding: 20,
  },
  addKasaTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  addKasaLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  addKasaInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kasaTypeRow: { flexDirection: "row", gap: 8 },
  kasaTypeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    gap: 4,
  },
  kasaTypeBtnText: { fontSize: 11, fontWeight: "600", color: "#6b7280" },
  addKasaAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addKasaCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 4,
  },
  addKasaAmountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  addKasaBtnRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  addKasaCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  addKasaCancelBtnText: { fontSize: 15, fontWeight: "600", color: "#6b7280" },
  addKasaSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  addKasaSaveBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },

  // Kategori Modal Stilleri
  kategoriModalContainer: { flex: 1, backgroundColor: "#fff" },
  kategoriModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  kategoriModalTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  kategoriModalCloseBtn: { padding: 4 },
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
  kategoriScrollView: { flex: 1 },
  kategoriListContent: { paddingHorizontal: 16, paddingBottom: 30 },
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
  kategoriModalItemText: { fontSize: 16, color: "#374151" },
  kategoriModalItemTextActive: { color: "#10b981", fontWeight: "600" },
  kategoriSeparator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 8,
  },
  kategoriGroup: { marginBottom: 16 },
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
  kategoriAltItemText: { fontSize: 15, color: "#4b5563" },
  emptyKategori: { paddingVertical: 40, alignItems: "center" },
  emptyKategoriText: { fontSize: 14, color: "#9ca3af" },
});
