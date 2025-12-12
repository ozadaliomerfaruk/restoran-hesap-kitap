// Çek/Senet Screen - Refactored & Optimized

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, FileText } from "lucide-react-native";

import AddCekSenetModal from "../../src/components/AddCekSenetModal";
import {
  CekSenetCard,
  CekSenetSummary,
  CekSenetFilter,
  useCekSenetData,
  FilterType,
  DirectionFilter,
} from "../../src/features/cek-senet";
import { CekSenet } from "../../src/types";
import { EmptyState } from "../../src/shared/components";

// Constants
const ITEM_HEIGHT = 100;
const COLORS = {
  gray: { 400: "#9ca3af" },
  primary: "#6366f1",
};

// Memoized keyExtractor
const keyExtractor = (item: CekSenet) => item.id;

export default function CekSenetScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [directionFilter, setDirectionFilter] =
    useState<DirectionFilter>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { cekSenetler, bekleyenAlacak, bekleyenBorc, loading, refresh } =
    useCekSenetData(typeFilter, directionFilter);

  // Memoized refresh handler with error handling
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      Alert.alert("Hata", "Veriler yüklenirken bir hata oluştu");
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // Memoized renderItem
  const renderItem = useCallback(
    ({ item }: { item: CekSenet }) => <CekSenetCard item={item} />,
    []
  );

  // Memoized getItemLayout for performance
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Memoized modal handler
  const openAddModal = useCallback(() => setShowAddModal(true), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  // Loading state
  if (loading && cekSenetler.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Çek / Senet</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          accessibilityLabel="Yeni çek veya senet ekle"
          accessibilityRole="button"
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Özet */}
      <CekSenetSummary
        bekleyenAlacak={bekleyenAlacak}
        bekleyenBorc={bekleyenBorc}
      />

      {/* Filtreler */}
      <CekSenetFilter
        typeFilter={typeFilter}
        directionFilter={directionFilter}
        onTypeChange={setTypeFilter}
        onDirectionChange={setDirectionFilter}
      />

      {/* Liste veya Boş Durum */}
      {cekSenetler.length > 0 ? (
        <FlatList
          data={cekSenetler}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      ) : (
        <EmptyState
          icon={<FileText size={56} color={COLORS.gray[400]} />}
          title="Çek/Senet bulunamadı"
          description="Çek veya senet eklemek için sağ üstteki + butonuna tıklayın"
          action={
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openAddModal}
              accessibilityLabel="Çek veya senet ekle"
              accessibilityRole="button"
            >
              <Text style={styles.actionButtonText}>Çek/Senet Ekle</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Add Modal */}
      <AddCekSenetModal visible={showAddModal} onClose={closeAddModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
