import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  Users,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  X,
  Trash2,
  Briefcase,
  Clock,
  Award,
  Banknote,
  MoreHorizontal,
  CalendarDays,
  PlusCircle,
  MinusCircle,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddPersonelModal from "../../src/components/AddPersonelModal";
import { Personel, Kasa, PersonelIslem, Izin } from "../../src/types";
import { supabase } from "../../src/lib/supabase";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type IslemTipi = "gider" | "odeme" | "tahsilat" | "izin";
type GiderKategori = "maas" | "mesai" | "prim" | "komisyon" | "diger";
type IzinTipi = "yillik" | "hastalik" | "mazeret" | "ucretsiz";

const giderKategorileri: { value: GiderKategori; label: string; icon: any }[] =
  [
    { value: "maas", label: "Maaş", icon: Briefcase },
    { value: "mesai", label: "Mesai", icon: Clock },
    { value: "prim", label: "Prim", icon: Award },
    { value: "komisyon", label: "Komisyon", icon: Banknote },
    { value: "diger", label: "Diğer", icon: MoreHorizontal },
  ];

const izinTipleri: { value: IzinTipi; label: string }[] = [
  { value: "yillik", label: "Yıllık İzin" },
  { value: "hastalik", label: "Hastalık" },
  { value: "mazeret", label: "Mazeret" },
  { value: "ucretsiz", label: "Ücretsiz İzin" },
];

export default function PersonelScreen() {
  const {
    personeller,
    fetchPersoneller,
    fetchProfile,
    profile,
    personelIslemler,
    fetchPersonelIslemler,
    kasalar,
    fetchKasalar,
    fetchIslemler,
    izinler,
    fetchIzinler,
    addIzin,
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Accordion state
  const [expandedPersonelId, setExpandedPersonelId] = useState<string | null>(
    null
  );
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );

  // Form state
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formKasaId, setFormKasaId] = useState<string | null>(null);
  const [formKategori, setFormKategori] = useState<GiderKategori>("maas");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPersonel, setDetailPersonel] = useState<Personel | null>(null);

  // İzin modal state
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [izinPersonel, setIzinPersonel] = useState<Personel | null>(null);
  const [izinTipi, setIzinTipi] = useState<"ekle" | "dus">("ekle");
  const [izinType, setIzinType] = useState<
    "yillik" | "hastalik" | "mazeret" | "ucretsiz"
  >("yillik");
  const [izinStartDate, setIzinStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [izinEndDate, setIzinEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [izinDays, setIzinDays] = useState("1");
  const [izinDescription, setIzinDescription] = useState("");
  const [izinLoading, setIzinLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchKasalar();
      fetchIzinler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPersoneller(),
      fetchPersonelIslemler(),
      fetchKasalar(),
      fetchIzinler(),
    ]);
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
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Nakit ve banka kasaları
  const nakitBankaKasalar = kasalar.filter(
    (k) => k.type === "nakit" || k.type === "banka"
  );

  const toggleExpand = (personelId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedPersonelId === personelId) {
      setExpandedPersonelId(null);
      setActiveIslemTipi(null);
    } else {
      setExpandedPersonelId(personelId);
      setActiveIslemTipi(null);
      resetForm();
    }
  };

  const selectIslemTipi = (tip: IslemTipi) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeIslemTipi === tip) {
      setActiveIslemTipi(null);
    } else {
      setActiveIslemTipi(tip);
      resetForm();
      // Ödeme ve tahsilat için ilk kasayı seç
      if (
        (tip === "odeme" || tip === "tahsilat") &&
        nakitBankaKasalar.length > 0
      ) {
        setFormKasaId(nakitBankaKasalar[0].id);
      }
    }
  };

  const resetForm = () => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormKasaId(
      nakitBankaKasalar.length > 0 ? nakitBankaKasalar[0].id : null
    );
    setFormKategori("maas");
    setFormDescription("");
    setFormAmount("");
  };

  const handleSubmit = async (personel: Personel) => {
    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    // Ödeme ve tahsilat için kasa gerekli
    if (
      !formKasaId &&
      (activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat")
    ) {
      Alert.alert("Hata", "Lütfen bir kasa seçin");
      return;
    }

    setFormLoading(true);

    const amount = parseFloat(formAmount);
    let description = formDescription.trim();
    let islemType: string;

    switch (activeIslemTipi) {
      case "gider":
        islemType = formKategori; // maas, mesai, prim, avans, diger
        const kategoriLabel =
          giderKategorileri.find((k) => k.value === formKategori)?.label ||
          formKategori;
        if (!description) description = `${personel.name} - ${kategoriLabel}`;
        break;
      case "odeme":
        islemType = "odeme";
        if (!description) description = `${personel.name} - Ödeme`;
        break;
      case "tahsilat":
        islemType = "tahsilat";
        if (!description) description = `${personel.name} - Tahsilat`;
        break;
      default:
        setFormLoading(false);
        return;
    }

    try {
      // İşlemi personel_islemler tablosuna kaydet
      const { error: islemError } = await supabase
        .from("personel_islemler")
        .insert({
          type: islemType,
          amount,
          description,
          date: formDate,
          kasa_id:
            activeIslemTipi === "odeme" || activeIslemTipi === "tahsilat"
              ? formKasaId
              : null,
          personel_id: personel.id,
          restaurant_id: profile?.restaurant_id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (islemError) throw islemError;

      // Bakiye güncellemeleri
      if (activeIslemTipi === "gider") {
        // GİDER: Personel bakiyesi artar (bize borçlandık)
        await supabase.rpc("update_personel_balance", {
          personel_id: personel.id,
          amount: amount,
        });
      } else if (activeIslemTipi === "odeme") {
        // ÖDEME: Kasadan çıkış, personel bakiyesi azalır
        await supabase.rpc("update_kasa_balance", {
          kasa_id: formKasaId,
          amount: -amount,
        });
        await supabase.rpc("update_personel_balance", {
          personel_id: personel.id,
          amount: -amount,
        });
      } else if (activeIslemTipi === "tahsilat") {
        // TAHSİLAT: Kasaya giriş, personel bakiyesi azalır
        await supabase.rpc("update_kasa_balance", {
          kasa_id: formKasaId,
          amount: amount,
        });
        await supabase.rpc("update_personel_balance", {
          personel_id: personel.id,
          amount: -amount,
        });
      }

      Alert.alert("Başarılı", "İşlem kaydedildi");
      resetForm();
      setActiveIslemTipi(null);
      fetchPersoneller();
      fetchPersonelIslemler();
      fetchKasalar();
      fetchIslemler();
    } catch (error) {
      console.error("İşlem hatası:", error);
      Alert.alert("Hata", "İşlem kaydedilirken bir hata oluştu");
    } finally {
      setFormLoading(false);
    }
  };

  const openDetailModal = (personel: Personel) => {
    setDetailPersonel(personel);
    setShowDetailModal(true);
  };

  // İzin ile ilgili fonksiyonlar
  const getPersonelIzinGunleri = (personelId: string) => {
    const personelIzinleri = izinler.filter(
      (i) => i.personel_id === personelId
    );
    return personelIzinleri.reduce((sum, i) => sum + (i.days || 0), 0);
  };

  const getPersonelIzinleri = (personelId: string) => {
    return izinler
      .filter((i) => i.personel_id === personelId)
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
  };

  const openIzinModal = (personel: Personel, tipi: "ekle" | "dus") => {
    setIzinPersonel(personel);
    setIzinTipi(tipi);
    setIzinType("yillik");
    setIzinStartDate(new Date().toISOString().split("T")[0]);
    setIzinEndDate(new Date().toISOString().split("T")[0]);
    setIzinDays("1");
    setIzinDescription("");
    setShowIzinModal(true);
  };

  const handleIzinSubmit = async () => {
    if (!izinPersonel) return;

    const days = parseInt(izinDays);
    if (isNaN(days) || days <= 0) {
      Alert.alert("Hata", "Geçerli bir gün sayısı girin");
      return;
    }

    setIzinLoading(true);

    try {
      const { error } = await supabase.from("izinler").insert({
        personel_id: izinPersonel.id,
        restaurant_id: profile?.restaurant_id,
        type: izinType,
        start_date: izinStartDate,
        end_date: izinEndDate,
        days: izinTipi === "ekle" ? days : -days, // Düşürme için negatif
        description: izinDescription.trim() || null,
      });

      if (error) throw error;

      Alert.alert(
        "Başarılı",
        izinTipi === "ekle" ? "İzin eklendi" : "İzin düşüldü"
      );
      setShowIzinModal(false);
      fetchIzinler();
    } catch (error) {
      console.error("İzin hatası:", error);
      Alert.alert("Hata", "İzin kaydedilirken bir hata oluştu");
    } finally {
      setIzinLoading(false);
    }
  };

  const handleDeleteIzin = async (izin: Izin) => {
    Alert.alert(
      "İzni Sil",
      `${Math.abs(
        izin.days
      )} günlük izin kaydını silmek istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.from("izinler").delete().eq("id", izin.id);
              fetchIzinler();
            } catch (error) {
              Alert.alert("Hata", "İzin silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  const izinTypeLabels: Record<string, string> = {
    yillik: "Yıllık İzin",
    hastalik: "Hastalık İzni",
    mazeret: "Mazeret İzni",
    ucretsiz: "Ücretsiz İzin",
  };

  const getPersonelIslemler = (personelId: string) => {
    return personelIslemler
      .filter((i) => i.personel_id === personelId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
            try {
              // Bakiyeleri geri al
              const isGider = [
                "maas",
                "mesai",
                "prim",
                "avans",
                "diger",
                "tazminat",
                "komisyon",
                "kesinti",
              ].includes(islem.type);

              if (isGider) {
                // Gider silindi - personel bakiyesi azalır
                await supabase.rpc("update_personel_balance", {
                  personel_id: islem.personel_id,
                  amount: -islem.amount,
                });
              } else if (islem.type === "odeme") {
                // Ödeme silindi - kasaya geri ekle, personel bakiyesi artar
                if (islem.kasa_id) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount: islem.amount,
                  });
                }
                await supabase.rpc("update_personel_balance", {
                  personel_id: islem.personel_id,
                  amount: islem.amount,
                });
              } else if (islem.type === "tahsilat") {
                // Tahsilat silindi - kasadan çıkar, personel bakiyesi artar
                if (islem.kasa_id) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount: -islem.amount,
                  });
                }
                await supabase.rpc("update_personel_balance", {
                  personel_id: islem.personel_id,
                  amount: islem.amount,
                });
              }

              // İşlemi personel_islemler tablosundan sil
              await supabase
                .from("personel_islemler")
                .delete()
                .eq("id", islem.id);

              fetchPersoneller();
              fetchPersonelIslemler();
              fetchKasalar();
            } catch (error) {
              Alert.alert("Hata", "İşlem silinirken bir hata oluştu");
            }
          },
        },
      ]
    );
  };

  // Toplam borç durumu
  const toplamBorcumuz = personeller
    .filter((p) => (p.balance || 0) > 0)
    .reduce((sum, p) => sum + (p.balance || 0), 0);

  const toplamAlacagimiz = personeller
    .filter((p) => (p.balance || 0) < 0)
    .reduce((sum, p) => sum + Math.abs(p.balance || 0), 0);

  const getBalanceInfo = (personel: Personel) => {
    const balance = personel.balance || 0;
    if (balance > 0) {
      return {
        text: `Borcumuz: ${formatCurrency(balance)}`,
        color: "#ef4444",
        bgColor: "#fef2f2",
      };
    } else if (balance < 0) {
      return {
        text: `Alacağımız: ${formatCurrency(Math.abs(balance))}`,
        color: "#10b981",
        bgColor: "#ecfdf5",
      };
    }
    return { text: "Bakiye: ₺0", color: "#6b7280", bgColor: "#f3f4f6" };
  };

  const getIslemTypeInfo = (type: string) => {
    // Gider kategorileri
    const giderTypes = [
      "maas",
      "mesai",
      "prim",
      "avans",
      "diger",
      "tazminat",
      "komisyon",
      "kesinti",
    ];

    if (giderTypes.includes(type)) {
      const labels: Record<string, string> = {
        maas: "MAAŞ",
        mesai: "MESAİ",
        prim: "PRİM",
        avans: "AVANS",
        diger: "DİĞER",
        tazminat: "TAZMİNAT",
        komisyon: "KOMİSYON",
        kesinti: "KESİNTİ",
      };
      return { label: labels[type] || "GİDER", color: "#ef4444", icon: Wallet };
    }

    switch (type) {
      case "odeme":
        return { label: "ÖDEME", color: "#3b82f6", icon: ArrowUpRight };
      case "tahsilat":
        return { label: "TAHSİLAT", color: "#10b981", icon: ArrowDownLeft };
      default:
        return { label: type.toUpperCase(), color: "#6b7280", icon: FileText };
    }
  };

  // İsim sırasına göre sırala
  const sortedPersoneller = [...personeller].sort((a, b) =>
    a.name.localeCompare(b.name, "tr")
  );

  const renderPersonelItem = ({ item }: { item: Personel }) => {
    const isExpanded = expandedPersonelId === item.id;
    const balanceInfo = getBalanceInfo(item);
    const izinGunleri = getPersonelIzinGunleri(item.id);

    return (
      <View style={styles.cardContainer}>
        {/* Header - tıklanabilir */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.personelLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.personelInfo}>
              <Text style={styles.personelName}>{item.name}</Text>
              <View style={styles.personelSubInfo}>
                {item.position ? (
                  <Text style={styles.personelPosition}>{item.position}</Text>
                ) : null}
                {izinGunleri !== 0 ? (
                  <View
                    style={[
                      styles.izinBadge,
                      izinGunleri > 0
                        ? styles.izinBadgePositive
                        : styles.izinBadgeNegative,
                    ]}
                  >
                    <CalendarDays
                      size={12}
                      color={izinGunleri > 0 ? "#10b981" : "#ef4444"}
                    />
                    <Text
                      style={[
                        styles.izinBadgeText,
                        { color: izinGunleri > 0 ? "#10b981" : "#ef4444" },
                      ]}
                    >
                      {izinGunleri > 0
                        ? `${izinGunleri} gün izin`
                        : `${Math.abs(izinGunleri)} gün eksik`}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.personelRight}>
            <View
              style={[
                styles.balanceBadge,
                { backgroundColor: balanceInfo.bgColor },
              ]}
            >
              <Text style={[styles.balanceText, { color: balanceInfo.color }]}>
                {formatCurrency(Math.abs(item.balance || 0))}
              </Text>
            </View>
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
            {/* Bakiye ve İzin durumu */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusCard,
                  { backgroundColor: balanceInfo.bgColor, flex: 1 },
                ]}
              >
                <Text
                  style={[styles.statusCardText, { color: balanceInfo.color }]}
                >
                  {balanceInfo.text}
                </Text>
              </View>
              <View
                style={[
                  styles.statusCard,
                  { backgroundColor: "#f0fdf4", flex: 1 },
                ]}
              >
                <CalendarDays size={16} color="#10b981" />
                <Text style={styles.statusCardText}>
                  {izinGunleri} gün izin
                </Text>
              </View>
            </View>

            {/* İzin butonları */}
            <View style={styles.izinBtnRow}>
              <TouchableOpacity
                style={styles.izinBtn}
                onPress={() => openIzinModal(item, "ekle")}
              >
                <PlusCircle size={18} color="#10b981" />
                <Text style={styles.izinBtnText}>İzin Ekle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.izinBtn}
                onPress={() => openIzinModal(item, "dus")}
              >
                <MinusCircle size={18} color="#f59e0b" />
                <Text style={[styles.izinBtnText, { color: "#f59e0b" }]}>
                  İzin Düş
                </Text>
              </TouchableOpacity>
            </View>

            {/* İşlem tipi butonları */}
            <View style={styles.islemTipleri}>
              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#ef4444" },
                  activeIslemTipi === "gider" && { backgroundColor: "#ef4444" },
                ]}
                onPress={() => selectIslemTipi("gider")}
              >
                <Wallet
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

              <TouchableOpacity
                style={[
                  styles.islemTipiBtn,
                  { borderColor: "#10b981" },
                  activeIslemTipi === "tahsilat" && {
                    backgroundColor: "#10b981",
                  },
                ]}
                onPress={() => selectIslemTipi("tahsilat")}
              >
                <ArrowDownLeft
                  size={16}
                  color={activeIslemTipi === "tahsilat" ? "#fff" : "#10b981"}
                />
                <Text
                  style={[
                    styles.islemTipiBtnText,
                    {
                      color:
                        activeIslemTipi === "tahsilat" ? "#fff" : "#10b981",
                    },
                  ]}
                >
                  TAHSİLAT
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

                {/* Gider kategorisi seçimi */}
                {activeIslemTipi === "gider" ? (
                  <View style={styles.kategoriContainer}>
                    <Text style={styles.formLabel}>Kategori</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.kategoriList}>
                        {giderKategorileri.map((kat) => {
                          const Icon = kat.icon;
                          return (
                            <TouchableOpacity
                              key={kat.value}
                              style={[
                                styles.kategoriChip,
                                formKategori === kat.value &&
                                  styles.kategoriChipActive,
                              ]}
                              onPress={() => setFormKategori(kat.value)}
                            >
                              <Icon
                                size={14}
                                color={
                                  formKategori === kat.value
                                    ? "#fff"
                                    : "#6b7280"
                                }
                              />
                              <Text
                                style={[
                                  styles.kategoriChipText,
                                  formKategori === kat.value &&
                                    styles.kategoriChipTextActive,
                                ]}
                              >
                                {kat.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                ) : null}

                {/* Kasa seçimi - sadece ödeme ve tahsilat için */}
                {activeIslemTipi === "odeme" ||
                activeIslemTipi === "tahsilat" ? (
                  <View style={styles.kasaContainer}>
                    <Text style={styles.formLabel}>Kasa</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.kasaList}>
                        {nakitBankaKasalar.map((kasa) => (
                          <TouchableOpacity
                            key={kasa.id}
                            style={[
                              styles.kasaChip,
                              formKasaId === kasa.id && styles.kasaChipActive,
                            ]}
                            onPress={() => setFormKasaId(kasa.id)}
                          >
                            <Text
                              style={[
                                styles.kasaChipText,
                                formKasaId === kasa.id &&
                                  styles.kasaChipTextActive,
                              ]}
                            >
                              {kasa.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ) : null}

                {/* Açıklama */}
                <TextInput
                  style={styles.descInput}
                  placeholder="Açıklama (opsiyonel)"
                  placeholderTextColor="#9ca3af"
                  value={formDescription}
                  onChangeText={setFormDescription}
                />

                {/* Tutar ve kaydet */}
                <View style={styles.amountRow}>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>₺</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="decimal-pad"
                      value={formAmount}
                      onChangeText={setFormAmount}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      formLoading && styles.submitBtnDisabled,
                    ]}
                    onPress={() => handleSubmit(item)}
                    disabled={formLoading}
                  >
                    <Text style={styles.submitBtnText}>
                      {formLoading ? "..." : "KAYDET"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Geçmiş işlemleri gör butonu */}
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => openDetailModal(item)}
            >
              <FileText size={16} color="#6b7280" />
              <Text style={styles.historyBtnText}>Geçmiş İşlemleri Gör</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personel</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Özet kartları */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: "#3b82f6" }]}>
            <Text style={styles.summaryLabel}>Toplam Personel</Text>
            <Text style={styles.summaryValue}>{personeller.length} kişi</Text>
          </View>
          {toplamBorcumuz > 0 ? (
            <View style={[styles.summaryCard, { borderLeftColor: "#ef4444" }]}>
              <Text style={styles.summaryLabel}>Personele Borç</Text>
              <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                {formatCurrency(toplamBorcumuz)}
              </Text>
            </View>
          ) : null}
          {toplamAlacagimiz > 0 ? (
            <View style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}>
              <Text style={styles.summaryLabel}>Personelden Alacak</Text>
              <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                {formatCurrency(toplamAlacagimiz)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {sortedPersoneller.length > 0 ? (
        <FlatList
          data={sortedPersoneller}
          renderItem={renderPersonelItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <UserPlus size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Personel yok</Text>
          <Text style={styles.emptyText}>
            Çalışanlarınızı ekleyerek{"\n"}maaş ve ödemelerini takip edin
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Personel Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Modal */}
      <AddPersonelModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          fetchPersoneller();
        }}
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {detailPersonel?.name || "Personel Detayı"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {detailPersonel ? (
            <ScrollView style={styles.modalContent}>
              {/* Bakiye kartı */}
              <View
                style={[
                  styles.detailBalanceCard,
                  { backgroundColor: getBalanceInfo(detailPersonel).bgColor },
                ]}
              >
                <Text style={styles.detailBalanceLabel}>Bakiye Durumu</Text>
                <Text
                  style={[
                    styles.detailBalanceValue,
                    { color: getBalanceInfo(detailPersonel).color },
                  ]}
                >
                  {getBalanceInfo(detailPersonel).text}
                </Text>
              </View>

              {/* İşlem geçmişi */}
              <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>

              {getPersonelIslemler(detailPersonel.id).length > 0 ? (
                getPersonelIslemler(detailPersonel.id).map((islem) => {
                  const typeInfo = getIslemTypeInfo(islem.type);
                  const Icon = typeInfo.icon;
                  const kasaName = kasalar.find(
                    (k) => k.id === islem.kasa_id
                  )?.name;

                  return (
                    <View key={islem.id} style={styles.islemItem}>
                      <View style={styles.islemLeft}>
                        <View
                          style={[
                            styles.islemIcon,
                            { backgroundColor: `${typeInfo.color}20` },
                          ]}
                        >
                          <Icon size={16} color={typeInfo.color} />
                        </View>
                        <View style={styles.islemInfo}>
                          <View style={styles.islemHeader}>
                            <Text
                              style={[
                                styles.islemType,
                                { color: typeInfo.color },
                              ]}
                            >
                              {typeInfo.label}
                            </Text>
                            <Text style={styles.islemDate}>
                              {formatDate(islem.date)}
                            </Text>
                          </View>
                          {islem.description ? (
                            <Text style={styles.islemDesc} numberOfLines={1}>
                              {islem.description}
                            </Text>
                          ) : null}
                          {kasaName ? (
                            <Text style={styles.islemKasa}>{kasaName}</Text>
                          ) : null}
                        </View>
                      </View>
                      <View style={styles.islemRight}>
                        <Text
                          style={[
                            styles.islemAmount,
                            { color: typeInfo.color },
                          ]}
                        >
                          {[
                            "maas",
                            "mesai",
                            "prim",
                            "avans",
                            "diger",
                            "tazminat",
                            "komisyon",
                            "kesinti",
                          ].includes(islem.type)
                            ? "+"
                            : "-"}
                          {formatCurrency(islem.amount)}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteIslem(islem)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noIslemContainer}>
                  <Text style={styles.noIslemText}>Henüz işlem yok</Text>
                </View>
              )}
            </ScrollView>
          ) : null}
        </SafeAreaView>
      </Modal>

      {/* İzin Modal */}
      <Modal
        visible={showIzinModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowIzinModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {izinTipi === "ekle" ? "İzin Ekle" : "İzin Düş"} -{" "}
              {izinPersonel?.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* İzin tipi seçimi */}
            <Text style={styles.formLabel}>İzin Türü</Text>
            <View style={styles.izinTypeRow}>
              {(["yillik", "hastalik", "mazeret", "ucretsiz"] as const).map(
                (type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.izinTypeChip,
                      izinType === type && styles.izinTypeChipActive,
                    ]}
                    onPress={() => setIzinType(type)}
                  >
                    <Text
                      style={[
                        styles.izinTypeChipText,
                        izinType === type && styles.izinTypeChipTextActive,
                      ]}
                    >
                      {izinTypeLabels[type]}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Tarihler */}
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.formLabel}>Başlangıç Tarihi</Text>
                <View style={styles.dateInput}>
                  <Calendar size={16} color="#6b7280" />
                  <TextInput
                    style={styles.dateTextInput}
                    value={izinStartDate}
                    onChangeText={setIzinStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
              <View style={styles.dateField}>
                <Text style={styles.formLabel}>Bitiş Tarihi</Text>
                <View style={styles.dateInput}>
                  <Calendar size={16} color="#6b7280" />
                  <TextInput
                    style={styles.dateTextInput}
                    value={izinEndDate}
                    onChangeText={setIzinEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Gün sayısı */}
            <Text style={styles.formLabel}>Gün Sayısı</Text>
            <View style={styles.daysInputContainer}>
              <TextInput
                style={styles.daysInput}
                value={izinDays}
                onChangeText={setIzinDays}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.daysLabel}>gün</Text>
            </View>

            {/* Açıklama */}
            <Text style={styles.formLabel}>Açıklama (opsiyonel)</Text>
            <TextInput
              style={styles.izinDescInput}
              value={izinDescription}
              onChangeText={setIzinDescription}
              placeholder="Ör: Yıllık izin kullanımı, doktor raporu..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />

            {/* Mevcut izinler */}
            {izinPersonel ? (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                  {izinPersonel.name} - İzin Geçmişi
                </Text>
                {getPersonelIzinleri(izinPersonel.id).length > 0 ? (
                  getPersonelIzinleri(izinPersonel.id).map((izin) => (
                    <View key={izin.id} style={styles.izinItem}>
                      <View style={styles.izinItemLeft}>
                        <View
                          style={[
                            styles.izinItemBadge,
                            {
                              backgroundColor:
                                izin.days > 0 ? "#dcfce7" : "#fef3c7",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.izinItemBadgeText,
                              { color: izin.days > 0 ? "#10b981" : "#f59e0b" },
                            ]}
                          >
                            {izin.days > 0 ? `+${izin.days}` : izin.days} gün
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.izinItemType}>
                            {izinTypeLabels[izin.type]}
                          </Text>
                          <Text style={styles.izinItemDate}>
                            {formatDate(izin.start_date)} -{" "}
                            {formatDate(izin.end_date)}
                          </Text>
                          {izin.description ? (
                            <Text style={styles.izinItemDesc}>
                              {izin.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteIzin(izin)}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.noIslemContainer}>
                    <Text style={styles.noIslemText}>Henüz izin kaydı yok</Text>
                  </View>
                )}
              </>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.izinSubmitBtn,
                izinTipi === "ekle"
                  ? styles.izinSubmitBtnEkle
                  : styles.izinSubmitBtnDus,
                izinLoading && styles.submitBtnDisabled,
              ]}
              onPress={handleIzinSubmit}
              disabled={izinLoading}
            >
              {izinTipi === "ekle" ? (
                <PlusCircle size={20} color="#fff" />
              ) : (
                <MinusCircle size={20} color="#fff" />
              )}
              <Text style={styles.izinSubmitBtnText}>
                {izinLoading
                  ? "Kaydediliyor..."
                  : izinTipi === "ekle"
                  ? "İzin Ekle"
                  : "İzin Düş"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  summaryLabel: {
    fontSize: 19,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  personelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4f46e5",
  },
  personelInfo: {
    marginLeft: 14,
    flex: 1,
  },
  personelName: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  personelPosition: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  personelSubInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  izinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  izinBadgePositive: {
    backgroundColor: "#dcfce7",
  },
  izinBadgeNegative: {
    backgroundColor: "#fef2f2",
  },
  izinBadgeText: {
    fontSize: 19,
    fontWeight: "600",
  },
  personelRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 19,
    fontWeight: "600",
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  statusCardText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
  },
  izinBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  izinBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  izinBtnText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#10b981",
  },
  balanceCard: {
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  balanceCardText: {
    fontSize: 19,
    fontWeight: "600",
  },
  islemTipleri: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  islemTipiBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  islemTipiBtnText: {
    fontSize: 19,
    fontWeight: "700",
  },
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
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  dateBtnText: {
    fontSize: 19,
    color: "#374151",
    fontWeight: "500",
  },
  formLabel: {
    fontSize: 19,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  kategoriContainer: {
    marginTop: 4,
  },
  kategoriList: {
    flexDirection: "row",
    gap: 8,
  },
  kategoriChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  kategoriChipActive: {
    backgroundColor: "#ef4444",
  },
  kategoriChipText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#6b7280",
  },
  kategoriChipTextActive: {
    color: "#fff",
  },
  kasaContainer: {
    marginTop: 4,
  },
  kasaList: {
    flexDirection: "row",
    gap: 8,
  },
  kasaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  kasaChipActive: {
    backgroundColor: "#3b82f6",
  },
  kasaChipText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#6b7280",
  },
  kasaChipTextActive: {
    color: "#fff",
  },
  descInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 19,
    color: "#111827",
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
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
    fontSize: 20,
    fontWeight: "600",
    color: "#6b7280",
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  historyBtnText: {
    fontSize: 19,
    color: "#6b7280",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 19,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "600",
  },
  // Modal styles
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
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailBalanceCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  detailBalanceLabel: {
    fontSize: 19,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailBalanceValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  islemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  islemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  islemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  islemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  islemType: {
    fontSize: 19,
    fontWeight: "700",
  },
  islemDate: {
    fontSize: 19,
    color: "#9ca3af",
  },
  islemDesc: {
    fontSize: 19,
    color: "#374151",
    marginTop: 2,
  },
  islemKasa: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  islemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  islemAmount: {
    fontSize: 19,
    fontWeight: "700",
  },
  deleteBtn: {
    padding: 4,
  },
  noIslemContainer: {
    padding: 40,
    alignItems: "center",
  },
  noIslemText: {
    fontSize: 19,
    color: "#9ca3af",
  },
  // İzin modal stilleri
  izinTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  izinTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  izinTypeChipActive: {
    backgroundColor: "#10b981",
  },
  izinTypeChipText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#6b7280",
  },
  izinTypeChipTextActive: {
    color: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 19,
    color: "#111827",
    paddingVertical: 12,
  },
  daysInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  daysInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  daysLabel: {
    fontSize: 19,
    color: "#6b7280",
  },
  izinDescInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 14,
    fontSize: 19,
    color: "#111827",
    minHeight: 80,
    textAlignVertical: "top",
  },
  izinItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  izinItemLeft: {
    flex: 1,
  },
  izinItemBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  izinItemBadgeText: {
    fontSize: 19,
    fontWeight: "700",
  },
  izinItemDates: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  izinItemDesc: {
    fontSize: 19,
    color: "#9ca3af",
    marginTop: 2,
    fontStyle: "italic",
  },
  izinItemRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  izinItemDays: {
    fontSize: 19,
    fontWeight: "700",
  },
  izinSaveBtn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  izinSaveBtnDisabled: {
    opacity: 0.6,
  },
  izinSaveBtnText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
  },
  izinItemType: {
    fontSize: 19,
    fontWeight: "600",
    color: "#374151",
  },
  izinItemDate: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  izinSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  izinSubmitBtnEkle: {
    backgroundColor: "#10b981",
  },
  izinSubmitBtnDus: {
    backgroundColor: "#f59e0b",
  },
  izinSubmitBtnText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
  },
});
