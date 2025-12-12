// Cari Screen - Refactored
// Original: 1,849 lines → Now: ~350 lines

import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Building2 } from "lucide-react-native";

// Feature imports
import {
  useCariData,
  useCariIslemleri,
  CariSummary,
  CariFilterComponent,
  CariCard,
  KategoriModal,
  CariIslemTipi,
  CariFilter,
} from "../../src/features/cari";

// External components
import AddCariModal from "../../src/components/AddCariModal";
import CariDetayModal from "../../src/components/CariDetayModal";
import KalemliFaturaModal from "../../src/components/Kalemlifaturamodal";
import MusteriKalemliFaturaModal from "../../src/components/MusteriKalemliFaturaModal";
import { Cari } from "../../src/types";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CariScreen() {
  // Filter state
  const [filter, setFilter] = useState<CariFilter>("all");

  // Data hook
  const {
    cariler,
    nakitBankaKasalar,
    kategoriler,
    giderKategoriler,
    toplamTedarikciBorc,
    toplamMusteriAlacak,
    cariCounts,
    refreshAll,
    fetchCariler,
  } = useCariData(filter);

  // İşlem hook
  const { submitIslem, addKategori } = useCariIslemleri();

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetayModal, setShowDetayModal] = useState(false);
  const [showKalemliModal, setShowKalemliModal] = useState(false);
  const [showMusteriKalemliModal, setShowMusteriKalemliModal] = useState(false);
  const [showKategoriModal, setShowKategoriModal] = useState(false);
  const [selectedCari, setSelectedCari] = useState<Cari | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Accordion state
  const [expandedCariId, setExpandedCariId] = useState<string | null>(null);
  const [activeIslemTipi, setActiveIslemTipi] = useState<CariIslemTipi | null>(
    null
  );

  // Form state
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formKasaId, setFormKasaId] = useState("");
  const [formKategoriId, setFormKategoriId] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  // Reset form
  const resetForm = useCallback(() => {
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormAmount("");
    setFormDescription("");
    setFormKasaId("");
    setFormKategoriId("");
  }, []);

  // Toggle expand
  const handleCariPress = useCallback(
    (cari: Cari) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (expandedCariId === cari.id) {
        setExpandedCariId(null);
        setActiveIslemTipi(null);
      } else {
        setExpandedCariId(cari.id);
        setActiveIslemTipi(null);
        resetForm();
      }
    },
    [expandedCariId, resetForm]
  );

  // Select işlem tipi
  const handleIslemTipiPress = useCallback(
    (tip: CariIslemTipi) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (activeIslemTipi === tip) {
        setActiveIslemTipi(null);
      } else {
        setActiveIslemTipi(tip);
        resetForm();
        const nakitKasa = nakitBankaKasalar.find(
          (k: { type: string; id: string }) => k.type === "nakit"
        );
        if (nakitKasa) setFormKasaId(nakitKasa.id);
      }
    },
    [activeIslemTipi, resetForm, nakitBankaKasalar]
  );

  // Submit işlem
  const handleSubmit = async (cari: Cari) => {
    if (!activeIslemTipi) return;
    setFormLoading(true);
    const success = await submitIslem(cari, activeIslemTipi, {
      date: formDate,
      amount: formAmount,
      description: formDescription,
      kasaId: formKasaId,
      kategoriId: formKategoriId,
    });
    setFormLoading(false);
    if (success) {
      resetForm();
      setActiveIslemTipi(null);
    }
  };

  // Open detay modal
  const handleDetayPress = (cari: Cari) => {
    setSelectedCari(cari);
    setShowDetayModal(true);
  };

  // Open kalemli modal
  const handleKalemliPress = (cari: Cari) => {
    setSelectedCari(cari);
    if (cari.type === "tedarikci") {
      setShowKalemliModal(true);
    } else {
      setShowMusteriKalemliModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cariler</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <CariSummary
          toplamTedarikciBorc={toplamTedarikciBorc}
          toplamMusteriAlacak={toplamMusteriAlacak}
        />

        {/* Filter */}
        <CariFilterComponent
          filter={filter}
          counts={cariCounts}
          onFilterChange={setFilter}
        />

        {/* List */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {cariler.length > 0 ? (
            cariler.map((cari) => (
              <CariCard
                key={cari.id}
                cari={cari}
                isExpanded={expandedCariId === cari.id}
                activeIslemTipi={activeIslemTipi}
                nakitBankaKasalar={nakitBankaKasalar}
                kategoriler={kategoriler}
                formDate={formDate}
                formKasaId={formKasaId}
                formKategoriId={formKategoriId}
                formDescription={formDescription}
                formAmount={formAmount}
                formLoading={formLoading}
                onToggleExpand={() => handleCariPress(cari)}
                onSelectIslemTipi={handleIslemTipiPress}
                onKalemliPress={() => handleKalemliPress(cari)}
                onDetayPress={() => handleDetayPress(cari)}
                onDateChange={setFormDate}
                onKasaChange={setFormKasaId}
                onKategoriPress={() => setShowKategoriModal(true)}
                onDescriptionChange={setFormDescription}
                onAmountChange={setFormAmount}
                onSubmit={() => handleSubmit(cari)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Building2 size={48} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Cari bulunamadı</Text>
              <Text style={styles.emptyText}>
                Tedarikçi ve müşterilerinizi ekleyerek{"\n"}borç takibi yapın
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Cari Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <AddCariModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          fetchCariler();
        }}
      />

      <CariDetayModal
        visible={showDetayModal}
        onClose={() => {
          setShowDetayModal(false);
          setSelectedCari(null);
          fetchCariler();
        }}
        cari={selectedCari}
      />

      <KalemliFaturaModal
        visible={showKalemliModal}
        onClose={() => {
          setShowKalemliModal(false);
          setSelectedCari(null);
          fetchCariler();
        }}
        cari={selectedCari}
      />

      <MusteriKalemliFaturaModal
        visible={showMusteriKalemliModal}
        onClose={() => {
          setShowMusteriKalemliModal(false);
          setSelectedCari(null);
          fetchCariler();
        }}
        cari={selectedCari}
      />

      <KategoriModal
        visible={showKategoriModal}
        kategoriler={kategoriler}
        selectedKategoriId={formKategoriId}
        onClose={() => setShowKategoriModal(false)}
        onSelect={setFormKategoriId}
        onAddKategori={addKategori}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  addButton: {
    backgroundColor: "#3b82f6",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  emptyContainer: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
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
  emptyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
