/**
 * KalemliFaturaModal
 * Tedarikçi kalemli fatura modalı
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, FileText, Plus } from "lucide-react-native";

import { styles } from "./styles";
import { KalemliFaturaModalProps } from "./types";
import { useKalemliFatura } from "./hooks/useKalemliFatura";

import { FaturaForm } from "./FaturaForm";
import { KalemCard } from "./KalemCard";
import { FaturaSummary } from "./FaturaSummary";
import { UrunSelectModal } from "./UrunSelectModal";

export default function KalemliFaturaModal({
  visible,
  onClose,
  cari,
}: KalemliFaturaModalProps) {
  const {
    // State
    kalemler,
    formDate,
    setFormDate,
    formDescription,
    setFormDescription,
    faturaTipi,
    setFaturaTipi,
    loading,

    // Ürün modal
    showUrunModal,
    setShowUrunModal,

    // Dropdown
    activeKdvKalemId,
    setActiveKdvKalemId,
    activeBirimKalemId,
    setActiveBirimKalemId,

    // Data
    urunler,
    kategoriler,

    // Hesaplamalar
    araToplam,
    toplamKdv,
    genelToplam,
    calculateKalemTotal,

    // Actions
    addKalem,
    removeKalem,
    updateKalem,
    selectUrun,
    openUrunModal,
    handleSave,
    resetForm,
    addUrun,
    fetchUrunler,
  } = useKalemliFatura(cari, visible);

  const handleClose = () => {
    if (kalemler.some((k) => k.urun_adi || k.unit_price)) {
      Alert.alert(
        "Çıkış",
        "Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Çık",
            style: "destructive",
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      resetForm();
      onClose();
    }
  };

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };

  if (!cari) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Kalemli Fatura</Text>
            <Text style={styles.headerSubtitle}>{cari.name}</Text>
          </View>
          <View style={styles.headerBtn}>
            <FileText size={24} color="#3b82f6" />
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Form */}
          <FaturaForm
            faturaTipi={faturaTipi}
            setFaturaTipi={setFaturaTipi}
            formDate={formDate}
            setFormDate={setFormDate}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
          />

          {/* Kalemler */}
          <View style={styles.kalemlerSection}>
            <Text style={styles.sectionTitle}>
              Fatura Kalemleri ({kalemler.length})
            </Text>

            {kalemler.map((kalem, index) => (
              <KalemCard
                key={kalem.id}
                kalem={kalem}
                index={index}
                onRemove={removeKalem}
                onUpdate={updateKalem}
                onSelectUrun={openUrunModal}
                activeBirimKalemId={activeBirimKalemId}
                setActiveBirimKalemId={setActiveBirimKalemId}
                activeKdvKalemId={activeKdvKalemId}
                setActiveKdvKalemId={setActiveKdvKalemId}
              />
            ))}

            {/* Kalem Ekle */}
            <TouchableOpacity style={styles.addKalemBtn} onPress={addKalem}>
              <Plus size={18} color="#3b82f6" />
              <Text style={styles.addKalemBtnText}>Kalem Ekle</Text>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <FaturaSummary
            araToplam={araToplam}
            toplamKdv={toplamKdv}
            genelToplam={genelToplam}
            loading={loading}
            onSave={onSave}
            faturaTipi={faturaTipi}
          />
        </ScrollView>

        {/* Ürün Seç Modal */}
        <UrunSelectModal
          visible={showUrunModal}
          onClose={() => setShowUrunModal(false)}
          onSelectUrun={selectUrun}
          urunler={urunler}
          kategoriler={kategoriler}
          onAddUrun={addUrun}
          onRefreshUrunler={fetchUrunler}
        />
      </SafeAreaView>
    </Modal>
  );
}

export { KalemliFaturaModal };
