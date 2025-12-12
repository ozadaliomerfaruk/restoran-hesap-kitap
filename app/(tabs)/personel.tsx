// Personel Screen - Refactored
// Original: 2,677 lines → Now: ~400 lines

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, UserPlus } from "lucide-react-native";

// Feature imports
import {
  usePersonelData,
  usePersonelIslemleri,
  PersonelSummary,
  PersonelCard,
  PersonelDetailModal,
  IzinModal,
  IslemTipi,
  GiderKategori,
  IzinTipiValue,
} from "../../src/features/personel";

// External components
import AddPersonelModal from "../../src/components/AddPersonelModal";
import { Personel } from "../../src/types";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PersonelScreen() {
  // Data hook
  const {
    personeller,
    personelIslemler,
    kasalar,
    nakitBankaKasalar,
    izinler,
    toplamBorcumuz,
    toplamAlacagimiz,
    refreshAll,
  } = usePersonelData();

  // İşlem hook
  const {
    submitIslem,
    deleteIslem,
    submitIzin,
    deleteIzin,
    updatePersonelName,
    archivePersonel,
    deletePersonel,
    toggleIncludeInReports,
  } = usePersonelIslemleri();

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Accordion state
  const [expandedPersonelId, setExpandedPersonelId] = useState<string | null>(
    null
  );
  const [activeIslemTipi, setActiveIslemTipi] = useState<IslemTipi | null>(
    null
  );

  // Form state
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formKasaId, setFormKasaId] = useState<string | null>(
    nakitBankaKasalar.length > 0 ? nakitBankaKasalar[0].id : null
  );
  const [formKategori, setFormKategori] = useState<GiderKategori>("maas");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPersonel, setDetailPersonel] = useState<Personel | null>(null);

  // İzin modal state
  const [showIzinModal, setShowIzinModal] = useState(false);
  const [izinPersonel, setIzinPersonel] = useState<Personel | null>(null);
  const [izinTipi, setIzinTipi] = useState<"ekle" | "dus">("ekle");

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  // Reset form
  const resetForm = useCallback(() => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormKasaId(
      nakitBankaKasalar.length > 0 ? nakitBankaKasalar[0].id : null
    );
    setFormKategori("maas");
    setFormDescription("");
    setFormAmount("");
  }, [nakitBankaKasalar]);

  // Toggle expand
  const toggleExpand = useCallback(
    (personelId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (expandedPersonelId === personelId) {
        setExpandedPersonelId(null);
        setActiveIslemTipi(null);
      } else {
        setExpandedPersonelId(personelId);
        setActiveIslemTipi(null);
        resetForm();
      }
    },
    [expandedPersonelId, resetForm]
  );

  // Select işlem tipi
  const selectIslemTipi = useCallback(
    (tip: IslemTipi) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (activeIslemTipi === tip) {
        setActiveIslemTipi(null);
      } else {
        setActiveIslemTipi(tip);
        resetForm();
        if (
          (tip === "odeme" || tip === "tahsilat") &&
          nakitBankaKasalar.length > 0
        ) {
          setFormKasaId(nakitBankaKasalar[0].id);
        }
      }
    },
    [activeIslemTipi, resetForm, nakitBankaKasalar]
  );

  // Submit işlem
  const handleSubmit = async (personel: Personel) => {
    if (!activeIslemTipi) return;

    setFormLoading(true);
    const success = await submitIslem(personel, activeIslemTipi, {
      date: formDate,
      kasaId: formKasaId,
      kategori: formKategori,
      description: formDescription,
      amount: formAmount,
    });
    setFormLoading(false);

    if (success) {
      resetForm();
      setActiveIslemTipi(null);
    }
  };

  // Open detail modal
  const openDetailModal = (personel: Personel) => {
    setDetailPersonel(personel);
    setShowDetailModal(true);
  };

  // Open izin modal
  const openIzinModal = (personel: Personel, tipi: "ekle" | "dus") => {
    setIzinPersonel(personel);
    setIzinTipi(tipi);
    setShowIzinModal(true);
  };

  // İzin günleri hesapla
  const getPersonelIzinGunleri = (personelId: string) => {
    return izinler
      .filter((i) => i.personel_id === personelId)
      .reduce((sum, i) => sum + (i.days || 0), 0);
  };

  // Render personel item
  const renderPersonelItem = ({ item }: { item: Personel }) => (
    <PersonelCard
      personel={item}
      isExpanded={expandedPersonelId === item.id}
      activeIslemTipi={activeIslemTipi}
      izinGunleri={getPersonelIzinGunleri(item.id)}
      nakitBankaKasalar={nakitBankaKasalar}
      formDate={formDate}
      formKasaId={formKasaId}
      formKategori={formKategori}
      formDescription={formDescription}
      formAmount={formAmount}
      formLoading={formLoading}
      onToggleExpand={() => toggleExpand(item.id)}
      onSelectIslemTipi={selectIslemTipi}
      onIzinEkle={() => openIzinModal(item, "ekle")}
      onIzinDus={() => openIzinModal(item, "dus")}
      onOpenDetail={() => openDetailModal(item)}
      onDateChange={setFormDate}
      onKasaChange={setFormKasaId}
      onKategoriChange={setFormKategori}
      onDescriptionChange={setFormDescription}
      onAmountChange={setFormAmount}
      onSubmit={() => handleSubmit(item)}
    />
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

      {/* Summary */}
      <PersonelSummary
        personelCount={personeller.length}
        toplamBorcumuz={toplamBorcumuz}
        toplamAlacagimiz={toplamAlacagimiz}
      />

      {/* List */}
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
            <UserPlus size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Personel yok</Text>
          <Text style={styles.emptyText}>
            Çalışanlarınızı ekleyerek{"\n"}maaş ve ödemelerini takip edin
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

      {/* Add Modal */}
      <AddPersonelModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          refreshAll();
        }}
      />

      {/* Detail Modal */}
      <PersonelDetailModal
        visible={showDetailModal}
        personel={detailPersonel}
        personelIslemler={personelIslemler}
        izinler={izinler}
        kasalar={kasalar}
        onClose={() => setShowDetailModal(false)}
        onDeleteIslem={deleteIslem}
        onDeleteIzin={deleteIzin}
        onUpdateName={async (name) => {
          if (!detailPersonel) return false;
          const success = await updatePersonelName(detailPersonel.id, name);
          if (success) {
            setDetailPersonel({ ...detailPersonel, name });
          }
          return success;
        }}
        onArchive={async () => {
          if (!detailPersonel) return false;
          return archivePersonel(detailPersonel);
        }}
        onDelete={async () => {
          if (!detailPersonel) return false;
          return deletePersonel(detailPersonel);
        }}
        onToggleIncludeInReports={async () => {
          if (!detailPersonel) return false;
          const success = await toggleIncludeInReports(detailPersonel);
          if (success) {
            setDetailPersonel({
              ...detailPersonel,
              include_in_reports: !detailPersonel.include_in_reports,
            });
          }
          return success;
        }}
      />

      {/* İzin Modal */}
      <IzinModal
        visible={showIzinModal}
        personel={izinPersonel}
        tipiEkleDus={izinTipi}
        onClose={() => setShowIzinModal(false)}
        onSubmit={async (data) => {
          if (!izinPersonel) return false;
          return submitIzin(izinPersonel, data);
        }}
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
