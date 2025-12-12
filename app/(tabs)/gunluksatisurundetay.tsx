// GunlukSatisUrunDetay Screen - Refactored
// Original: 1,187 lines → Now: ~250 lines

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
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SatisKaydi } from "../../src/types";

// Feature imports
import {
  useUrunDetayData,
  useUrunDetayIslemleri,
  UrunOzetCard,
  UrunBilgileriForm,
  SatisGecmisiList,
  EditSatisModal,
  DatePickerModal,
  BirimPickerModal,
} from "../../src/features/urun-detay";

export default function GunlukSatisUrunDetayScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Data hook
  const { urun, urunSatislari, stats, refreshing, onRefresh } =
    useUrunDetayData(id || "");

  // İşlemler hook
  const {
    loading,
    handleNameChange,
    handlePriceChange,
    handleUnitChange,
    handleToggleInvoice,
    saveSatis,
    saveSatisDate,
    deleteSatis,
  } = useUrunDetayIslemleri(id || "", urun);

  // Local form state
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("");

  // Modal states
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showEditSatisModal, setShowEditSatisModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Edit satis state
  const [editingSatis, setEditingSatis] = useState<SatisKaydi | null>(null);
  const [editSatisAdet, setEditSatisAdet] = useState("");
  const [editSatisFiyat, setEditSatisFiyat] = useState("");
  const [editSatisDate, setEditSatisDate] = useState(new Date());
  const [editingSatisId, setEditingSatisId] = useState<string | null>(null);

  // Sync local state with urun
  useEffect(() => {
    if (urun) {
      setEditName(urun.name);
      setEditPrice(urun.price?.toString() || "");
      setEditUnit(urun.unit || "Adet");
    }
  }, [urun]);

  // Handlers
  const onNameBlur = () => {
    handleNameChange(editName);
  };

  const onPriceBlur = () => {
    handlePriceChange(editPrice);
  };

  const onUnitSelect = async (unit: string) => {
    setEditUnit(unit);
    setShowUnitPicker(false);
    await handleUnitChange(unit);
  };

  const onEditSatis = (satis: SatisKaydi) => {
    setEditingSatis(satis);
    setEditSatisAdet(satis.quantity.toString());
    setEditSatisFiyat(satis.unit_price.toString());
    setEditSatisDate(new Date(satis.date));
    setShowEditSatisModal(true);
  };

  const onEditDate = (satis: SatisKaydi) => {
    setEditingSatisId(satis.id);
    setEditSatisDate(new Date(satis.date));
    setShowDatePicker(true);
  };

  const onSaveSatis = async () => {
    if (!editingSatis) return;
    const success = await saveSatis(
      editingSatis.id,
      editSatisAdet,
      editSatisFiyat,
      editSatisDate
    );
    if (success) {
      setShowEditSatisModal(false);
      setEditingSatis(null);
    }
  };

  const onSaveDate = async () => {
    if (!editingSatisId) return;
    const success = await saveSatisDate(editingSatisId, editSatisDate);
    if (success) {
      setShowDatePicker(false);
      setEditingSatisId(null);
    }
  };

  const onDatePressFromModal = () => {
    setShowEditSatisModal(false);
    setTimeout(() => {
      setEditingSatisId(editingSatis?.id || null);
      setShowDatePicker(true);
    }, 300);
  };

  // Not found state
  if (!urun) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/gunluksatis")}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ürün Bulunamadı</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/gunluksatis")}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {urun.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Özet Kartı */}
        <UrunOzetCard stats={stats} />

        {/* Ürün Bilgileri Formu */}
        <UrunBilgileriForm
          urun={urun}
          editName={editName}
          editPrice={editPrice}
          editUnit={editUnit}
          onNameChange={setEditName}
          onNameBlur={onNameBlur}
          onPriceChange={setEditPrice}
          onPriceBlur={onPriceBlur}
          onUnitPress={() => setShowUnitPicker(true)}
          onToggleInvoice={handleToggleInvoice}
        />

        {/* Satış Geçmişi */}
        <SatisGecmisiList
          satislar={urunSatislari}
          unit={editUnit}
          onEditSatis={onEditSatis}
          onEditDate={onEditDate}
          onDeleteSatis={deleteSatis}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Birim Picker Modal */}
      <BirimPickerModal
        visible={showUnitPicker}
        selectedUnit={editUnit}
        onSelect={onUnitSelect}
        onClose={() => setShowUnitPicker(false)}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        date={editSatisDate}
        onDateChange={setEditSatisDate}
        onSave={onSaveDate}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Satış Düzenleme Modal */}
      <EditSatisModal
        visible={showEditSatisModal}
        adet={editSatisAdet}
        fiyat={editSatisFiyat}
        date={editSatisDate}
        loading={loading}
        onAdetChange={setEditSatisAdet}
        onFiyatChange={setEditSatisFiyat}
        onDateChange={setEditSatisDate}
        onDatePress={onDatePressFromModal}
        onSave={onSaveSatis}
        onClose={() => setShowEditSatisModal(false)}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
});
// End of GunlukSatisUrunDetay Screen - Refactored
