// İşlemler Screen - Refactored

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react-native";

import AddIslemModal from "../../src/components/AddIslemModal";
import {
  IslemCard,
  IslemSummary,
  IslemFilter,
  useIslemlerData,
  IslemFilterType,
} from "../../src/features/islemler";
import { Islem } from "../../src/types";
import { EmptyState } from "../../src/shared/components";

export default function Islemler() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<"gelir" | "gider">("gider");
  const [filter, setFilter] = useState<IslemFilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { islemler, totalGelir, totalGider, netAmount, refresh } =
    useIslemlerData(filter);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const openAddModal = (type: "gelir" | "gider") => {
    setAddModalType(type);
    setShowAddModal(true);
  };

  const renderItem = ({ item }: { item: Islem }) => <IslemCard item={item} />;

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

      {/* Filters */}
      <IslemFilter filter={filter} onFilterChange={setFilter} />

      {/* Summary */}
      <IslemSummary
        totalGelir={totalGelir}
        totalGider={totalGider}
        netAmount={netAmount}
      />

      {/* List or Empty */}
      {islemler.length > 0 ? (
        <FlatList
          data={islemler}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon={<ClipboardList size={56} color="#9ca3af" />}
            title="Henüz işlem yok"
            description="Gelir veya gider eklemek için aşağıdaki butonlara tıklayın"
          />
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
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
    fontSize: 15,
    fontWeight: "600",
  },
});
