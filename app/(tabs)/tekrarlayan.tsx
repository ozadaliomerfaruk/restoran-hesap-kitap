// Tekrarlayan Ödemeler Screen - Refactored & Optimized

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
import { Plus, RefreshCw } from "lucide-react-native";

import AddTekrarlayanOdemeModal from "../../src/components/AddTekrarlayanOdemeModal";
import {
  OdemeCard,
  OdemeSummary,
  useTekrarlayanData,
} from "../../src/features/tekrarlayan";
import { TekrarlayanOdeme } from "../../src/types";
import { EmptyState } from "../../src/shared/components";

// Constants
const ITEM_HEIGHT = 88;
const COLORS = {
  gray: { 400: "#9ca3af" },
  purple: "#8b5cf6",
};

// Memoized keyExtractor
const keyExtractor = (item: TekrarlayanOdeme) => item.id;

export default function TekrarlayanScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { tekrarlayanOdemeler, totalMonthly, overdueCount, loading, refresh } =
    useTekrarlayanData();

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
    ({ item }: { item: TekrarlayanOdeme }) => <OdemeCard item={item} />,
    []
  );

  // Memoized getItemLayout
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  // Memoized modal handlers
  const openAddModal = useCallback(() => setShowAddModal(true), []);
  const closeAddModal = useCallback(() => setShowAddModal(false), []);

  // Loading state
  if (loading && tekrarlayanOdemeler.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tekrarlayan Ödemeler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          accessibilityLabel="Yeni tekrarlayan ödeme ekle"
          accessibilityRole="button"
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <OdemeSummary
        activeCount={tekrarlayanOdemeler.length}
        totalMonthly={totalMonthly}
        overdueCount={overdueCount}
      />

      {/* List or Empty */}
      {tekrarlayanOdemeler.length > 0 ? (
        <FlatList
          data={tekrarlayanOdemeler}
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
              colors={[COLORS.purple]}
              tintColor={COLORS.purple}
            />
          }
        />
      ) : (
        <EmptyState
          icon={<RefreshCw size={56} color={COLORS.gray[400]} />}
          title="Tekrarlayan ödeme yok"
          description="Kira, sigorta, fatura gibi düzenli ödemelerinizi ekleyin"
          action={
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openAddModal}
              accessibilityLabel="Ödeme ekle"
              accessibilityRole="button"
            >
              <Text style={styles.actionButtonText}>Ödeme Ekle</Text>
            </TouchableOpacity>
          }
        />
      )}

      {/* Add Modal */}
      <AddTekrarlayanOdemeModal
        visible={showAddModal}
        onClose={closeAddModal}
      />
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#8b5cf6",
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
