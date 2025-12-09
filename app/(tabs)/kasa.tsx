import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { useStore } from "../../src/store/useStore";
import AddKasaModal from "../../src/components/AddKasaModal";
import KasaDetayModal from "../../src/components/KasaDetayModal";
import { Kasa as KasaType } from "../../src/types";

const kasaGroups = [
  {
    type: "nakit",
    label: "Nakit",
    icon: Wallet,
    color: "#10b981",
    bgColor: "#dcfce7",
  },
  {
    type: "banka",
    label: "Banka Hesabı",
    icon: Building2,
    color: "#3b82f6",
    bgColor: "#dbeafe",
  },
  {
    type: "kredi_karti",
    label: "Kredi Kartı",
    icon: CreditCard,
    color: "#f59e0b",
    bgColor: "#fef3c7",
  },
  {
    type: "birikim",
    label: "Birikim",
    icon: PiggyBank,
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
];

export default function Kasa() {
  const { kasalar, fetchKasalar, fetchProfile, profile } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetayModal, setShowDetayModal] = useState(false);
  const [selectedKasa, setSelectedKasa] = useState<KasaType | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      nakit: true,
      banka: true,
      kredi_karti: true,
      birikim: true,
    }
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKasalar();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const handleKasaPress = (kasa: KasaType) => {
    setSelectedKasa(kasa);
    setShowDetayModal(true);
  };

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Grup bazında kasaları ve toplamları hesapla
  const getGroupData = (type: string) => {
    const groupKasalar = kasalar.filter((k) => k.type === type);
    const total = groupKasalar.reduce((sum, k) => sum + k.balance, 0);
    return { kasalar: groupKasalar, total };
  };

  // Genel toplam
  const genelToplam = kasalar.reduce((sum, k) => sum + k.balance, 0);

  const renderKasaItem = (kasa: KasaType) => {
    return (
      <TouchableOpacity
        key={kasa.id}
        style={styles.kasaItem}
        onPress={() => handleKasaPress(kasa)}
      >
        <View style={styles.kasaItemLeft}>
          <Text style={styles.kasaItemName}>{kasa.name}</Text>
        </View>
        <View style={styles.kasaItemRight}>
          <Text
            style={[
              styles.kasaItemBalance,
              kasa.balance < 0 && styles.kasaItemBalanceNegative,
            ]}
          >
            {formatCurrency(kasa.balance)}
          </Text>
          <ChevronRight size={18} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderGroup = (group: (typeof kasaGroups)[0]) => {
    const { kasalar: groupKasalar, total } = getGroupData(group.type);
    const isExpanded = expandedGroups[group.type];
    const IconComponent = group.icon;

    // Grup boşsa gösterme
    if (groupKasalar.length === 0) return null;

    return (
      <View key={group.type} style={styles.groupContainer}>
        <TouchableOpacity
          style={styles.groupHeader}
          onPress={() => toggleGroup(group.type)}
          activeOpacity={0.7}
        >
          <View style={styles.groupLeft}>
            <View
              style={[styles.groupIcon, { backgroundColor: group.bgColor }]}
            >
              <IconComponent size={20} color={group.color} />
            </View>
            <Text style={styles.groupTitle}>{group.label}</Text>
            <View style={styles.groupCount}>
              <Text style={styles.groupCountText}>{groupKasalar.length}</Text>
            </View>
          </View>
          <View style={styles.groupRight}>
            <Text
              style={[
                styles.groupTotal,
                total < 0 && styles.groupTotalNegative,
              ]}
            >
              {formatCurrency(total)}
            </Text>
            {isExpanded ? (
              <ChevronUp size={20} color="#6b7280" />
            ) : (
              <ChevronDown size={20} color="#6b7280" />
            )}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.groupContent}>
            {groupKasalar.map((kasa) => renderKasaItem(kasa))}
          </View>
        )}
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
          <Text style={styles.title}>Hesaplar</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Toplam Bakiye */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Hesap Toplamı</Text>
          <Text
            style={[
              styles.totalAmount,
              genelToplam < 0 && styles.totalAmountNegative,
            ]}
          >
            {formatCurrency(genelToplam)}
          </Text>
        </View>

        {/* Hesap Grupları */}
        <View style={styles.groupsContainer}>
          {kasaGroups.map(renderGroup)}
        </View>

        {/* Boş durum */}
        {kasalar.length === 0 && (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => setShowAddModal(true)}
          >
            <Wallet size={40} color="#9ca3af" />
            <Text style={styles.emptyText}>Henüz hesap eklenmemiş</Text>
            <Text style={styles.emptySubtext}>
              İlk hesabınızı eklemek için tıklayın
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Modal */}
      <AddKasaModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Detay Modal */}
      <KasaDetayModal
        visible={showDetayModal}
        onClose={() => {
          setShowDetayModal(false);
          setSelectedKasa(null);
          fetchKasalar();
        }}
        kasa={selectedKasa}
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  totalCard: {
    backgroundColor: "#111827",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  totalAmountNegative: {
    color: "#f87171",
  },
  groupsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  groupContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  groupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  groupCount: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  groupCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  groupRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  groupTotalNegative: {
    color: "#ef4444",
  },
  groupContent: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  kasaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kasaItemLeft: {
    flex: 1,
  },
  kasaItemName: {
    fontSize: 15,
    color: "#374151",
  },
  kasaItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kasaItemBalance: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  kasaItemBalanceNegative: {
    color: "#ef4444",
  },
  emptyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
});
