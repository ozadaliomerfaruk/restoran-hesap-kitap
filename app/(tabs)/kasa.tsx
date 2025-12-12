// Kasa/Hesaplar Screen - Refactored

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Wallet } from "lucide-react-native";

import AddKasaModal from "../../src/components/AddKasaModal";
import KasaDetayModal from "../../src/components/KasaDetayModal";
import {
  KasaGroup,
  KasaTotalCard,
  useKasaScreenData,
  kasaGroups,
} from "../../src/features/kasa";
import { Kasa as KasaType } from "../../src/types";

export default function Kasa() {
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

  const { kasalar, genelToplam, getGroupData, refresh } = useKasaScreenData();

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleKasaPress = (kasa: KasaType) => {
    setSelectedKasa(kasa);
    setShowDetayModal(true);
  };

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({ ...prev, [type]: !prev[type] }));
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

        {/* Toplam */}
        <KasaTotalCard total={genelToplam} />

        {/* Hesap Grupları */}
        <View style={styles.groupsContainer}>
          {kasaGroups.map((group) => (
            <KasaGroup
              key={group.type}
              group={group}
              data={getGroupData(group.type)}
              isExpanded={expandedGroups[group.type]}
              onToggle={() => toggleGroup(group.type)}
              onKasaPress={handleKasaPress}
            />
          ))}
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

      {/* Modals */}
      <AddKasaModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <KasaDetayModal
        visible={showDetayModal}
        onClose={() => {
          setShowDetayModal(false);
          setSelectedKasa(null);
          refresh();
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
  groupsContainer: {
    paddingHorizontal: 16,
    gap: 12,
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
