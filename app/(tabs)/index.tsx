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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useStore } from "../../src/store/useStore";
import GunlukCiroModal from "../../src/components/GunlukCiroModal";
import HakedisModal from "../../src/components/HakedisModal";
import { Kasa, Cari, Personel } from "../../src/types";
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
  Banknote,
  ArrowRightLeft,
  X,
  Calendar,
  FileText,
  Truck,
  ShoppingBag,
} from "lucide-react-native";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type PeriodType = "gunluk" | "aylik" | "yillik";
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

  // Period state
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("aylik");

  // Accordion state
  const [expandedKasaId, setExpandedKasaId] = useState<string | null>(null);
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );

  // Form state
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

  // Target selection modal
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  // Toggle accordion
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
      // Transfer için diğer kasaları hazırla
      if (tipi === "transfer") {
        const otherKasalar = kasalar.filter(
          (k) => k.id !== expandedKasaId && !k.is_archived
        );
        if (otherKasalar.length > 0) {
          setFormTargetKasaId(otherKasalar[0].id);
        }
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

  // İşlem kaydet
  const handleSubmit = async (kasa: Kasa) => {
    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    // Ödeme/Tahsilat için hedef gerekli
    if (
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat") &&
      !formTargetId
    ) {
      Alert.alert("Hata", "Lütfen bir personel veya cari seçin");
      return;
    }

    // Transfer için hedef kasa gerekli
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
        // GELİR: Kasaya para girer + Kar/Zarar'a gelir olarak yansır
        if (!description) description = `${kasa.name} - Gelir`;

        const { error: insertError } = await supabase.from("islemler").insert({
          type: "gelir",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kategori_id: formKategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });

        if (insertError) {
          console.error("Gelir insert hatası:", insertError);
          throw insertError;
        }

        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: amount,
        });
      } else if (activeIslemTipi === "gider") {
        // GİDER: Kasadan para çıkar + Kar/Zarar'a gider olarak yansır
        if (!description) description = `${kasa.name} - Gider`;

        const { error: giderError } = await supabase.from("islemler").insert({
          type: "gider",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          kategori_id: formKategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });

        if (giderError) {
          console.error("Gider insert hatası:", giderError);
          throw giderError;
        }

        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: -amount,
        });
      } else if (activeIslemTipi === "odeme") {
        // ÖDEME: Kasadan para çıkar + Hedef bakiye azalır (borç ödeme)
        // Kar/Zarar'ı ETKİLEMEZ

        if (formTargetType === "personel") {
          const personel = personeller.find((p) => p.id === formTargetId);
          if (!description)
            description = `${personel?.name || "Personel"} - Ödeme`;

          // Personel işlemleri tablosuna kaydet
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

          // Kasadan çıkış
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: -amount,
          });

          // Personel bakiyesi azalır
          await supabase.rpc("update_personel_balance", {
            personel_id: formTargetId,
            amount: -amount,
          });
        } else if (formTargetType === "cari") {
          const cari = cariler.find((c) => c.id === formTargetId);
          if (!description) description = `${cari?.name || "Cari"} - Ödeme`;

          // İşlemler tablosuna kaydet
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

          // Kasadan çıkış
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: -amount,
          });

          // Cari bakiyesi azalır
          await supabase.rpc("update_cari_balance", {
            cari_id: formTargetId,
            amount: -amount,
          });
        }
      } else if (activeIslemTipi === "tahsilat") {
        // TAHSİLAT: Kasaya para girer + Hedef bakiye azalır (alacak tahsil)
        // Kar/Zarar'ı ETKİLEMEZ

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

          // Kasaya giriş
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: amount,
          });

          // Personel bakiyesi azalır
          await supabase.rpc("update_personel_balance", {
            personel_id: formTargetId,
            amount: -amount,
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

          // Kasaya giriş
          await supabase.rpc("update_kasa_balance", {
            kasa_id: kasa.id,
            amount: amount,
          });

          // Cari bakiyesi azalır
          await supabase.rpc("update_cari_balance", {
            cari_id: formTargetId,
            amount: -amount,
          });
        }
      } else if (activeIslemTipi === "transfer") {
        // TRANSFER: Bir kasadan çıkar, başka kasaya girer
        // Kar/Zarar'ı ETKİLEMEZ
        const targetKasa = kasalar.find((k) => k.id === formTargetKasaId);
        if (!description)
          description = `${kasa.name} → ${targetKasa?.name || "Hedef Kasa"}`;

        await supabase.from("islemler").insert({
          type: "transfer",
          amount,
          description,
          date: formDate,
          kasa_id: kasa.id,
          target_kasa_id: formTargetKasaId,
          restaurant_id: profile?.restaurant_id,
          created_by: currentUser.id,
        });

        // Kaynak kasadan çıkış
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: -amount,
        });

        // Hedef kasaya giriş
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

  // Hesaplamalar
  const nakitVeBankaKasalar = kasalar.filter(
    (k) => (k.type === "nakit" || k.type === "banka") && !k.is_archived
  );
  const krediKartlari = kasalar.filter(
    (k) => k.type === "kredi_karti" && !k.is_archived
  );
  const birikimKasalar = kasalar.filter(
    (k) => k.type === "birikim" && !k.is_archived
  );
  const tumKasalar = kasalar.filter((k) => !k.is_archived);

  // Hesaplarım (nakit + banka + birikim)
  const toplamHesaplar =
    nakitVeBankaKasalar.reduce((sum, k) => sum + k.balance, 0) +
    birikimKasalar.reduce((sum, k) => sum + k.balance, 0);

  // Cariler (tedarikçilere borç - pozitif bakiye = borç)
  const tedarikciCariler = cariler.filter((c) => c.type === "tedarikci");
  const toplamCariBorcu = tedarikciCariler.reduce(
    (sum, c) => sum + c.balance,
    0
  );

  // Müşteriler (müşterilerden alacak - pozitif bakiye = alacak)
  const musteriCariler = cariler.filter((c) => c.type === "musteri");
  const toplamMusteriAlacak = musteriCariler.reduce(
    (sum, c) => sum + c.balance,
    0
  );

  // Personel (pozitif bakiye = biz borçluyuz)
  const toplamPersonelBakiye = personeller.reduce(
    (sum, p) => sum + p.balance,
    0
  );

  // Genel Durum = Hesaplar + Müşteri Alacakları - Cari Borçları - Personel Borçları
  const genelDurum =
    toplamHesaplar +
    toplamMusteriAlacak -
    toplamCariBorcu -
    toplamPersonelBakiye;

  // Dönem bazlı gelir/gider hesaplama
  const getDateRange = () => {
    const now = new Date();
    let startDate: string;

    if (selectedPeriod === "gunluk") {
      startDate = now.toISOString().split("T")[0];
    } else if (selectedPeriod === "aylik") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    } else {
      startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
    }

    return startDate;
  };

  const startDate = getDateRange();
  const periodIslemler = islemler.filter((i) => i.date >= startDate);

  const periodGelir = periodIslemler
    .filter((i) => i.type === "gelir")
    .reduce((sum, i) => sum + i.amount, 0);

  const periodGider = periodIslemler
    .filter((i) => i.type === "gider")
    .reduce((sum, i) => sum + i.amount, 0);

  // Hedef seçme (personel veya cari)
  const openTargetModal = () => {
    setShowTargetModal(true);
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

  // Render kasa kartı
  const renderKasaCard = (kasa: Kasa) => {
    const isExpanded = expandedKasaId === kasa.id;
    const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
    const IconComponent = iconConfig.icon;

    // Transfer için diğer kasalar
    const otherKasalar = kasalar.filter(
      (k) => k.id !== kasa.id && !k.is_archived
    );

    return (
      <View key={kasa.id} style={styles.kasaCardContainer}>
        {/* Header - tıklanabilir */}
        <TouchableOpacity
          style={styles.kasaCardHeader}
          onPress={() => toggleExpand(kasa.id)}
          activeOpacity={0.7}
        >
          <View style={styles.kasaLeft}>
            <View
              style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}
            >
              <IconComponent size={22} color={iconConfig.color} />
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
                kasa.balance < 0 && styles.kasaBalanceNegative,
              ]}
            >
              {formatCurrency(kasa.balance)}
            </Text>
            {isExpanded ? (
              <ChevronUp size={20} color="#6b7280" />
            ) : (
              <ChevronDown size={20} color="#6b7280" />
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded content */}
        {isExpanded ? (
          <View style={styles.expandedContent}>
            {/* İşlem tipi butonları */}
            <View style={styles.islemTipleri}>
              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#10b981" },
                  activeIslemTipi === "gelir" && { backgroundColor: "#10b981" },
                ]}
                onPress={() => selectIslemTipi("gelir")}
              >
                <ArrowDownLeft
                  size={16}
                  color={activeIslemTipi === "gelir" ? "#fff" : "#10b981"}
                />
                <Text
                  style={[
                    styles.islemTipiBtnText,
                    { color: activeIslemTipi === "gelir" ? "#fff" : "#10b981" },
                  ]}
                >
                  GELİR
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#ef4444" },
                  activeIslemTipi === "gider" && { backgroundColor: "#ef4444" },
                ]}
                onPress={() => selectIslemTipi("gider")}
              >
                <ArrowUpRight
                  size={16}
                  color={activeIslemTipi === "gider" ? "#fff" : "#ef4444"}
                />
                <Text
                  style={[
                    styles.islemTipiBtnText,
                    { color: activeIslemTipi === "gider" ? "#fff" : "#ef4444" },
                  ]}
                >
                  GİDER
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#3b82f6" },
                  activeIslemTipi === "odeme" && { backgroundColor: "#3b82f6" },
                ]}
                onPress={() => selectIslemTipi("odeme")}
              >
                <ArrowUpRight
                  size={16}
                  color={activeIslemTipi === "odeme" ? "#fff" : "#3b82f6"}
                />
                <Text
                  style={[
                    styles.islemTipiBtnText,
                    { color: activeIslemTipi === "odeme" ? "#fff" : "#3b82f6" },
                  ]}
                >
                  ÖDEME
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.islemTipleri2}>
              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#8b5cf6" },
                  activeIslemTipi === "tahsilat" && {
                    backgroundColor: "#8b5cf6",
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
                    styles.islemTipiBtnText,
                    {
                      color:
                        activeIslemTipi === "tahsilat" ? "#fff" : "#8b5cf6",
                    },
                  ]}
                >
                  TAHSİLAT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#f59e0b" },
                  activeIslemTipi === "transfer" && {
                    backgroundColor: "#f59e0b",
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
                    styles.islemTipiBtnText,
                    {
                      color:
                        activeIslemTipi === "transfer" ? "#fff" : "#f59e0b",
                    },
                  ]}
                >
                  TRANSFER
                </Text>
              </TouchableOpacity>
            </View>

            {/* İşlem formu */}
            {activeIslemTipi ? (
              <View style={styles.formContainer}>
                {/* Tarih */}
                <View style={styles.dateBtn}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.dateBtnText}>{formatDate(formDate)}</Text>
                </View>

                {/* Ödeme/Tahsilat için hedef seçimi */}
                {activeIslemTipi === "odeme" ||
                activeIslemTipi === "tahsilat" ? (
                  <View style={styles.targetContainer}>
                    <Text style={styles.formLabel}>
                      {activeIslemTipi === "odeme"
                        ? "Kime Ödeme?"
                        : "Kimden Tahsilat?"}
                    </Text>
                    <TouchableOpacity
                      style={styles.targetBtn}
                      onPress={openTargetModal}
                    >
                      <Text style={styles.targetBtnText}>
                        {getTargetName()}
                      </Text>
                      <ChevronRight size={18} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Transfer için hedef kasa seçimi */}
                {activeIslemTipi === "transfer" ? (
                  <View style={styles.targetContainer}>
                    <Text style={styles.formLabel}>Hedef Kasa</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.targetKasaRow}>
                        {otherKasalar.map((k) => {
                          const kIconConfig =
                            kasaIcons[k.type] || kasaIcons.nakit;
                          const KIcon = kIconConfig.icon;
                          return (
                            <TouchableOpacity
                              key={k.id}
                              style={[
                                styles.targetKasaChip,
                                formTargetKasaId === k.id &&
                                  styles.targetKasaChipActive,
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
                                  styles.targetKasaChipText,
                                  formTargetKasaId === k.id &&
                                    styles.targetKasaChipTextActive,
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
                ) : null}

                {/* Gelir/Gider için Kategori Seçimi */}
                {(activeIslemTipi === "gelir" ||
                  activeIslemTipi === "gider") && (
                  <View style={styles.kategoriContainer}>
                    <TouchableOpacity
                      style={styles.kategoriDropdown}
                      onPress={() => setShowKategoriPicker(!showKategoriPicker)}
                    >
                      <Text
                        style={[
                          styles.kategoriDropdownText,
                          !formKategoriId && styles.kategoriDropdownPlaceholder,
                        ]}
                      >
                        {formKategoriId
                          ? kategoriler.find((k) => k.id === formKategoriId)
                              ?.name || "Kategori seç"
                          : "Kategori seç (opsiyonel)"}
                      </Text>
                      <ChevronDown size={18} color="#6b7280" />
                    </TouchableOpacity>

                    {showKategoriPicker && (
                      <View style={styles.kategoriPickerContainer}>
                        <ScrollView
                          style={styles.kategoriPicker}
                          nestedScrollEnabled
                        >
                          <TouchableOpacity
                            style={styles.kategoriOption}
                            onPress={() => {
                              setFormKategoriId("");
                              setShowKategoriPicker(false);
                            }}
                          >
                            <Text style={styles.kategoriOptionText}>
                              Seçilmedi
                            </Text>
                          </TouchableOpacity>
                          {kategoriler
                            .filter((k) => k.type === activeIslemTipi)
                            .map((kat) => (
                              <TouchableOpacity
                                key={kat.id}
                                style={[
                                  styles.kategoriOption,
                                  formKategoriId === kat.id &&
                                    styles.kategoriOptionActive,
                                ]}
                                onPress={() => {
                                  setFormKategoriId(kat.id);
                                  setShowKategoriPicker(false);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.kategoriOptionText,
                                    formKategoriId === kat.id &&
                                      styles.kategoriOptionTextActive,
                                  ]}
                                >
                                  {kat.name}
                                </Text>
                              </TouchableOpacity>
                            ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}

                {/* Açıklama */}
                <TextInput
                  style={styles.descInput}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Açıklama (opsiyonel)"
                  placeholderTextColor="#9ca3af"
                />

                {/* Tutar ve Kaydet */}
                <View style={styles.amountRow}>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>₺</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={formAmount}
                      onChangeText={setFormAmount}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
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
                      formLoading && styles.submitBtnDisabled,
                    ]}
                    onPress={() => handleSubmit(kasa)}
                    disabled={formLoading}
                  >
                    <Text style={styles.submitBtnText}>
                      {formLoading ? "..." : "KAYDET"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
            Hoş geldin, {profile?.name || "Kullanıcı"}
          </Text>
        </View>

        {/* Genel Durum Kartı */}
        <View
          style={[
            styles.genelDurumCard,
            { backgroundColor: genelDurum >= 0 ? "#10b981" : "#ef4444" },
          ]}
        >
          <Text style={styles.genelDurumLabel}>Genel Durum</Text>
          <Text style={styles.genelDurumAmount}>
            {genelDurum >= 0 ? "+" : ""}
            {formatCurrency(genelDurum)}
          </Text>
          <View style={styles.genelDurumIcon}>
            {genelDurum >= 0 ? (
              <TrendingUp size={32} color="rgba(255,255,255,0.3)" />
            ) : (
              <TrendingDown size={32} color="rgba(255,255,255,0.3)" />
            )}
          </View>
        </View>

        {/* Özet Kartları */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "#dbeafe" }]}>
              <Wallet size={18} color="#3b82f6" />
            </View>
            <Text style={styles.summaryLabel}>Hesaplarım</Text>
            <Text
              style={[
                styles.summaryValue,
                toplamHesaplar < 0 && styles.summaryValueNegative,
              ]}
            >
              {formatCurrency(toplamHesaplar)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "#fee2e2" }]}>
              <Truck size={18} color="#ef4444" />
            </View>
            <Text style={styles.summaryLabel}>Cariler</Text>
            <Text
              style={[
                styles.summaryValue,
                toplamCariBorcu > 0 && styles.summaryValueNegative,
              ]}
            >
              {toplamCariBorcu > 0 ? "-" : ""}
              {formatCurrency(Math.abs(toplamCariBorcu))}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "#dcfce7" }]}>
              <ShoppingBag size={18} color="#10b981" />
            </View>
            <Text style={styles.summaryLabel}>Müşteriler</Text>
            <Text
              style={[
                styles.summaryValue,
                toplamMusteriAlacak > 0 && styles.summaryValuePositive,
              ]}
            >
              {toplamMusteriAlacak > 0 ? "+" : ""}
              {formatCurrency(toplamMusteriAlacak)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "#fef3c7" }]}>
              <Users size={18} color="#f59e0b" />
            </View>
            <Text style={styles.summaryLabel}>Personel</Text>
            <Text
              style={[
                styles.summaryValue,
                toplamPersonelBakiye > 0 && styles.summaryValueNegative,
              ]}
            >
              {toplamPersonelBakiye > 0 ? "-" : ""}
              {formatCurrency(Math.abs(toplamPersonelBakiye))}
            </Text>
          </View>
        </View>

        {/* Dönem Seçici */}
        <View style={styles.periodSelector}>
          {(["gunluk", "aylik", "yillik"] as PeriodType[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodBtn,
                selectedPeriod === period && styles.periodBtnActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  selectedPeriod === period && styles.periodBtnTextActive,
                ]}
              >
                {period === "gunluk"
                  ? "Günlük"
                  : period === "aylik"
                  ? "Aylık"
                  : "Yıllık"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gelir/Gider Özeti */}
        <View style={styles.gelirGiderRow}>
          <View style={[styles.gelirGiderCard, { backgroundColor: "#dcfce7" }]}>
            <ArrowDownLeft size={20} color="#10b981" />
            <Text style={styles.gelirGiderLabel}>Gelir</Text>
            <Text style={[styles.gelirGiderValue, { color: "#10b981" }]}>
              {formatCurrency(periodGelir)}
            </Text>
          </View>
          <View style={[styles.gelirGiderCard, { backgroundColor: "#fee2e2" }]}>
            <ArrowUpRight size={20} color="#ef4444" />
            <Text style={styles.gelirGiderLabel}>Gider</Text>
            <Text style={[styles.gelirGiderValue, { color: "#ef4444" }]}>
              {formatCurrency(periodGider)}
            </Text>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.ciroButton}
            onPress={() => setShowCiroModal(true)}
          >
            <View style={styles.quickActionIcon}>
              <TrendingUp size={22} color="#fff" />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Günlük Ciro Gir</Text>
              <Text style={styles.quickActionSubtitle}>
                Tüm kasalara hızlıca giriş
              </Text>
            </View>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hakedisButton}
            onPress={() => setShowHakedisModal(true)}
          >
            <View style={styles.quickActionIcon}>
              <Banknote size={22} color="#fff" />
            </View>
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Maaş Hakedişi</Text>
              <Text style={styles.quickActionSubtitle}>
                Aylık personel maaşları
              </Text>
            </View>
            <Users size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Hesaplar Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hesaplar</Text>
          <TouchableOpacity onPress={() => router.push("/kasa")}>
            <Text style={styles.seeAllText}>Yönet</Text>
          </TouchableOpacity>
        </View>

        {/* Kasa Kartları (Accordion) */}
        <View style={styles.kasaList}>
          {tumKasalar.length > 0 ? (
            tumKasalar.map((kasa) => renderKasaCard(kasa))
          ) : (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() => router.push("/kasa")}
            >
              <Wallet size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>Kasa eklemek için tıklayın</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomPadding} />
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
            {/* Personeller */}
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

            {/* Tedarikçiler */}
            <Text style={[styles.modalSectionTitle, { marginTop: 20 }]}>
              Tedarikçiler
            </Text>
            {cariler
              .filter((c) => c.type === "tedarikci" && !c.is_archived)
              .map((c) => (
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

            {/* Müşteriler */}
            <Text style={[styles.modalSectionTitle, { marginTop: 20 }]}>
              Müşteriler
            </Text>
            {cariler
              .filter((c) => c.type === "musteri" && !c.is_archived)
              .map((c) => (
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
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modaller */}
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
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  // Genel Durum
  genelDurumCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    position: "relative",
    overflow: "hidden",
  },
  genelDurumLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  genelDurumAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#fff",
  },
  genelDurumIcon: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -16,
  },
  // Özet Grid
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  summaryValuePositive: {
    color: "#10b981",
  },
  summaryValueNegative: {
    color: "#ef4444",
  },
  // Dönem Seçici
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  periodBtnActive: {
    backgroundColor: "#3b82f6",
  },
  periodBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  periodBtnTextActive: {
    color: "#fff",
  },
  // Gelir Gider
  gelirGiderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  gelirGiderCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
  },
  gelirGiderLabel: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
  gelirGiderValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  // Hızlı İşlemler
  quickActions: {
    gap: 10,
    marginBottom: 20,
  },
  ciroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  hakedisButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  // Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  // Kasa Kartları
  kasaList: {
    gap: 10,
  },
  kasaCardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  kasaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  kasaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  kasaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  kasaInfo: {
    marginLeft: 12,
    flex: 1,
  },
  kasaName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  kasaType: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  kasaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  kasaBalance: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  kasaBalanceNegative: {
    color: "#ef4444",
  },
  // Expanded Content
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  islemTipleri: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  islemTipleri2: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  islemTipiBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
  islemTipiBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  // Form
  formContainer: {
    marginTop: 16,
    gap: 12,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  dateBtnText: {
    fontSize: 14,
    color: "#374151",
  },
  formLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  targetContainer: {
    marginTop: 4,
  },
  targetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  targetBtnText: {
    fontSize: 14,
    color: "#374151",
  },
  targetKasaRow: {
    flexDirection: "row",
    gap: 8,
  },
  targetKasaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  targetKasaChipActive: {
    backgroundColor: "#f59e0b",
  },
  targetKasaChipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  targetKasaChipTextActive: {
    color: "#fff",
  },
  descInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  amountRow: {
    flexDirection: "row",
    gap: 10,
  },
  amountInputContainer: {
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
    color: "#6b7280",
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  submitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
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
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
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
  targetItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  targetItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  targetItemBalance: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 2,
  },
  kategoriContainer: {
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
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kategoriDropdownText: {
    fontSize: 14,
    color: "#111827",
  },
  kategoriDropdownPlaceholder: {
    color: "#9ca3af",
  },
  kategoriPickerContainer: {
    position: "relative",
    zIndex: 100,
  },
  kategoriPicker: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kategoriOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriOptionActive: {
    backgroundColor: "#dcfce7",
  },
  kategoriOptionText: {
    fontSize: 14,
    color: "#111827",
  },
  kategoriOptionTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
  bottomPadding: {
    height: 30,
  },
});
