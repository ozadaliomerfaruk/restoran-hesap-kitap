/**
 * Hedef Seçme Modal - Personel veya Cari seçimi
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Users, Truck, ShoppingBag, ChevronRight } from "lucide-react-native";
import { colors, spacing, borderRadius, textStyles } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { BaseModal } from "@/shared/components/modals";
import { Personel, Cari } from "@/types";

interface HedefSecModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: "personel" | "cari", id: string) => void;
  title: string;
  personeller: Personel[];
  tedarikciler: Cari[];
  musteriler: Cari[];
}

export function HedefSecModal({
  visible,
  onClose,
  onSelect,
  title,
  personeller,
  tedarikciler,
  musteriler,
}: HedefSecModalProps) {
  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title}
      scrollable={false}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {personeller.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Personel</Text>
            {personeller.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.item}
                onPress={() => onSelect("personel", p.id)}
              >
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: colors.warning.light },
                  ]}
                >
                  <Users size={18} color={colors.warning.main} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{p.name}</Text>
                  <Text style={styles.itemBalance}>
                    Bakiye: {formatCurrency(p.balance)}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.text.disabled} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {tedarikciler.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
              Tedarikçiler
            </Text>
            {tedarikciler.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.item}
                onPress={() => onSelect("cari", c.id)}
              >
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: colors.error.light },
                  ]}
                >
                  <Truck size={18} color={colors.error.main} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{c.name}</Text>
                  <Text style={styles.itemBalance}>
                    Bakiye: {formatCurrency(c.balance)}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.text.disabled} />
              </TouchableOpacity>
            ))}
          </>
        )}

        {musteriler.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
              Müşteriler
            </Text>
            {musteriler.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.item}
                onPress={() => onSelect("cari", c.id)}
              >
                <View
                  style={[
                    styles.itemIcon,
                    { backgroundColor: colors.success.light },
                  ]}
                >
                  <ShoppingBag size={18} color={colors.success.main} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{c.name}</Text>
                  <Text style={styles.itemBalance}>
                    Bakiye: {formatCurrency(c.balance)}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.text.disabled} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    padding: 14,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  itemBalance: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

export default HedefSecModal;
