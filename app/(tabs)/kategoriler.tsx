/**
 * Kategoriler Screen (Refactored)
 * Önceki: 716 satır → Şimdi: ~150 satır
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, FolderTree } from "lucide-react-native";

// Feature imports
import {
  useKategorilerData,
  useKategorilerIslemleri,
  KategoriItem,
  KategoriTabs,
  KategoriFormModal,
} from "../../src/features/kategoriler";

export default function KategorilerScreen() {
  // Data hook
  const {
    profile,
    kategoriler,
    hierarchicalData,
    refreshing,
    activeTab,
    setActiveTab,
    onRefresh,
    getParentCategories,
    toggleExpand,
    isExpanded,
    fetchKategoriler,
  } = useKategorilerData();

  // İşlemler hook
  const {
    showModal,
    editingKategori,
    formState,
    formLoading,
    openAddModal,
    openEditModal,
    closeModal,
    updateFormName,
    updateFormType,
    updateFormParent,
    handleSave,
    handleDelete,
  } = useKategorilerIslemleri(
    profile?.restaurant_id,
    kategoriler,
    fetchKategoriler,
    activeTab
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kategoriler</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal(null)}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <KategoriTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Kategori Listesi */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.listContainer}>
          {hierarchicalData.length > 0 ? (
            hierarchicalData.map((kat) => (
              <KategoriItem
                key={kat.id}
                kategori={kat}
                isExpanded={isExpanded(kat.id)}
                onToggleExpand={toggleExpand}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onAddChild={openAddModal}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <FolderTree size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>
                {activeTab === "gider" ? "Gider" : "Gelir"} kategorisi
                bulunamadı
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => openAddModal(null)}
              >
                <Text style={styles.emptyButtonText}>Kategori Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <KategoriFormModal
        visible={showModal}
        editingKategori={editingKategori}
        formState={formState}
        parentCategories={getParentCategories(formState.type)}
        loading={formLoading}
        onNameChange={updateFormName}
        onTypeChange={updateFormType}
        onParentChange={updateFormParent}
        onSave={handleSave}
        onClose={closeModal}
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
    paddingVertical: 16,
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
  list: {
    flex: 1,
  },
  listContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
