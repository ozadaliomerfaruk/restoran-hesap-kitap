/**
 * Kullanıcı Yönetimi Sayfası
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { UserPlus, Users } from "lucide-react-native";
import {
  KullaniciCard,
  KullaniciDuzenleModal,
  KullaniciDavetModal,
  useKullaniciYonetimi,
} from "../src/features/kullanici-yonetimi";
import { colors, spacing } from "../src/shared/constants";
import { useStore } from "../src/store/useStore";
import type { RestaurantUser } from "../src/types";

export default function KullaniciYonetimiScreen() {
  const { profile } = useStore();
  const {
    users,
    loading,
    refreshing,
    refresh,
    updateUser,
    inviteUser,
    removeUser,
    isAdmin,
  } = useKullaniciYonetimi();

  const [selectedUser, setSelectedUser] = useState<RestaurantUser | null>(null);
  const [showDuzenleModal, setShowDuzenleModal] = useState(false);
  const [showDavetModal, setShowDavetModal] = useState(false);

  const handleUserPress = (user: RestaurantUser) => {
    setSelectedUser(user);
    setShowDuzenleModal(true);
  };

  const handleSave = async (updates: {
    role: RestaurantUser["role"];
    permissions: any;
  }) => {
    if (!selectedUser) return false;
    return await updateUser(selectedUser.id, updates);
  };

  const handleRemove = async () => {
    if (!selectedUser) return false;
    return await removeUser(
      selectedUser.id,
      selectedUser.user?.name || "Kullanıcı"
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Stack.Screen
          options={{ title: "Kullanıcı Yönetimi", headerShown: false }}
        />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowDavetModal(true)}
        >
          <UserPlus size={22} color={colors.primary[500]} />
          <Text style={styles.addButtonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Users size={20} color={colors.text.secondary} />
            <Text style={styles.listHeaderText}>{users.length} Kullanıcı</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Users size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>Henüz kullanıcı yok</Text>
            <Text style={styles.emptySubtext}>
              Ekle butonuna tıklayarak kullanıcı ekleyebilirsiniz
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowDavetModal(true)}
            >
              <UserPlus size={18} color="#fff" />
              <Text style={styles.emptyButtonText}>Kullanıcı Ekle</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <KullaniciCard
            user={item}
            onPress={() => handleUserPress(item)}
            isCurrentUser={item.user_id === profile?.id}
          />
        )}
      />

      {/* Düzenleme Modal */}
      <KullaniciDuzenleModal
        visible={showDuzenleModal}
        user={selectedUser}
        onClose={() => {
          setShowDuzenleModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSave}
        onRemove={handleRemove}
        isCurrentUser={selectedUser?.user_id === profile?.id}
      />

      {/* Davet Modal */}
      <KullaniciDavetModal
        visible={showDavetModal}
        onClose={() => setShowDavetModal(false)}
        onInvite={inviteUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.text.secondary,
  },
  list: {
    padding: spacing.lg,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  listHeaderText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
