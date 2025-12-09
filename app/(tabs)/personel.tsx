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
  MoreVertical,
  Edit3,
  Archive,
  EyeOff,
  Eye,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddPersonelModal from "../../src/components/AddPersonelModal";
import DatePickerField from "../../src/components/DatePickerField";
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
  const [detailViewTab, setDetailViewTab] = useState<"hesap" | "izin">("hesap");

  // Hamburger menü state'leri
  const [showPersonelMenu, setShowPersonelMenu] = useState(false);
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [editPersonelName, setEditPersonelName] = useState("");

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
    setEditPersonelName(personel.name);
    setDetailViewTab("hesap");
    setShowDetailModal(true);
  };

  // ========== HAMBURGER MENÜ FONKSİYONLARI ==========

  // İsim Düzenleme
  const handleEditPersonelName = async () => {
    if (!editPersonelName.trim()) {
      Alert.alert("Hata", "İsim boş olamaz");
      return;
    }
    if (!detailPersonel) return;

    setFormLoading(true);
    const { error } = await supabase
      .from("personel")
      .update({ name: editPersonelName.trim() })
      .eq("id", detailPersonel.id);
    setFormLoading(false);

    if (error) {
      Alert.alert("Hata", "İsim güncellenirken bir hata oluştu");
    } else {
      setShowNameEditModal(false);
      fetchPersoneller();
      // detailPersonel'i güncelle
      setDetailPersonel({ ...detailPersonel, name: editPersonelName.trim() });
    }
  };

  // Arşive Alma
  const handleArchivePersonel = () => {
    setShowPersonelMenu(false);
    Alert.alert(
      "Arşive Al",
      `"${detailPersonel?.name}" personelini arşive almak istediğinize emin misiniz?\n\nArşivdeki personeller listelerde görünmez ama verileri korunur.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşive Al",
          onPress: async () => {
            if (!detailPersonel) return;
            setFormLoading(true);
            const { error } = await supabase
              .from("personel")
              .update({ is_archived: true })
              .eq("id", detailPersonel.id);
            setFormLoading(false);
            if (error) {
              Alert.alert("Hata", "Arşive alınırken bir hata oluştu");
            } else {
              Alert.alert("Başarılı", "Personel arşive alındı");
              setShowDetailModal(false);
              fetchPersoneller();
            }
          },
        },
      ]
    );
  };

  // Raporlara Dahil Etme Toggle
  const handleToggleIncludeInReports = async () => {
    if (!detailPersonel) return;
    setShowPersonelMenu(false);
    setFormLoading(true);
    const { error } = await supabase
      .from("personel")
      .update({ include_in_reports: !detailPersonel.include_in_reports })
      .eq("id", detailPersonel.id);
    setFormLoading(false);
    if (error) {
      Alert.alert("Hata", "Ayar güncellenirken bir hata oluştu");
    } else {
      fetchPersoneller();
      setDetailPersonel({
        ...detailPersonel,
        include_in_reports: !detailPersonel.include_in_reports,
      });
    }
  };

  // Personel Silme
  const handleDeletePersonel = () => {
    setShowPersonelMenu(false);
    Alert.alert(
      "Personeli Sil",
      `"${detailPersonel?.name}" personelini silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve tüm işlem geçmişi silinecektir.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            if (!detailPersonel) return;
            setFormLoading(true);
            const { error } = await supabase
              .from("personel")
              .delete()
              .eq("id", detailPersonel.id);
            setFormLoading(false);
            if (error) {
              Alert.alert("Hata", "Personel silinirken bir hata oluştu");
            } else {
              Alert.alert("Başarılı", "Personel silindi");
              setShowDetailModal(false);
              fetchPersoneller();
            }
          },
        },
      ]
    );
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
        end_date: izinStartDate, // Sadece tarih gösterimi için, gün sayısı ayrı
        days: izinTipi === "ekle" ? days : -days, // Düşürme için negatif
        description: izinDescription.trim() || null,
      });

      if (error) throw error;

      Alert.alert(
        "Başarılı",
        izinTipi === "ekle" ? "İzin hakkı eklendi" : "İzin kullanımı kaydedildi"
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
                <DatePickerField value={formDate} onChange={setFormDate} />

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
            <TouchableOpacity onPress={() => setShowPersonelMenu(true)}>
              <MoreVertical size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Raporlara dahil değil badge */}
          {detailPersonel && !detailPersonel.include_in_reports && (
            <View style={styles.excludedBadge}>
              <EyeOff size={14} color="#f59e0b" />
              <Text style={styles.excludedBadgeText}>
                Raporlara dahil değil
              </Text>
            </View>
          )}

          {/* Hesap / İzin Sekmeleri */}
          {detailPersonel && (
            <View style={styles.detailTabContainer}>
              <TouchableOpacity
                style={[
                  styles.detailTab,
                  detailViewTab === "hesap" && styles.detailTabActive,
                ]}
                onPress={() => setDetailViewTab("hesap")}
              >
                <Wallet
                  size={16}
                  color={detailViewTab === "hesap" ? "#fff" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.detailTabText,
                    detailViewTab === "hesap" && styles.detailTabTextActive,
                  ]}
                >
                  Hesap Hareketleri
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.detailTab,
                  detailViewTab === "izin" && styles.detailTabActiveIzin,
                ]}
                onPress={() => setDetailViewTab("izin")}
              >
                <CalendarDays
                  size={16}
                  color={detailViewTab === "izin" ? "#fff" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.detailTabText,
                    detailViewTab === "izin" && styles.detailTabTextActive,
                  ]}
                >
                  İzin Hareketleri
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hesap Hareketleri Sekmesi */}
          {detailPersonel && detailViewTab === "hesap" ? (
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

          {/* İzin Hareketleri Sekmesi */}
          {detailPersonel && detailViewTab === "izin" ? (
            <ScrollView style={styles.modalContent}>
              {/* İzin Özeti */}
              {(() => {
                const personelIzinleriList = getPersonelIzinleri(
                  detailPersonel.id
                );
                const toplamHak = personelIzinleriList
                  .filter((i) => i.days > 0)
                  .reduce((sum, i) => sum + i.days, 0);
                const kullanilanIzin = Math.abs(
                  personelIzinleriList
                    .filter((i) => i.days < 0)
                    .reduce((sum, i) => sum + i.days, 0)
                );
                const kalanIzin = toplamHak - kullanilanIzin;

                return (
                  <View style={styles.izinSummaryCard}>
                    <View style={styles.izinSummaryRow}>
                      <View style={styles.izinSummaryItem}>
                        <Text style={styles.izinSummaryValue}>{toplamHak}</Text>
                        <Text style={styles.izinSummaryLabel}>Toplam Hak</Text>
                      </View>
                      <View style={styles.izinSummaryItem}>
                        <Text
                          style={[
                            styles.izinSummaryValue,
                            { color: "#ef4444" },
                          ]}
                        >
                          {kullanilanIzin}
                        </Text>
                        <Text style={styles.izinSummaryLabel}>Kullanılan</Text>
                      </View>
                      <View style={styles.izinSummaryItem}>
                        <Text
                          style={[
                            styles.izinSummaryValue,
                            { color: kalanIzin >= 0 ? "#10b981" : "#ef4444" },
                          ]}
                        >
                          {kalanIzin}
                        </Text>
                        <Text style={styles.izinSummaryLabel}>Kalan</Text>
                      </View>
                    </View>
                  </View>
                );
              })()}

              {/* İzin Geçmişi */}
              <Text style={styles.sectionTitle}>
                İzin Geçmişi ({getPersonelIzinleri(detailPersonel.id).length})
              </Text>
              {getPersonelIzinleri(detailPersonel.id).length > 0 ? (
                getPersonelIzinleri(detailPersonel.id).map((izin) => (
                  <View key={izin.id} style={styles.leaveItem}>
                    <View style={styles.leaveItemLeft}>
                      <View
                        style={[
                          styles.leaveItemBadge,
                          {
                            backgroundColor:
                              izin.days > 0 ? "#dcfce7" : "#fef3c7",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.leaveItemBadgeText,
                            { color: izin.days > 0 ? "#10b981" : "#f59e0b" },
                          ]}
                        >
                          {izin.days > 0 ? `+${izin.days}` : izin.days} gün
                        </Text>
                      </View>
                      <View style={styles.leaveItemInfo}>
                        <Text style={styles.leaveItemType}>
                          {izinTypeLabels[izin.type]}
                        </Text>
                        <Text style={styles.leaveItemDate}>
                          {formatDate(izin.start_date)}
                        </Text>
                        {izin.description && (
                          <Text style={styles.leaveItemDesc} numberOfLines={1}>
                            {izin.description}
                          </Text>
                        )}
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
                  <CalendarDays size={40} color="#d1d5db" />
                  <Text style={styles.noIslemText}>Henüz izin kaydı yok</Text>
                </View>
              )}
            </ScrollView>
          ) : null}

          {/* Hamburger Menü */}
          <Modal visible={showPersonelMenu} transparent animationType="fade">
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={() => setShowPersonelMenu(false)}
            >
              <View style={styles.menuContainer}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>Ayarlar</Text>
                  <TouchableOpacity onPress={() => setShowPersonelMenu(false)}>
                    <X size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowPersonelMenu(false);
                    setShowNameEditModal(true);
                  }}
                >
                  <Edit3 size={20} color="#3b82f6" />
                  <Text style={styles.menuItemText}>İsmi Düzenle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleToggleIncludeInReports}
                >
                  {detailPersonel?.include_in_reports ? (
                    <>
                      <EyeOff size={20} color="#f59e0b" />
                      <Text style={styles.menuItemText}>
                        Raporlara Dahil Etme
                      </Text>
                    </>
                  ) : (
                    <>
                      <Eye size={20} color="#10b981" />
                      <Text style={styles.menuItemText}>
                        Raporlara Dahil Et
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleArchivePersonel}
                >
                  <Archive size={20} color="#8b5cf6" />
                  <Text style={styles.menuItemText}>Arşive Al</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDeletePersonel}
                >
                  <Trash2 size={20} color="#ef4444" />
                  <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                    Personeli Sil
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* İsim Düzenleme Modal */}
          <Modal visible={showNameEditModal} transparent animationType="fade">
            <View style={styles.nameEditOverlay}>
              <View style={styles.nameEditModal}>
                <Text style={styles.nameEditTitle}>İsmi Düzenle</Text>
                <Text style={styles.nameEditLabel}>Personel Adı</Text>
                <TextInput
                  style={styles.nameEditInput}
                  value={editPersonelName}
                  onChangeText={setEditPersonelName}
                  placeholder="Personel adı"
                  autoFocus
                />
                <View style={styles.nameEditBtns}>
                  <TouchableOpacity
                    style={styles.nameEditCancelBtn}
                    onPress={() => setShowNameEditModal(false)}
                  >
                    <Text style={styles.nameEditCancelText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nameEditSaveBtn}
                    onPress={handleEditPersonelName}
                    disabled={formLoading}
                  >
                    <Text style={styles.nameEditSaveText}>
                      {formLoading ? "Kaydediliyor..." : "Kaydet"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
              {izinTipi === "ekle" ? "İzin Hakkı Ekle" : "İzin Kullandır"} -{" "}
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

            {/* İZİN EKLEME: Sadece gün sayısı ve tarih */}
            {izinTipi === "ekle" ? (
              <>
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

                <DatePickerField
                  value={izinStartDate}
                  onChange={setIzinStartDate}
                  label="Ne Zaman Hakedildi?"
                />
              </>
            ) : (
              <>
                {/* İZİN DÜŞME: İki tarih alanı */}
                <View style={styles.izinDateRow}>
                  <View style={styles.izinDateField}>
                    <DatePickerField
                      value={izinStartDate}
                      onChange={(date) => {
                        setIzinStartDate(date);
                        // Gün sayısını otomatik hesapla
                        const start = new Date(date);
                        const end = new Date(izinEndDate);
                        if (end >= start) {
                          const diffTime = end.getTime() - start.getTime();
                          const diffDays =
                            Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                          setIzinDays(String(diffDays));
                        }
                      }}
                      label="İzne Çıkış Tarihi"
                    />
                  </View>
                  <View style={styles.izinDateField}>
                    <DatePickerField
                      value={izinEndDate}
                      onChange={(date) => {
                        setIzinEndDate(date);
                        // Gün sayısını otomatik hesapla
                        const start = new Date(izinStartDate);
                        const end = new Date(date);
                        if (end >= start) {
                          const diffTime = end.getTime() - start.getTime();
                          const diffDays =
                            Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                          setIzinDays(String(diffDays));
                        }
                      }}
                      label="İzinden Dönüş Tarihi"
                    />
                  </View>
                </View>

                {/* Manuel gün sayısı düzenleme */}
                <Text style={styles.formLabel}>Düşülecek Gün Sayısı</Text>
                <View style={styles.manualDaysContainer}>
                  <TouchableOpacity
                    style={styles.dayAdjustBtn}
                    onPress={() => {
                      const current = parseInt(izinDays) || 1;
                      if (current > 1) setIzinDays(String(current - 1));
                    }}
                  >
                    <MinusCircle size={24} color="#ef4444" />
                  </TouchableOpacity>
                  <View style={styles.dayInputWrapper}>
                    <TextInput
                      style={styles.manualDaysInput}
                      value={izinDays}
                      onChangeText={(text) => {
                        const num = text.replace(/[^0-9]/g, "");
                        setIzinDays(num || "1");
                      }}
                      keyboardType="number-pad"
                      textAlign="center"
                    />
                    <Text style={styles.dayInputLabel}>gün</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dayAdjustBtn}
                    onPress={() => {
                      const current = parseInt(izinDays) || 0;
                      setIzinDays(String(current + 1));
                    }}
                  >
                    <PlusCircle size={24} color="#10b981" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.daysHint}>
                  Tarihlerden otomatik hesaplandı. İsterseniz manuel
                  değiştirebilirsiniz.
                </Text>
              </>
            )}

            {/* Açıklama */}
            <Text style={[styles.formLabel, { marginTop: 16 }]}>
              Açıklama (opsiyonel)
            </Text>
            <TextInput
              style={styles.izinDescInput}
              value={izinDescription}
              onChangeText={setIzinDescription}
              placeholder={
                izinTipi === "ekle"
                  ? "Ör: Yıllık izin hakkı..."
                  : "Ör: Tatil, rapor..."
              }
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
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
                  ? "İzin Hakkı Ekle"
                  : "İzin Kullandır"}
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
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  personelPosition: {
    fontSize: 13,
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
    fontSize: 11,
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
    fontSize: 14,
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
    fontSize: 13,
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
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 12,
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
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  formLabel: {
    fontSize: 14,
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
    fontSize: 13,
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
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
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
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 18,
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
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailBalanceValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
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
    fontSize: 13,
    fontWeight: "700",
  },
  islemDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  islemDesc: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  islemKasa: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  islemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  islemAmount: {
    fontSize: 15,
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
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
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
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  daysLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  izinDescInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    textAlignVertical: "top",
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
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  // Hamburger menü stilleri
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
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#374151",
  },
  excludedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  excludedBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f59e0b",
  },
  // İsim düzenleme modal stilleri
  nameEditOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  nameEditModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 360,
  },
  nameEditTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  nameEditLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  nameEditInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  nameEditBtns: {
    flexDirection: "row",
    gap: 12,
  },
  nameEditCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  nameEditCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  nameEditSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  nameEditSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Detail Modal Sekmeleri
  detailTabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
  },
  detailTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  detailTabActive: {
    backgroundColor: "#3b82f6",
  },
  detailTabActiveIzin: {
    backgroundColor: "#8b5cf6",
  },
  detailTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  detailTabTextActive: {
    color: "#fff",
  },
  // İzin Özet Kartı
  izinSummaryCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  izinSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  izinSummaryItem: {
    alignItems: "center",
  },
  izinSummaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0369a1",
  },
  izinSummaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  // İzin Hareketleri Liste Item (farklı isim - leave)
  leaveItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  leaveItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  leaveItemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  leaveItemBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  leaveItemInfo: {
    flex: 1,
  },
  leaveItemType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  leaveItemDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  leaveItemDesc: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  // İzin Tarih Seçimi (İzin Düşme)
  izinDateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  izinDateField: {
    flex: 1,
  },
  // Manuel gün sayısı düzenleme
  manualDaysContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  dayAdjustBtn: {
    padding: 8,
  },
  dayInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  manualDaysInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    minWidth: 50,
  },
  dayInputLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  daysHint: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 16,
  },
});
