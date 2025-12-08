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
import {
  Plus,
  Users,
  Briefcase,
  Phone,
  ChevronRight,
  DollarSign,
  Calendar,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddPersonelModal from "../../src/components/AddPersonelModal";
import PersonelIslemModal from "../../src/components/PersonelIslemModal";
import { Personel } from "../../src/types";

export default function PersonelScreen() {
  const {
    personeller,
    loadingPersoneller,
    fetchPersoneller,
    fetchProfile,
    profile,
    fetchKasalar,
  } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIslemModal, setShowIslemModal] = useState(false);
  const [selectedPersonel, setSelectedPersonel] = useState<Personel | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchPersoneller();
      fetchKasalar();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPersoneller();
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

  const openIslemModal = (personel: Personel) => {
    setSelectedPersonel(personel);
    setShowIslemModal(true);
  };

  const totalSalary = personeller.reduce((sum, p) => sum + (p.salary || 0), 0);

  const renderPersonelItem = ({ item }: { item: Personel }) => (
    <TouchableOpacity
      style={styles.personelCard}
      onPress={() => openIslemModal(item)}
    >
      <View style={styles.personelLeft}>
        <View style={styles.personelIcon}>
          <Users size={24} color="#3b82f6" />
        </View>
        <View style={styles.personelInfo}>
          <Text style={styles.personelName}>{item.name}</Text>
          <View style={styles.personelMeta}>
            <Briefcase size={12} color="#6b7280" />
            <Text style={styles.personelPosition}>{item.position}</Text>
          </View>
          {item.phone && (
            <View style={styles.personelMeta}>
              <Phone size={12} color="#6b7280" />
              <Text style={styles.personelPhone}>{item.phone}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.personelRight}>
        <Text style={styles.personelSalary}>
          {formatCurrency(item.salary || 0)}
        </Text>
        <Text style={styles.personelSalaryLabel}>Maaş</Text>
        <ChevronRight size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Personel</Text>
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
          <Users size={20} color="#3b82f6" />
          <Text style={styles.summaryValue}>{personeller.length}</Text>
          <Text style={styles.summaryLabel}>Personel</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <DollarSign size={20} color="#10b981" />
          <Text style={styles.summaryValue}>{formatCurrency(totalSalary)}</Text>
          <Text style={styles.summaryLabel}>Toplam Maaş</Text>
        </View>
      </View>

      {/* Liste veya Boş Durum */}
      {personeller.length > 0 ? (
        <FlatList
          data={personeller}
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
            <Users size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Henüz personel yok</Text>
          <Text style={styles.emptyText}>
            Personel eklemek için{"\n"}
            sağ üstteki + butonuna tıklayın
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

      {/* Modals */}
      <AddPersonelModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <PersonelIslemModal
        visible={showIslemModal}
        onClose={() => {
          setShowIslemModal(false);
          setSelectedPersonel(null);
        }}
        personel={selectedPersonel}
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
    backgroundColor: "#3b82f6",
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
    marginHorizontal: 16,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  personelCard: {
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
  personelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  personelIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  personelInfo: {
    flex: 1,
    gap: 2,
  },
  personelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  personelMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  personelPosition: {
    fontSize: 12,
    color: "#6b7280",
  },
  personelPhone: {
    fontSize: 12,
    color: "#6b7280",
  },
  personelRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  personelSalary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
  },
  personelSalaryLabel: {
    fontSize: 11,
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
});
