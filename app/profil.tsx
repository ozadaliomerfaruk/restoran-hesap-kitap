/**
 * Profil Bilgileri Sayfası
 */

import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import {
  ProfileInfoSection,
  PasswordSection,
  useProfileForm,
} from "../src/features/profil";
import { colors, spacing } from "../src/shared/constants";

export default function ProfilScreen() {
  const {
    profile,
    profileData,
    setProfileData,
    profileErrors,
    profileLoading,
    saveProfile,
    passwordData,
    setPasswordData,
    passwordErrors,
    passwordLoading,
    changePassword,
  } = useProfileForm();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profil Bilgileri",
          headerBackTitle: "Geri",
        }}
      />

      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profil Bilgileri */}
          <ProfileInfoSection
            data={profileData}
            errors={profileErrors}
            email={profile?.email}
            loading={profileLoading}
            onChange={setProfileData}
            onSave={saveProfile}
          />

          {/* Şifre Değiştir */}
          <PasswordSection
            data={passwordData}
            errors={passwordErrors}
            loading={passwordLoading}
            onChange={setPasswordData}
            onSave={changePassword}
          />

          {/* Alt boşluk */}
          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
});
