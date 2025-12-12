/**
 * Hesap Ekleme Modal
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Wallet, Building2, CreditCard, PiggyBank } from "lucide-react-native";
import { colors, spacing, borderRadius, textStyles } from "@/shared/constants";
import { BaseModal } from "@/shared/components/modals";
import { FormInput, MoneyInput } from "@/shared/components/forms";
import { Button } from "@/shared/components/ui";
import { useStore } from "@/store/useStore";
import { kasaTypeConfig, KasaType } from "../constants";

interface HesapEkleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function HesapEkleModal({
  visible,
  onClose,
  onSuccess,
}: HesapEkleModalProps) {
  const { addKasa } = useStore();

  const [name, setName] = useState("");
  const [type, setType] = useState<KasaType>("nakit");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setType("nakit");
    setBalance("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Hesap adı girin");
      return;
    }

    setLoading(true);
    try {
      const { error } = await addKasa({
        name: name.trim(),
        type,
        currency: "TRY",
        is_active: true,
        is_archived: false,
        initial_balance: balance ? parseFloat(balance.replace(",", ".")) : 0,
      } as any);

      if (error) throw error;

      Alert.alert("Başarılı", "Hesap eklendi");
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Hesap ekleme hatası:", error);
      Alert.alert("Hata", "Hesap eklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const typeButtons: {
    type: KasaType;
    label: string;
    icon: any;
    color: string;
  }[] = [
    {
      type: "nakit",
      label: "Nakit",
      icon: Wallet,
      color: kasaTypeConfig.nakit.color,
    },
    {
      type: "banka",
      label: "Banka",
      icon: Building2,
      color: kasaTypeConfig.banka.color,
    },
    {
      type: "kredi_karti",
      label: "Kredi K.",
      icon: CreditCard,
      color: kasaTypeConfig.kredi_karti.color,
    },
    {
      type: "birikim",
      label: "Birikim",
      icon: PiggyBank,
      color: kasaTypeConfig.birikim.color,
    },
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title="Yeni Hesap Ekle"
      footer={
        <View style={styles.footer}>
          <Button
            variant="outline"
            onPress={handleClose}
            style={styles.footerBtn}
          >
            İptal
          </Button>
          <Button
            onPress={handleSubmit}
            loading={loading}
            style={styles.footerBtn}
          >
            Ekle
          </Button>
        </View>
      }
    >
      <FormInput
        label="Hesap Adı"
        value={name}
        onChangeText={setName}
        placeholder="Örn: Ana Kasa, Ziraat Bankası"
        required
      />

      <Text style={styles.label}>Hesap Türü</Text>
      <View style={styles.typeRow}>
        {typeButtons.map((item) => {
          const Icon = item.icon;
          const isSelected = type === item.type;
          return (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeBtn,
                isSelected && {
                  backgroundColor: item.color,
                  borderColor: item.color,
                },
              ]}
              onPress={() => setType(item.type)}
            >
              <Icon size={16} color={isSelected ? "#fff" : item.color} />
              <Text
                style={[styles.typeBtnText, isSelected && { color: "#fff" }]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <MoneyInput
        label="Açılış Bakiyesi (Opsiyonel)"
        value={balance}
        onChangeText={setBalance}
        placeholder="0"
      />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  label: {
    ...textStyles.inputLabel,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    gap: 4,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.tertiary,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  footerBtn: {
    flex: 1,
  },
});

export default HesapEkleModal;
