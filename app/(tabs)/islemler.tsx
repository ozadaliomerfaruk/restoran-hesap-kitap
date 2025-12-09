import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddIslemModal from "../../src/components/AddIslemModal";
import { IslemType, Islem } from "../../src/types";

type FilterType = "all" | "gelir" | "gider";

export default function Islemler() {
  const {
    islemler,
    loadingIslemler,
    fetchIslemler,
    fetchProfile,
    profile,
    fetchKasalar,
    fetchCariler,
    fetchKategoriler,
  } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"gelir" | "gider">("gider");
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchIslemler();
      fetchKasalar();
      fetchCariler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIslemler();
    setRefreshing(false);
  };

  const openAddModal = (type: "gelir" | "gider") => {
    setAddModalType(type);
    setShowAddModal(true);
  };

  const filteredIslemler = islemler.filter((islem) => {
    if (filter === "all") return true;
    if (filter === "gelir")
      return islem.type === "gelir" || islem.type === "tahsilat";
    if (filter === "gider")
      return islem.type === "gider" || islem.type === "odeme";
    return true;
  });

  const totalGelir = islemler
    .filter((i) => i.type === "gelir" || i.type === "tahsilat")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalGider = islemler
    .filter((i) => i.type === "gider" || i.type === "odeme")
    .reduce((sum, i) => sum + i.amount, 0);

  const netAmount = totalGelir - totalGider;

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
    });
  };

  const renderIslemItem = ({ item }: { item: Islem }) => {
    const isIncome = item.type === "gelir" || item.type === "tahsilat";

    return (
      <TouchableOpacity style={styles.islemCard}>
        <View style={styles.islemLeft}>
          <View
            style={[
              styles.islemIcon,
              { backgroundColor: isIncome ? "#dcfce7" : "#fee2e2" },
            ]}
          >
            {isIncome ? (
              <ArrowDownLeft size={20} color="#10b981" />
            ) : (
              <ArrowUpRight size={20} color="#ef4444" />
            )}
          </View>
          <View style={styles.islemInfo}>
            <Text style={styles.islemDescription} numberOfLines={1}>
              {item.description || (isIncome ? "Gelir" : "Gider")}
            </Text>
            <Text style={styles.islemMeta}>
              {item.kasa?.name || "Kasa"} • {formatDate(item.date)}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.islemAmount,
            { color: isIncome ? "#10b981" : "#ef4444" },
          ]}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>İşlemler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal("gider")}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search ve Filter */}
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.searchBar}>
          <Search size={20} color="#9ca3af" />
          <Text style={styles.searchText}>İşlem ara...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
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
            filter === "gelir" && styles.filterChipActiveGreen,
          ]}
          onPress={() => setFilter("gelir")}
        >
          <ArrowDownLeft
            size={14}
            color={filter === "gelir" ? "#fff" : "#10b981"}
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "gelir" && styles.filterChipTextActive,
            ]}
          >
            Gelirler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "gider" && styles.filterChipActiveRed,
          ]}
          onPress={() => setFilter("gider")}
        >
          <ArrowUpRight
            size={14}
            color={filter === "gider" ? "#fff" : "#ef4444"}
          />
          <Text
            style={[
              styles.filterChipText,
              filter === "gider" && styles.filterChipTextActive,
            ]}
          >
            Giderler
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* İşlem Özeti */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <ArrowDownLeft size={16} color="#10b981" />
          <Text style={styles.summaryLabel}>Gelir</Text>
          <Text style={styles.summaryAmountPositive}>
            {formatCurrency(totalGelir)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <ArrowUpRight size={16} color="#ef4444" />
          <Text style={styles.summaryLabel}>Gider</Text>
          <Text style={styles.summaryAmountNegative}>
            {formatCurrency(totalGider)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text
            style={[
              styles.summaryAmountNet,
              { color: netAmount >= 0 ? "#10b981" : "#ef4444" },
            ]}
          >
            {formatCurrency(netAmount)}
          </Text>
        </View>
      </View>

      {/* Liste veya Boş Durum */}
      {filteredIslemler.length > 0 ? (
        <FlatList
          data={filteredIslemler}
          renderItem={renderIslemItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <ClipboardList size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Henüz işlem yok</Text>
          <Text style={styles.emptyText}>
            Gelir veya gider eklemek için{"\n"}
            aşağıdaki butonlara tıklayın
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.incomeButton}
              onPress={() => openAddModal("gelir")}
            >
              <ArrowDownLeft size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Gelir Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.expenseButton}
              onPress={() => openAddModal("gider")}
            >
              <ArrowUpRight size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Gider Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add Modal */}
      <AddIslemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        initialType={addModalType}
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
    backgroundColor: "#10b981",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchText: {
    color: "#9ca3af",
    fontSize: 19,
  },
  filterButton: {
    backgroundColor: "#fff",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersContainer: {
    marginTop: 16,
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    gap: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
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
  summaryRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 19,
    color: "#6b7280",
  },
  summaryAmountPositive: {
    fontSize: 19,
    fontWeight: "700",
    color: "#10b981",
  },
  summaryAmountNegative: {
    fontSize: 19,
    fontWeight: "700",
    color: "#ef4444",
  },
  summaryAmountNet: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
  },
  islemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 19,
    fontWeight: "500",
    color: "#111827",
  },
  islemMeta: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  islemAmount: {
    fontSize: 19,
    fontWeight: "600",
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  incomeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  expenseButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "600",
  },
});
