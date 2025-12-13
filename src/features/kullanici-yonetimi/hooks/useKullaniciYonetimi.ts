/**
 * Kullanıcı Yönetimi Hook
 */

import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useStore } from "@/store/useStore";
import { restaurantUserService } from "../../../services/supabase";
import type {
  RestaurantUser,
  UserPermissions,
  DEFAULT_PERMISSIONS,
} from "../../../types";

export function useKullaniciYonetimi() {
  const { profile } = useStore();

  const [users, setUsers] = useState<RestaurantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Kullanıcıları yükle
  const fetchUsers = useCallback(async () => {
    if (!profile?.restaurant_id) return;

    try {
      const { data, error } = await restaurantUserService.fetchAll(
        profile.restaurant_id
      );

      if (error) {
        console.error("Kullanıcılar yüklenirken hata:", error);
        return;
      }

      setUsers(data);
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.restaurant_id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Yenile
  const refresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  // Kullanıcı güncelle
  const updateUser = async (
    userId: string,
    updates: Partial<Pick<RestaurantUser, "role" | "permissions">>
  ): Promise<boolean> => {
    const { error } = await restaurantUserService.update(userId, updates);

    if (error) {
      Alert.alert("Hata", "Kullanıcı güncellenirken bir hata oluştu");
      return false;
    }

    await fetchUsers();
    Alert.alert("Başarılı", "Kullanıcı yetkileri güncellendi");
    return true;
  };

  // Kullanıcı davet et
  const inviteUser = async (
    email: string,
    role: RestaurantUser["role"],
    permissions: UserPermissions
  ): Promise<boolean> => {
    if (!profile?.restaurant_id) return false;

    const { error } = await restaurantUserService.invite(
      profile.restaurant_id,
      email,
      role,
      permissions
    );

    if (error) {
      Alert.alert(
        "Hata",
        typeof error === "string" ? error : "Kullanıcı davet edilemedi"
      );
      return false;
    }

    await fetchUsers();
    Alert.alert("Başarılı", "Kullanıcı başarıyla eklendi");
    return true;
  };

  // Kullanıcı erişimini kaldır
  const removeUser = async (
    userId: string,
    userName: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Erişimi Kaldır",
        `${userName} kullanıcısının erişimini kaldırmak istediğinize emin misiniz?`,
        [
          { text: "İptal", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Kaldır",
            style: "destructive",
            onPress: async () => {
              const { error } = await restaurantUserService.remove(userId);

              if (error) {
                Alert.alert(
                  "Hata",
                  "Kullanıcı erişimi kaldırılırken bir hata oluştu"
                );
                resolve(false);
                return;
              }

              await fetchUsers();
              Alert.alert("Başarılı", "Kullanıcı erişimi kaldırıldı");
              resolve(true);
            },
          },
        ]
      );
    });
  };

  // Aktif kullanıcılar (is_active = true)
  const activeUsers = users.filter((u) => u.is_active);

  // Mevcut kullanıcı admin mi?
  const isCurrentUserAdmin = users.find(
    (u) => u.user_id === profile?.id && u.role === "admin"
  );

  return {
    users: activeUsers,
    loading,
    refreshing,
    refresh,
    updateUser,
    inviteUser,
    removeUser,
    isAdmin: !!isCurrentUserAdmin,
  };
}
