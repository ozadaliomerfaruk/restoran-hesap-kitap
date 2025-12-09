import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Archive,
  ArchiveRestore,
  Trash2,
  Building2,
  Users,
  Wallet,
  UserCheck,
  CreditCard,
  PiggyBank,
} from "lucide-react-native";
import { supabase } from "../../src/lib/supabase";
import { useStore } from "../../src/store/useStore";

type TabType = "cariler" | "personel" | "hesaplar";

interface ArchivedItem {
  id: string;
  name: string;
  type?: string;
  balance: number;
  is_archived: boolean;
  created_at: string;
}

export default function ArsivScreen() {
  const {
    profile,
    fetchProfile,
    fetchCariler,
    fetchPersoneller,
    fetchKasalar,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabType>("cariler");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [archivedCariler, setArchivedCariler] = useState<ArchivedItem[]>([]);
  const [archivedPersoneller, setArchivedPersoneller] = useState<
    ArchivedItem[]
  >([]);
  const [archivedKasalar, setArchivedKasalar] = useState<ArchivedItem[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      loadArchivedData();
    }
  }, [profile?.restaurant_id]);

  const loadArchivedData = async () => {
    if (!profile?.restaurant_id) return;

    // Arşivlenmiş cariler
    const { data: cariler } = await supabase
      .from("cariler")
      .select("id, name, type, balance, is_archived, created_at")
      .eq("restaurant_id", profile.restaurant_id)
      .eq("is_archived", true)
      .order("name");
    setArchivedCariler(cariler || []);

    // Arşivlenmiş personeller
    const { data: personeller } = await supabase
      .from("personeller")
      .select("id, name, balance, is_archived, created_at")
      .eq("restaurant_id", profile.restaurant_id)
      .eq("is_archived", true)
      .order("name");
    setArchivedPersoneller(personeller || []);

    // Arşivlenmiş kasalar
    const { data: kasalar } = await supabase
      .from("kasalar")
      .select("id, name, type, balance, is_archived, created_at")
      .eq("restaurant_id", profile.restaurant_id)
      .eq("is_archived", true)
      .order("name");
    setArchivedKasalar(kasalar || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArchivedData();
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

  // Arşivden Çıkarma
  const handleRestore = (item: ArchivedItem, table: string) => {
    Alert.alert("Arşivden Çıkar", `"${item.name}" arşivden çıkarılsın mı?`, [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkar",
        onPress: async () => {
          setLoading(true);
          const { error } = await supabase
            .from(table)
            .update({ is_archived: false })
            .eq("id", item.id);

          setLoading(false);

          if (error) {
            Alert.alert("Hata", "Arşivden çıkarılırken bir hata oluştu");
          } else {
            loadArchivedData();
            // Ana listeleri de güncelle
            if (table === "cariler") fetchCariler();
            if (table === "personeller") fetchPersoneller();
            if (table === "kasalar") fetchKasalar();
            Alert.alert("Başarılı", `"${item.name}" arşivden çıkarıldı`);
          }
        },
      },
    ]);
  };

  // Kalıcı Silme
  const handlePermanentDelete = (item: ArchivedItem, table: string) => {
    Alert.alert(
      "Kalıcı Olarak Sil",
      `"${item.name}" kalıcı olarak silinecek.\n\nBu işlem geri alınamaz!`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from(table)
              .delete()
              .eq("id", item.id);

            setLoading(false);

            if (error) {
              Alert.alert("Hata", "Silinirken bir hata oluştu");
            } else {
              loadArchivedData();
              Alert.alert("Başarılı", `"${item.name}" kalıcı olarak silindi`);
            }
          },
        },
      ]
    );
  };

  const getIcon = (item: ArchivedItem, type: TabType) => {
    if (type === "cariler") {
      return item.type === "tedarikci" ? (
        <Building2 size={22} color="#3b82f6" />
      ) : (
        <Users size={22} color="#10b981" />
      );
    }
    if (type === "personel") {
      return <UserCheck size={22} color="#8b5cf6" />;
    }
    if (type === "hesaplar") {
      if (item.type === "banka") return <Building2 size={22} color="#3b82f6" />;
      if (item.type === "kredi_karti")
        return <CreditCard size={22} color="#f59e0b" />;
      if (item.type === "birikim")
        return <PiggyBank size={22} color="#8b5cf6" />;
      return <Wallet size={22} color="#10b981" />;
    }
    return <Archive size={22} color="#6b7280" />;
  };

  const getIconBg = (item: ArchivedItem, type: TabType) => {
    if (type === "cariler") {
      return item.type === "tedarikci" ? "#dbeafe" : "#dcfce7";
    }
    if (type === "personel") return "#ede9fe";
    if (type === "hesaplar") {
      if (item.type === "banka") return "#dbeafe";
      if (item.type === "kredi_karti") return "#fef3c7";
      if (item.type === "birikim") return "#ede9fe";
      return "#dcfce7";
    }
    return "#f3f4f6";
  };

  const getSubtitle = (item: ArchivedItem, type: TabType) => {
    if (type === "cariler") {
      return item.type === "tedarikci" ? "Tedarikçi" : "Müşteri";
    }
    if (type === "personel") return "Personel";
    if (type === "hesaplar") {
      if (item.type === "banka") return "Banka Hesabı";
      if (item.type === "kredi_karti") return "Kredi Kartı";
      if (item.type === "birikim") return "Birikim";
      return "Nakit";
    }
    return "";
  };

  const renderItem = (item: ArchivedItem, type: TabType, table: string) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemLeft}>
        <View
          style={[styles.itemIcon, { backgroundColor: getIconBg(item, type) }]}
        >
          {getIcon(item, type)}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{getSubtitle(item, type)}</Text>
          <Text style={styles.itemDate}>
            Arşivlenme: {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.itemBalance,
            item.balance < 0 && styles.negativeBalance,
          ]}
        >
          {formatCurrency(item.balance)}
        </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={() => handleRestore(item, table)}
            disabled={loading}
          >
            <ArchiveRestore size={18} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handlePermanentDelete(item, table)}
            disabled={loading}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    let items: ArchivedItem[] = [];
    let table = "";
    let emptyText = "";

    switch (activeTab) {
      case "cariler":
        items = archivedCariler;
        table = "cariler";
        emptyText = "Arşivlenmiş cari yok";
        break;
      case "personel":
        items = archivedPersoneller;
        table = "personeller";
        emptyText = "Arşivlenmiş personel yok";
        break;
      case "hesaplar":
        items = archivedKasalar;
        table = "kasalar";
        emptyText = "Arşivlenmiş hesap yok";
        break;
    }

    if (items.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Archive size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>{emptyText}</Text>
          <Text style={styles.emptyText}>
            Arşive alınan öğeler burada görünecek
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.itemList}>
        {items.map((item) => renderItem(item, activeTab, table))}
      </View>
    );
  };

  const totalCount =
    archivedCariler.length +
    archivedPersoneller.length +
    archivedKasalar.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Arşiv</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalCount}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "cariler" && styles.tabActive]}
          onPress={() => setActiveTab("cariler")}
        >
          <Building2
            size={18}
            color={activeTab === "cariler" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "cariler" && styles.tabTextActive,
            ]}
          >
            Cariler ({archivedCariler.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "personel" && styles.tabActive]}
          onPress={() => setActiveTab("personel")}
        >
          <UserCheck
            size={18}
            color={activeTab === "personel" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "personel" && styles.tabTextActive,
            ]}
          >
            Personel ({archivedPersoneller.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "hesaplar" && styles.tabActive]}
          onPress={() => setActiveTab("hesaplar")}
        >
          <Wallet
            size={18}
            color={activeTab === "hesaplar" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "hesaplar" && styles.tabTextActive,
            ]}
          >
            Hesaplar ({archivedKasalar.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tabActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  itemList: {
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  itemDate: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  itemBalance: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  negativeBalance: {
    color: "#ef4444",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  restoreBtn: {
    backgroundColor: "#dcfce7",
    padding: 8,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  bottomPadding: {
    height: 30,
  },
});
