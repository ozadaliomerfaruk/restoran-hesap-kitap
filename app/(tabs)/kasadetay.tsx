import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Trash2,
  MoreVertical,
  Archive,
  X,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import { supabase } from "../../src/lib/supabase";
import { Islem, PersonelIslem } from "../../src/types";

// Birleşik işlem tipi
interface BirlesikIslem {
  id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  kasa_id?: string;
  source: "islem" | "personel"; // İşlemin kaynağı
  cari?: { id: string; name: string; type: string };
  personel?: { id: string; name: string };
  kategori?: { id: string; name: string };
}

const kasaIcons: Record<string, any> = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
  kredi_karti: { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" },
  birikim: { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" },
};

export default function KasaDetayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { kasalar, fetchKasalar, fetchProfile, profile } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [kasaIslemleri, setKasaIslemleri] = useState<BirlesikIslem[]>([]);

  const kasa = kasalar.find((k) => k.id === id);

  // Sayfa açıldığında verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchProfile();
  };

  // Doğrudan veritabanından bu kasanın TÜM işlemlerini çek (islemler + personel_islemler)
  const fetchKasaIslemleri = async () => {
    if (!id || !profile?.restaurant_id) return;

    // 1. Normal işlemleri çek
    const { data: islemlerData, error: islemlerError } = await supabase
      .from("islemler")
      .select(
        `
        *,
        cari:cariler(id, name, type),
        kategori:kategoriler(id, name)
      `
      )
      .eq("restaurant_id", profile.restaurant_id)
      .or(`kasa_id.eq.${id},kasa_hedef_id.eq.${id}`)
      .order("date", { ascending: false });

    if (islemlerError) {
      console.log("İşlemler çekme hatası:", islemlerError);
    }

    // 2. Personel işlemlerini çek (sadece kasa_id olanlar - ödeme ve tahsilat)
    const { data: personelData, error: personelError } = await supabase
      .from("personel_islemler")
      .select(
        `
        *,
        personel:personel(id, name)
      `
      )
      .eq("restaurant_id", profile.restaurant_id)
      .eq("kasa_id", id)
      .order("date", { ascending: false });

    if (personelError) {
      console.log("Personel işlemleri çekme hatası:", personelError);
    }

    // 3. Her iki listeyi birleştir
    const birlesikListe: BirlesikIslem[] = [];

    // Normal işlemleri ekle
    (islemlerData || []).forEach((islem) => {
      birlesikListe.push({
        id: islem.id,
        type: islem.type,
        amount: islem.amount,
        description: islem.description,
        date: islem.date,
        kasa_id: islem.kasa_id,
        source: "islem",
        cari: islem.cari,
        kategori: islem.kategori,
      });
    });

    // Personel işlemlerini ekle
    (personelData || []).forEach((islem) => {
      birlesikListe.push({
        id: islem.id,
        type:
          islem.type === "odeme"
            ? "personel_odeme"
            : islem.type === "tahsilat"
            ? "personel_tahsilat"
            : islem.type,
        amount: islem.amount,
        description: islem.description,
        date: islem.date,
        kasa_id: islem.kasa_id,
        source: "personel",
        personel: islem.personel,
      });
    });

    // Tarihe göre sırala (en yeni en üstte)
    birlesikListe.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setKasaIslemleri(birlesikListe);
  };

  // Profile ve id hazır olduğunda işlemleri çek
  useEffect(() => {
    if (profile?.restaurant_id && id) {
      fetchKasalar();
      fetchKasaIslemleri();
    }
  }, [profile?.restaurant_id, id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchKasalar();
    await fetchKasaIslemleri();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIslemIcon = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") {
      return islem.kasa_id === id ? (
        <ArrowUpRight size={18} color="#f59e0b" />
      ) : (
        <ArrowDownLeft size={18} color="#f59e0b" />
      );
    }
    switch (islem.type) {
      case "gelir":
        return <ArrowDownLeft size={18} color="#10b981" />;
      case "gider":
        return <ArrowUpRight size={18} color="#ef4444" />;
      case "odeme":
        return <ArrowUpRight size={18} color="#3b82f6" />;
      case "tahsilat":
        return <ArrowDownLeft size={18} color="#8b5cf6" />;
      case "personel_odeme":
        return <ArrowUpRight size={18} color="#ec4899" />;
      case "personel_tahsilat":
        return <ArrowDownLeft size={18} color="#14b8a6" />;
      default:
        return <ArrowRightLeft size={18} color="#6b7280" />;
    }
  };

  const getIslemColor = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") return "#f59e0b";
    const colors: Record<string, string> = {
      gelir: "#10b981",
      gider: "#ef4444",
      odeme: "#3b82f6",
      tahsilat: "#8b5cf6",
      personel_odeme: "#ec4899",
      personel_tahsilat: "#14b8a6",
    };
    return colors[islem.type] || "#6b7280";
  };

  const getIslemLabel = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") {
      return islem.kasa_id === id ? "TRANSFER (Çıkış)" : "TRANSFER (Giriş)";
    }
    const labels: Record<string, string> = {
      gelir: "GELİR",
      gider: "GİDER",
      odeme: "CARİ ÖDEME",
      tahsilat: "CARİ TAHSİLAT",
      personel_odeme: "PERSONEL ÖDEME",
      personel_tahsilat: "PERSONEL TAHSİLAT",
    };
    return labels[islem.type] || islem.type.toUpperCase();
  };

  const getIslemSign = (islem: BirlesikIslem) => {
    if (islem.type === "transfer") return islem.kasa_id === id ? "-" : "+";
    if (
      islem.type === "gelir" ||
      islem.type === "tahsilat" ||
      islem.type === "personel_tahsilat"
    )
      return "+";
    return "-";
  };

  const handleDeleteIslem = async (islem: BirlesikIslem) => {
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
            try {
              if (islem.source === "personel") {
                // Personel işlemi silme
                // Kasa bakiyesini geri al (ödeme için + / tahsilat için -)
                if (islem.type === "personel_odeme") {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: id,
                    amount: islem.amount,
                  });
                } else if (islem.type === "personel_tahsilat") {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: id,
                    amount: -islem.amount,
                  });
                }

                // Personel bakiyesini geri al
                if (islem.personel?.id) {
                  if (islem.type === "personel_odeme") {
                    await supabase.rpc("update_personel_balance", {
                      p_personel_id: islem.personel.id,
                      p_amount: islem.amount,
                    });
                  } else if (islem.type === "personel_tahsilat") {
                    await supabase.rpc("update_personel_balance", {
                      p_personel_id: islem.personel.id,
                      p_amount: -islem.amount,
                    });
                  }
                }

                await supabase
                  .from("personel_islemler")
                  .delete()
                  .eq("id", islem.id);
              } else {
                // Normal işlem silme
                let kasaBalanceChange = 0;
                if (islem.type === "gelir" || islem.type === "tahsilat") {
                  kasaBalanceChange = -islem.amount;
                } else if (islem.type === "gider" || islem.type === "odeme") {
                  kasaBalanceChange = islem.amount;
                } else if (islem.type === "transfer") {
                  if (islem.kasa_id) {
                    await supabase.rpc("update_kasa_balance", {
                      kasa_id: islem.kasa_id,
                      amount: islem.amount,
                    });
                  }
                }

                if (kasaBalanceChange !== 0 && islem.kasa_id) {
                  await supabase.rpc("update_kasa_balance", {
                    kasa_id: islem.kasa_id,
                    amount: kasaBalanceChange,
                  });
                }

                if (islem.cari?.id) {
                  let cariBalanceChange = 0;
                  if (islem.type === "gider") cariBalanceChange = -islem.amount;
                  else if (islem.type === "gelir")
                    cariBalanceChange = islem.amount;
                  else if (islem.type === "odeme")
                    cariBalanceChange = islem.amount;
                  else if (islem.type === "tahsilat")
                    cariBalanceChange = -islem.amount;

                  if (cariBalanceChange !== 0) {
                    await supabase.rpc("update_cari_balance", {
                      cari_id: islem.cari.id,
                      amount: cariBalanceChange,
                    });
                  }
                }

                await supabase.from("islemler").delete().eq("id", islem.id);
              }

              fetchKasalar();
              fetchKasaIslemleri();
              Alert.alert("Başarılı", "İşlem silindi");
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

  const handleArchiveKasa = () => {
    setShowMenu(false);
    Alert.alert(
      "Arşive Al",
      `"${kasa?.name}" hesabını arşive almak istediğinize emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Arşive Al",
          onPress: async () => {
            if (!kasa) return;
            setLoading(true);
            const { error } = await supabase
              .from("kasalar")
              .update({ is_archived: true })
              .eq("id", kasa.id);
            setLoading(false);
            if (error) {
              Alert.alert("Hata", "Arşive alınırken bir hata oluştu");
            } else {
              Alert.alert("Başarılı", "Hesap arşive alındı");
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!kasa) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hesap Bulunamadı</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
  const IconComponent = iconConfig.icon;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesap Detay</Text>
        <TouchableOpacity
          onPress={() => setShowMenu(true)}
          style={styles.menuButton}
        >
          <MoreVertical size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View
              style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}
            >
              <IconComponent size={32} color={iconConfig.color} />
            </View>
            <View style={styles.infoMain}>
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
          </View>
          <View
            style={[
              styles.balanceBox,
              { borderLeftColor: kasa.balance >= 0 ? "#10b981" : "#ef4444" },
            ]}
          >
            <Text style={styles.balanceLabel}>Güncel Bakiye</Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: kasa.balance >= 0 ? "#10b981" : "#ef4444" },
              ]}
            >
              {formatCurrency(kasa.balance)}
            </Text>
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>
            İşlem Geçmişi ({kasaIslemleri.length})
          </Text>
          {kasaIslemleri.length > 0 ? (
            kasaIslemleri.map((islem) => (
              <View
                key={`${islem.source}-${islem.id}`}
                style={styles.islemItem}
              >
                <View style={styles.islemLeft}>
                  <View
                    style={[
                      styles.islemIconBox,
                      { backgroundColor: `${getIslemColor(islem)}15` },
                    ]}
                  >
                    {getIslemIcon(islem)}
                  </View>
                  <View style={styles.islemInfo}>
                    <Text
                      style={[
                        styles.islemType,
                        { color: getIslemColor(islem) },
                      ]}
                    >
                      {getIslemLabel(islem)}
                    </Text>
                    <Text style={styles.islemDate}>
                      {formatDate(islem.date)}
                    </Text>
                    {islem.description && (
                      <Text style={styles.islemDesc} numberOfLines={1}>
                        {islem.description}
                      </Text>
                    )}
                    {islem.cari && (
                      <Text style={styles.islemCari}>{islem.cari.name}</Text>
                    )}
                    {islem.personel && (
                      <Text style={styles.islemPersonel}>
                        {islem.personel.name}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.islemRight}>
                  <Text
                    style={[
                      styles.islemAmount,
                      { color: getIslemColor(islem) },
                    ]}
                  >
                    {getIslemSign(islem)}
                    {formatCurrency(islem.amount)}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteIslem(islem)}
                    disabled={loading}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Henüz işlem yok</Text>
            </View>
          )}
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

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
              onPress={handleArchiveKasa}
            >
              <Archive size={20} color="#8b5cf6" />
              <Text style={styles.menuItemText}>Arşive Al</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  menuButton: { padding: 4 },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  kasaIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoMain: { marginLeft: 16, flex: 1 },
  kasaName: { fontSize: 22, fontWeight: "700", color: "#111827" },
  kasaType: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  balanceBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    alignItems: "center",
  },
  balanceLabel: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  balanceAmount: { fontSize: 32, fontWeight: "700" },
  historySection: { marginBottom: 20 },
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
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: { marginLeft: 12, flex: 1 },
  islemType: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  islemDate: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  islemDesc: { fontSize: 12, color: "#374151", marginTop: 2 },
  islemCari: { fontSize: 12, color: "#3b82f6", marginTop: 2 },
  islemPersonel: { fontSize: 12, color: "#ec4899", marginTop: 2 },
  islemRight: { alignItems: "flex-end", gap: 8 },
  islemAmount: { fontSize: 15, fontWeight: "600" },
  deleteBtn: { padding: 4 },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#9ca3af" },
  bottomPadding: { height: 30 },
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
});
