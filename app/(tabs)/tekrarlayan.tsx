import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, RefreshCw, Calendar, AlertCircle } from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddTekrarlayanOdemeModal from "../../src/components/AddTekrarlayanOdemeModal";
import { TekrarlayanOdeme } from "../../src/types";

const periodLabels: Record<string, string> = {
  gunluk: "Günlük",
  haftalik: "Haftalık",
  aylik: "Aylık",
  "2aylik": "2 Ayda Bir",
  "3aylik": "3 Ayda Bir",
  "6aylik": "6 Ayda Bir",
  yillik: "Yıllık",
};

export default function TekrarlayanScreen() {
  const {
    tekrarlayanOdemeler,
    loadingTekrarlayanOdemeler,
    fetchTekrarlayanOdemeler,
    fetchProfile,
    profile,
    fetchKasalar,
    fetchCariler,
    fetchKategoriler,
  } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
      fetchCariler();
      fetchKategoriler();
      fetchTekrarlayanOdemeler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTekrarlayanOdemeler();
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
    });
  };

  const isOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    return dueDate < today;
  };

  const isDueSoon = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    return dueDate <= threeDaysLater && dueDate >= today;
  };

  const totalMonthly = tekrarlayanOdemeler
    .filter((o) => o.period === "aylik")
    .reduce((sum, o) => sum + o.amount, 0);

  const overdueCount = tekrarlayanOdemeler.filter((o) =>
    isOverdue(o.next_date)
  ).length;

  const renderOdemeItem = ({ item }: { item: TekrarlayanOdeme }) => {
    const overdue = isOverdue(item.next_date);
    const dueSoon = isDueSoon(item.next_date);

    return (
      <TouchableOpacity
        style={[
          styles.odemeCard,
          overdue && styles.odemeCardOverdue,
          dueSoon && !overdue && styles.odemeCardDueSoon,
        ]}
      >
        <View style={styles.odemeLeft}>
          <View
            style={[
              styles.odemeIcon,
              overdue && styles.odemeIconOverdue,
              dueSoon && !overdue && styles.odemeIconDueSoon,
            ]}
          >
            {overdue ? (
              <AlertCircle size={24} color="#ef4444" />
            ) : (
              <RefreshCw size={24} color={dueSoon ? "#f59e0b" : "#8b5cf6"} />
            )}
          </View>
          <View style={styles.odemeInfo}>
            <Text style={styles.odemeName}>{item.title}</Text>
            <View style={styles.odemeMeta}>
              <Calendar size={12} color="#6b7280" />
              <Text
                style={[styles.odemeDate, overdue && styles.odemeDateOverdue]}
              >
                {overdue ? "Gecikti: " : ""}
                {formatDate(item.next_date)}
              </Text>
              <Text style={styles.odemeFrequency}>
                • {periodLabels[item.period] || item.period}
              </Text>
            </View>
            {item.cari && (
              <Text style={styles.odemeCari}>{item.cari.name}</Text>
            )}
          </View>
        </View>
        <Text
          style={[styles.odemeAmount, overdue && styles.odemeAmountOverdue]}
        >
          {formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tekrarlayan Ödemeler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Özet Kart */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <RefreshCw size={20} color="#8b5cf6" />
          <Text style={styles.summaryValue}>{tekrarlayanOdemeler.length}</Text>
          <Text style={styles.summaryLabel}>Aktif Ödeme</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Calendar size={20} color="#10b981" />
          <Text style={styles.summaryValue}>
            {formatCurrency(totalMonthly)}
          </Text>
          <Text style={styles.summaryLabel}>Aylık Toplam</Text>
        </View>
        {overdueCount > 0 && (
          <>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <AlertCircle size={20} color="#ef4444" />
              <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                {overdueCount}
              </Text>
              <Text style={styles.summaryLabel}>Gecikmiş</Text>
            </View>
          </>
        )}
      </View>

      {/* Liste veya Boş Durum */}
      {tekrarlayanOdemeler.length > 0 ? (
        <FlatList
          data={tekrarlayanOdemeler}
          renderItem={renderOdemeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <RefreshCw size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Tekrarlayan ödeme yok</Text>
          <Text style={styles.emptyText}>
            Kira, sigorta, fatura gibi{"\n"}
            düzenli ödemelerinizi ekleyin
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Ödeme Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Modal */}
      <AddTekrarlayanOdemeModal
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  addButton: {
    backgroundColor: "#8b5cf6",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
  },
  summaryValue: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 19,
    color: "#6b7280",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  odemeCard: {
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
  odemeCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  odemeCardDueSoon: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  odemeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  odemeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  odemeIconOverdue: {
    backgroundColor: "#fee2e2",
  },
  odemeIconDueSoon: {
    backgroundColor: "#fef3c7",
  },
  odemeInfo: {
    flex: 1,
    gap: 2,
  },
  odemeName: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  odemeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  odemeDate: {
    fontSize: 19,
    color: "#6b7280",
  },
  odemeDateOverdue: {
    color: "#ef4444",
    fontWeight: "500",
  },
  odemeFrequency: {
    fontSize: 19,
    color: "#9ca3af",
  },
  odemeCari: {
    fontSize: 19,
    color: "#8b5cf6",
    marginTop: 2,
  },
  odemeAmount: {
    fontSize: 19,
    fontWeight: "600",
    color: "#ef4444",
  },
  odemeAmountOverdue: {
    color: "#ef4444",
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
    backgroundColor: "#8b5cf6",
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
