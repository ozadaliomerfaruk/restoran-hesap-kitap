// Arşiv Screen - Refactored

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Archive } from "lucide-react-native";

import {
  ArchivedItemCard,
  ArsivTabs,
  useArsivData,
  useArsivIslemleri,
  ArsivTabType,
  tabConfig,
} from "../../src/features/arsiv";
import { EmptyState } from "../../src/shared/components";

export default function ArsivScreen() {
  const [activeTab, setActiveTab] = useState<ArsivTabType>("cariler");
  const [refreshing, setRefreshing] = useState(false);

  const {
    archivedCariler,
    archivedPersoneller,
    archivedKasalar,
    totalCount,
    refresh,
  } = useArsivData();

  const { loading, handleRestore, handlePermanentDelete } =
    useArsivIslemleri(refresh);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Tab'a göre data seç
  const getTabData = () => {
    switch (activeTab) {
      case "cariler":
        return { items: archivedCariler, table: "cariler" };
      case "personel":
        return { items: archivedPersoneller, table: "personeller" };
      case "hesaplar":
        return { items: archivedKasalar, table: "kasalar" };
    }
  };

  const { items, table } = getTabData();
  const config = tabConfig[activeTab];

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
      <ArsivTabs
        activeTab={activeTab}
        counts={{
          cariler: archivedCariler.length,
          personel: archivedPersoneller.length,
          hesaplar: archivedKasalar.length,
        }}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <EmptyState
            icon={<Archive size={56} color="#9ca3af" />}
            title={config.emptyText}
            description="Arşive alınan öğeler burada görünecek"
          />
        ) : (
          <View style={styles.itemList}>
            {items.map((item) => (
              <ArchivedItemCard
                key={item.id}
                item={item}
                tabType={activeTab}
                loading={loading}
                onRestore={() => handleRestore(item, table)}
                onDelete={() => handlePermanentDelete(item, table)}
              />
            ))}
          </View>
        )}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  itemList: {
    gap: 10,
  },
  bottomPadding: {
    height: 30,
  },
});
