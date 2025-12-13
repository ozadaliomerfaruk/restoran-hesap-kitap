/**
 * Profile Form Hook
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useStore } from "@/store/useStore";
import { profileService } from "../../../services/supabase";
import type {
  ProfileFormData,
  PasswordFormData,
  ProfileFormErrors,
  PasswordFormErrors,
} from "../types";

export function useProfileForm() {
  const { profile, fetchProfile } = useStore();

  // Profile Form State
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile verisi geldiğinde formu doldur
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  // Profil validasyonu
  const validateProfile = (): boolean => {
    const errors: ProfileFormErrors = {};

    if (!profileData.name.trim()) {
      errors.name = "Ad soyad zorunludur";
    } else if (profileData.name.trim().length < 2) {
      errors.name = "Ad soyad en az 2 karakter olmalı";
    }

    if (
      profileData.phone &&
      !/^[0-9]{10,11}$/.test(profileData.phone.replace(/\s/g, ""))
    ) {
      errors.phone = "Geçerli bir telefon numarası girin";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Şifre validasyonu
  const validatePassword = (): boolean => {
    const errors: PasswordFormErrors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Mevcut şifre zorunludur";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "Yeni şifre zorunludur";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Şifre en az 6 karakter olmalı";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Şifreler eşleşmiyor";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Profil kaydet
  const saveProfile = async (): Promise<boolean> => {
    if (!validateProfile()) return false;

    setProfileLoading(true);
    try {
      const { error } = await profileService.updateProfile({
        name: profileData.name.trim(),
        phone: profileData.phone.trim() || undefined,
      });

      if (error) {
        Alert.alert("Hata", "Profil güncellenirken bir hata oluştu");
        return false;
      }

      await fetchProfile();
      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi");
      return true;
    } catch (error) {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu");
      return false;
    } finally {
      setProfileLoading(false);
    }
  };

  // Şifre değiştir
  const changePassword = async (): Promise<boolean> => {
    if (!validatePassword()) return false;

    setPasswordLoading(true);
    try {
      const { error } = await profileService.changePassword(
        passwordData.newPassword
      );

      if (error) {
        Alert.alert("Hata", error.message || "Şifre değiştirilemedi");
        return false;
      }

      // Formu temizle
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi");
      return true;
    } catch (error) {
      Alert.alert("Hata", "Beklenmeyen bir hata oluştu");
      return false;
    } finally {
      setPasswordLoading(false);
    }
  };

  return {
    // Profile
    profile,
    profileData,
    setProfileData,
    profileErrors,
    profileLoading,
    saveProfile,

    // Password
    passwordData,
    setPasswordData,
    passwordErrors,
    passwordLoading,
    changePassword,
  };
}
