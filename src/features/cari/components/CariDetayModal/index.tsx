/**
 * CariDetayModal
 * Ana orchestration dosyası
 */

import React from "react";
import { View, TouchableOpacity, Text, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MoreVertical } from "lucide-react-native";

import { styles } from "./styles";
import { CariDetayModalProps } from "./types";
import { getBalanceInfo } from "./constants";
import { useCariDetay } from "./hooks/useCariDetay";

import { CariInfoCard } from "./CariInfoCard";
import { CariIslemList } from "./CariIslemList";
import { IslemDetayModal } from "./IslemDetayModal";
import { IslemEditModal } from "./IslemEditModal";
import { CariMenuModal } from "./CariMenuModal";
import { EditNameModal } from "./EditNameModal";

export default function CariDetayModal({
  visible,
  onClose,
  cari,
}: CariDetayModalProps) {
  const {
    // Data
    currentCari,
    cariIslemleri,
    selectedIslem,
    islemKalemleri,
    editKalemler,

    // Loading states
    loading,
    loadingKalemler,
    savingIslem,

    // Modal states
    showMenu,
    setShowMenu,
    showEditNameModal,
    setShowEditNameModal,
    showIslemDetay,
    isEditMode,

    // Edit states
    editName,
    setEditName,
    editIslemAmount,
    setEditIslemAmount,
    editIslemDate,
    setEditIslemDate,
    editIslemDescription,
    setEditIslemDescription,

    // Actions
    resetStates,
    openIslemDetay,
    closeIslemDetay,
    startEditMode,
    handleSaveIslem,
    handleDeleteIslem,
    handleUpdateName,
    handleArchive,
    handleToggleIncludeInReports,
    handleDelete,
    updateKalem,
  } = useCariDetay(cari, visible);

  const handleClose = () => {
    resetStates();
    onClose();
  };

  if (!currentCari) return null;

  const balanceInfo = getBalanceInfo(
    currentCari.balance || 0,
    currentCari.type as "tedarikci" | "musteri"
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentCari.name}
          </Text>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.menuButton}
          >
            <MoreVertical size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <CariInfoCard cari={currentCari} balanceInfo={balanceInfo} />
          <CariIslemList
            islemler={cariIslemleri}
            onIslemPress={openIslemDetay}
          />
        </ScrollView>

        {/* İşlem Detay Modal */}
        <IslemDetayModal
          visible={showIslemDetay && !isEditMode}
          islem={selectedIslem}
          kalemler={islemKalemleri}
          loadingKalemler={loadingKalemler}
          onClose={closeIslemDetay}
          onEdit={startEditMode}
          onDelete={handleDeleteIslem}
        />

        {/* İşlem Edit Modal */}
        <IslemEditModal
          visible={showIslemDetay && isEditMode}
          islem={selectedIslem}
          kalemler={islemKalemleri}
          onClose={() => closeIslemDetay()}
          onSave={async (data) => {
            await handleSaveIslem();
          }}
          saving={savingIslem}
        />

        {/* Menu Modal */}
        <CariMenuModal
          visible={showMenu}
          cariName={currentCari.name}
          includeInReports={currentCari.include_in_reports !== false}
          onClose={() => setShowMenu(false)}
          onEditName={() => setShowEditNameModal(true)}
          onToggleReports={handleToggleIncludeInReports}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />

        {/* Edit Name Modal */}
        <EditNameModal
          visible={showEditNameModal}
          name={editName}
          onNameChange={setEditName}
          onClose={() => setShowEditNameModal(false)}
          onSave={handleUpdateName}
          loading={loading}
        />
      </SafeAreaView>
    </Modal>
  );
}

// Re-export for backward compatibility
export { CariDetayModal };
