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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useStore } from "../../src/store/useStore";
import GunlukCiroModal from "../../src/components/GunlukCiroModal";
import HakedisModal from "../../src/components/HakedisModal";
import DatePickerField from "../../src/components/DatePickerField";
import { Kasa } from "../../src/types";
import { supabase } from "../../src/lib/supabase";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CreditCard,
  Users,
  UserCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRightLeft,
  X,
  Truck,
  ShoppingBag,
  Receipt,
  HandCoins,
  CircleDollarSign,
  Sparkles,
} from "lucide-react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

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
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTargetKasaId, setFormTargetKasaId] = useState<string | null>(null);
  const [formTargetType, setFormTargetType] = useState<
    "personel" | "cari" | null
  >(null);
  const [formTargetId, setFormTargetId] = useState<string | null>(null);
  const [formKategoriId, setFormKategoriId] = useState<string>("");
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);

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

  // Hesaplamalar
  const totalKasaBakiye = kasalar
    .filter((k) => !k.is_archived)
    .reduce((sum, k) => sum + k.balance, 0);
  const totalCariBorcumuz = cariler
    .filter((c) => !c.is_archived && c.balance > 0)
    .reduce((sum, c) => sum + c.balance, 0);
  const totalCariAlacagimiz = cariler
    .filter((c) => !c.is_archived && c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const totalPersonelBorcumuz = personeller
    .filter((p) => !p.is_archived && p.balance > 0)
    .reduce((sum, p) => sum + p.balance, 0);
  const genelDurum =
    totalKasaBakiye +
    totalCariAlacagimiz -
    totalCariBorcumuz -
    totalPersonelBorcumuz;

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
        if (!description) description = "Kasalar arası transfer";
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
      fetchCariler();
      fetchPersoneller();
      fetchPersonelIslemler();
    } catch (error: any) {
      Alert.alert("Hata", error.message || "İşlem kaydedilemedi");
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
    if (formTargetType === "personel")
      return personeller.find((p) => p.id === formTargetId)?.name || "Seçiniz";
    return cariler.find((c) => c.id === formTargetId)?.name || "Seçiniz";
  };

  const today = new Date();
  const greeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

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
          <View
            style={[
              styles.kasaIconBox,
              { backgroundColor: iconConfig.bgColor },
            ]}
          >
            <IconComponent size={20} color={iconConfig.color} />
          </View>
          <View style={styles.kasaInfo}>
            <Text style={styles.kasaName}>{kasa.name}</Text>
            <Text style={styles.kasaType}>
              {kasa.type === "nakit"
                ? "Nakit"
                : kasa.type === "banka"
                ? "Banka Hesabı"
                : kasa.type === "kredi_karti"
                ? "Kredi Kartı"
                : "Birikim"}
            </Text>
          </View>
          <View style={styles.kasaRight}>
            <Text
              style={[
                styles.kasaBalance,
                kasa.balance < 0 && styles.kasaBalanceNegative,
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
            <View style={styles.islemGrid}>
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
                  size={18}
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
                  size={18}
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
                  size={18}
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
                  size={18}
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
            </View>

            {otherKasalar.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.transferBtn,
                  activeIslemTipi === "transfer" && {
                    backgroundColor: "#f59e0b",
                    borderColor: "#f59e0b",
                  },
                ]}
                onPress={() => selectIslemTipi("transfer")}
              >
                <ArrowRightLeft
                  size={18}
                  color={activeIslemTipi === "transfer" ? "#fff" : "#f59e0b"}
                />
                <Text
                  style={[
                    styles.transferBtnText,
                    activeIslemTipi === "transfer" && { color: "#fff" },
                  ]}
                >
                  Transfer
                </Text>
              </TouchableOpacity>
            )}

            {activeIslemTipi && (
              <View style={styles.formContainer}>
                <DatePickerField value={formDate} onChange={setFormDate} />

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
                      <View style={styles.kasaChipRow}>
                        {otherKasalar.map((k) => {
                          const kIconConfig =
                            kasaIcons[k.type] || kasaIcons.nakit;
                          const KIcon = kIconConfig.icon;
                          return (
                            <TouchableOpacity
                              key={k.id}
                              style={[
                                styles.kasaChip,
                                formTargetKasaId === k.id &&
                                  styles.kasaChipActive,
                              ]}
                              onPress={() => setFormTargetKasaId(k.id)}
                            >
                              <KIcon
                                size={14}
                                color={
                                  formTargetKasaId === k.id
                                    ? "#fff"
                                    : kIconConfig.color
                                }
                              />
                              <Text
                                style={[
                                  styles.kasaChipText,
                                  formTargetKasaId === k.id &&
                                    styles.kasaChipTextActive,
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
                  <View style={{ zIndex: 10 }}>
                    <TouchableOpacity
                      style={styles.selectBtn}
                      onPress={() => setShowKategoriPicker(!showKategoriPicker)}
                    >
                      <Text
                        style={[
                          styles.selectBtnText,
                          !formKategoriId && { color: "#9ca3af" },
                        ]}
                      >
                        {formKategoriId
                          ? kategoriler.find((k) => k.id === formKategoriId)
                              ?.name || "Kategori Seç"
                          : "Kategori Seç (Opsiyonel)"}
                      </Text>
                      <ChevronDown size={18} color="#6b7280" />
                    </TouchableOpacity>
                    {showKategoriPicker && (
                      <ScrollView
                        style={styles.kategoriList}
                        nestedScrollEnabled
                      >
                        {kategoriler
                          .filter(
                            (k) =>
                              k.type ===
                              (activeIslemTipi === "gelir" ? "gelir" : "gider")
                          )
                          .map((k) => (
                            <TouchableOpacity
                              key={k.id}
                              style={[
                                styles.kategoriItem,
                                formKategoriId === k.id &&
                                  styles.kategoriItemActive,
                              ]}
                              onPress={() => {
                                setFormKategoriId(k.id);
                                setShowKategoriPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.kategoriItemText,
                                  formKategoriId === k.id &&
                                    styles.kategoriItemTextActive,
                                ]}
                              >
                                {k.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                      </ScrollView>
                    )}
                  </View>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Açıklama (opsiyonel)"
                  placeholderTextColor="#9ca3af"
                  value={formDescription}
                  onChangeText={setFormDescription}
                />

                <View style={styles.amountRow}>
                  <View style={styles.amountInputBox}>
                    <Text style={styles.currencySymbol}>₺</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      placeholderTextColor="#d1d5db"
                      keyboardType="numeric"
                      value={formAmount}
                      onChangeText={setFormAmount}
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

            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() =>
                router.push({ pathname: "/kasadetay", params: { id: kasa.id } })
              }
            >
              <Text style={styles.viewAllBtnText}>Tüm Hareketler</Text>
              <ChevronRight size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#1e3a5f", "#2d5a87"]}
          style={styles.heroSection}
        >
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroGreeting}>{greeting()}</Text>
              <Text style={styles.heroName}>
                {profile?.name?.split(" ")[0] || "Kullanıcı"}
              </Text>
            </View>
            <View style={styles.heroIconBox}>
              <Sparkles size={24} color="#fbbf24" />
            </View>
          </View>

          <View style={styles.heroBalanceBox}>
            <Text style={styles.heroBalanceLabel}>Toplam Varlık</Text>
            <Text style={styles.heroBalanceValue}>
              {formatCurrency(totalKasaBakiye)}
            </Text>
            <View style={styles.heroTrendRow}>
              {genelDurum >= 0 ? (
                <TrendingUp size={16} color="#4ade80" />
              ) : (
                <TrendingDown size={16} color="#f87171" />
              )}
              <Text
                style={[
                  styles.heroTrendText,
                  genelDurum >= 0 ? { color: "#4ade80" } : { color: "#f87171" },
                ]}
              >
                Net Durum: {formatCurrency(genelDurum)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Finansal Özet */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <TouchableOpacity
              style={styles.summaryCard}
              onPress={() => router.push("/cari")}
            >
              <View
                style={[styles.summaryIconBox, { backgroundColor: "#fef3c7" }]}
              >
                <Truck size={20} color="#f59e0b" />
              </View>
              <Text style={styles.summaryLabel}>Cari Borç</Text>
              <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                {formatCurrency(totalCariBorcumuz)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.summaryCard}
              onPress={() => router.push("/cari")}
            >
              <View
                style={[styles.summaryIconBox, { backgroundColor: "#dcfce7" }]}
              >
                <CircleDollarSign size={20} color="#10b981" />
              </View>
              <Text style={styles.summaryLabel}>Cari Alacak</Text>
              <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                {formatCurrency(totalCariAlacagimiz)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.summaryCard}
              onPress={() => router.push("/personel")}
            >
              <View
                style={[styles.summaryIconBox, { backgroundColor: "#dbeafe" }]}
              >
                <Users size={20} color="#3b82f6" />
              </View>
              <Text style={styles.summaryLabel}>Personel Borç</Text>
              <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                {formatCurrency(totalPersonelBorcumuz)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setShowCiroModal(true)}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.quickActionGradient}
              >
                <Receipt size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Günlük Ciro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setShowHakedisModal(true)}
            >
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                style={styles.quickActionGradient}
              >
                <HandCoins size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Hakediş</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/cari")}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                style={styles.quickActionGradient}
              >
                <Truck size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Cariler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/personel")}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.quickActionGradient}
              >
                <Users size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Personel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hesaplar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hesaplarım</Text>
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => router.push("/kasa")}
            >
              <Text style={styles.seeAllText}>Tümü</Text>
              <ChevronRight size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {kasalar.filter((k) => !k.is_archived).length === 0 ? (
            <View style={styles.emptyState}>
              <Wallet size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>Henüz hesap yok</Text>
              <Text style={styles.emptyDesc}>
                İlk hesabınızı ekleyerek başlayın
              </Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/kasa")}
              >
                <Plus size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Hesap Ekle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.kasaList}>
              {kasalar.filter((k) => !k.is_archived).map(renderKasaCard)}
            </View>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Target Selection Modal */}
      <Modal visible={showTargetModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeIslemTipi === "odeme" ? "Kime Ödeme?" : "Kimden Tahsilat?"}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowTargetModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {personeller.filter((p) => !p.is_archived).length > 0 && (
              <>
                <Text style={styles.modalSectionTitle}>Personel</Text>
                {personeller
                  .filter((p) => !p.is_archived)
                  .map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={styles.targetItem}
                      onPress={() => selectTarget("personel", p.id)}
                    >
                      <View
                        style={[
                          styles.targetItemIcon,
                          { backgroundColor: "#dbeafe" },
                        ]}
                      >
                        <UserCheck size={20} color="#3b82f6" />
                      </View>
                      <View style={styles.targetItemInfo}>
                        <Text style={styles.targetItemName}>{p.name}</Text>
                        <Text style={styles.targetItemBalance}>
                          Bakiye: {formatCurrency(p.balance)}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))}
              </>
            )}
            {cariler.filter((c) => !c.is_archived).length > 0 && (
              <>
                <Text style={[styles.modalSectionTitle, { marginTop: 24 }]}>
                  Cariler
                </Text>
                {cariler
                  .filter((c) => !c.is_archived)
                  .map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.targetItem}
                      onPress={() => selectTarget("cari", c.id)}
                    >
                      <View
                        style={[
                          styles.targetItemIcon,
                          { backgroundColor: "#fef3c7" },
                        ]}
                      >
                        {c.type === "tedarikci" ? (
                          <Truck size={20} color="#f59e0b" />
                        ) : (
                          <ShoppingBag size={20} color="#f59e0b" />
                        )}
                      </View>
                      <View style={styles.targetItemInfo}>
                        <Text style={styles.targetItemName}>{c.name}</Text>
                        <Text style={styles.targetItemBalance}>
                          Bakiye: {formatCurrency(c.balance)}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Hero Section
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  heroGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  heroName: { fontSize: 24, fontWeight: "700", color: "#fff" },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBalanceBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
  },
  heroBalanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  heroBalanceValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  heroTrendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroTrendText: { fontSize: 13, fontWeight: "600" },

  // Summary Section
  summarySection: { paddingHorizontal: 16, marginTop: -15 },
  summaryGrid: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 11, color: "#6b7280", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: "700" },

  // Sections
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 14,
  },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 14, color: "#3b82f6", fontWeight: "600" },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: -4,
  },
  quickActionCard: { width: (width - 44) / 4, alignItems: "center" },
  quickActionGradient: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
    textAlign: "center",
  },

  // Kasa Cards
  kasaList: { gap: 12 },
  kasaCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  kasaCardHeader: { flexDirection: "row", alignItems: "center", padding: 16 },
  kasaIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  kasaInfo: { flex: 1, marginLeft: 12 },
  kasaName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  kasaType: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  kasaRight: { alignItems: "flex-end", gap: 4 },
  kasaBalance: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  kasaBalanceNegative: { color: "#ef4444" },

  // Expanded Content
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  islemGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  islemBtn: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  islemBtnText: { fontSize: 13, fontWeight: "600" },
  transferBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fcd34d",
    marginTop: 8,
  },
  transferBtnText: { fontSize: 13, fontWeight: "600", color: "#f59e0b" },

  // Form
  formContainer: { marginTop: 16, gap: 12 },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectBtnText: { fontSize: 14, color: "#1f2937" },
  kasaChipRow: { flexDirection: "row", gap: 8 },
  kasaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  kasaChipActive: { backgroundColor: "#f59e0b" },
  kasaChipText: { fontSize: 13, fontWeight: "500", color: "#4b5563" },
  kasaChipTextActive: { color: "#fff" },
  kategoriList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 140,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kategoriItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriItemActive: { backgroundColor: "#dcfce7" },
  kategoriItemText: { fontSize: 14, color: "#1f2937" },
  kategoriItemTextActive: { color: "#10b981", fontWeight: "600" },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1f2937",
  },
  amountRow: { flexDirection: "row", gap: 10 },
  amountInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    paddingVertical: 12,
  },
  submitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 4,
  },
  viewAllBtnText: { fontSize: 14, fontWeight: "600", color: "#3b82f6" },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 16,
  },
  emptyDesc: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  // Modal
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937" },
  modalCloseBtn: { padding: 8 },
  modalContent: { flex: 1, padding: 16 },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  targetItemName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  targetItemBalance: { fontSize: 13, color: "#6b7280", marginTop: 2 },
});
