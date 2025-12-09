import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  FileText,
  Calendar,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddCekSenetModal from "../../src/components/AddCekSenetModal";
import { CekSenet, CekSenetStatus } from "../../src/types";

type FilterType = "all" | "cek" | "senet";
type DirectionFilter = "all" | "alacak" | "borc";

const statusLabels: Record<CekSenetStatus, string> = {
  beklemede: "Beklemede",
  tahsil_edildi: "Tahsil Edildi",
  odendi: "Ödendi",
  karsilıksiz: "Karşılıksız",
  iptal: "İptal",
};

const statusColors: Record<CekSenetStatus, string> = {
  beklemede: "#f59e0b",
  tahsil_edildi: "#10b981",
  odendi: "#10b981",
  karsilıksiz: "#ef4444",
  iptal: "#6b7280",
};

export default function CekSenetScreen() {
  const {
    cekSenetler,
    loadingCekSenetler,
    fetchCekSenetler,
    fetchProfile,
    profile,
    fetchCariler,
  } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchCariler();
      fetchCekSenetler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCekSenetler();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
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

  const filteredCekSenetler = cekSenetler.filter((cs) => {
    if (filter !== "all" && cs.type !== filter) return false;
    if (directionFilter !== "all" && cs.direction !== directionFilter)
      return false;
    return true;
  });

  const bekleyenAlacak = cekSenetler
    .filter((cs) => cs.direction === "alacak" && cs.status === "beklemede")
    .reduce((sum, cs) => sum + cs.amount, 0);

  const bekleyenBorc = cekSenetler
    .filter((cs) => cs.direction === "borc" && cs.status === "beklemede")
    .reduce((sum, cs) => sum + cs.amount, 0);

  const renderCekSenetItem = ({ item }: { item: CekSenet }) => {
    const isAlacak = item.direction === "alacak";

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.cardIcon,
              { backgroundColor: isAlacak ? "#dcfce7" : "#fee2e2" },
            ]}
          >
            {isAlacak ? (
              <ArrowDownLeft size={24} color="#10b981" />
            ) : (
              <ArrowUpRight size={24} color="#ef4444" />
            )}
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardType}>
                {item.type === "cek" ? "Çek" : "Senet"}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[item.status] + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColors[item.status] },
                  ]}
                >
                  {statusLabels[item.status]}
                </Text>
              </View>
            </View>
            {item.cari && <Text style={styles.cardCari}>{item.cari.name}</Text>}
            <View style={styles.cardMeta}>
              <Calendar size={12} color="#6b7280" />
              <Text style={styles.cardDate}>
                Vade: {formatDate(item.due_date)}
              </Text>
            </View>
            {item.document_no && (
              <Text style={styles.cardSerial}>No: {item.document_no}</Text>
            )}
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text
            style={[
              styles.cardAmount,
              { color: isAlacak ? "#10b981" : "#ef4444" },
            ]}
          >
            {isAlacak ? "+" : "-"}
            {formatCurrency(item.amount)}
          </Text>
          <Text style={styles.cardDirection}>
            {isAlacak ? "Alacak" : "Borç"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Çek / Senet</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Özet Kartlar */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summaryCardGreen]}>
          <ArrowDownLeft size={20} color="#10b981" />
          <Text style={styles.summaryLabel}>Bekleyen Alacak</Text>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {formatCurrency(bekleyenAlacak)}
          </Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardRed]}>
          <ArrowUpRight size={20} color="#ef4444" />
          <Text style={styles.summaryLabel}>Bekleyen Borç</Text>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            {formatCurrency(bekleyenBorc)}
          </Text>
        </View>
      </View>

      {/* Filtreler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "all" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "all" && styles.filterChipTextActive,
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "cek" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("cek")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "cek" && styles.filterChipTextActive,
            ]}
          >
            Çekler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "senet" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("senet")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "senet" && styles.filterChipTextActive,
            ]}
          >
            Senetler
          </Text>
        </TouchableOpacity>
        <View style={styles.filterDivider} />
        <TouchableOpacity
          style={[
            styles.filterChip,
            directionFilter === "alacak" && styles.filterChipActiveGreen,
          ]}
          onPress={() =>
            setDirectionFilter(directionFilter === "alacak" ? "all" : "alacak")
          }
        >
          <ArrowDownLeft
            size={14}
            color={directionFilter === "alacak" ? "#fff" : "#10b981"}
          />
          <Text
            style={[
              styles.filterChipText,
              directionFilter === "alacak" && styles.filterChipTextActive,
            ]}
          >
            Alacak
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            directionFilter === "borc" && styles.filterChipActiveRed,
          ]}
          onPress={() =>
            setDirectionFilter(directionFilter === "borc" ? "all" : "borc")
          }
        >
          <ArrowUpRight
            size={14}
            color={directionFilter === "borc" ? "#fff" : "#ef4444"}
          />
          <Text
            style={[
              styles.filterChipText,
              directionFilter === "borc" && styles.filterChipTextActive,
            ]}
          >
            Borç
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Liste veya Boş Durum */}
      {filteredCekSenetler.length > 0 ? (
        <FlatList
          data={filteredCekSenetler}
          renderItem={renderCekSenetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <FileText size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Çek/Senet bulunamadı</Text>
          <Text style={styles.emptyText}>
            Çek veya senet eklemek için{"\n"}
            sağ üstteki + butonuna tıklayın
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Çek/Senet Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Modal */}
      <AddCekSenetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
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
    backgroundColor: "#6366f1",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCardGreen: {
    borderTopWidth: 3,
    borderTopColor: "#10b981",
  },
  summaryCardRed: {
    borderTopWidth: 3,
    borderTopColor: "#ef4444",
  },
  summaryLabel: {
    fontSize: 19,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    gap: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  filterChipActiveGreen: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  filterChipActiveRed: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  filterChipText: {
    fontSize: 19,
    color: "#6b7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardType: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 19,
    fontWeight: "600",
  },
  cardCari: {
    fontSize: 19,
    color: "#6366f1",
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 19,
    color: "#6b7280",
  },
  cardSerial: {
    fontSize: 19,
    color: "#9ca3af",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  cardAmount: {
    fontSize: 19,
    fontWeight: "600",
  },
  cardDirection: {
    fontSize: 19,
    color: "#9ca3af",
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
    backgroundColor: "#6366f1",
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
});
