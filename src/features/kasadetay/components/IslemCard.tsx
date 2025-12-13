/**
 * İşlem Card - Akordeon düzenleme ile
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trash2,
  Check,
} from "lucide-react-native";
import { colors, spacing, borderRadius } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { CreatedByBadge } from "@/shared/components";
import { BirlesikIslem, islemTipiLabels, islemTipiColors } from "../types";

interface IslemCardProps {
  islem: BirlesikIslem;
  isExpanded: boolean;
  onToggle: () => void;
  // Edit state
  editDate: Date;
  editAmount: string;
  editDesc: string;
  editKategoriId: string;
  onEditDateChange: (date: Date) => void;
  onEditAmountChange: (amount: string) => void;
  onEditDescChange: (desc: string) => void;
  onKategoriPress: () => void;
  kategoriler: { id: string; name: string }[];
  // Actions
  onSave: () => void;
  onDelete: () => void;
  loading: boolean;
  showDatePicker: boolean;
  onShowDatePicker: (show: boolean) => void;
}

export function IslemCard({
  islem,
  isExpanded,
  onToggle,
  editDate,
  editAmount,
  editDesc,
  editKategoriId,
  onEditDateChange,
  onEditAmountChange,
  onEditDescChange,
  onKategoriPress,
  kategoriler,
  onSave,
  onDelete,
  loading,
  showDatePicker,
  onShowDatePicker,
}: IslemCardProps) {
  const color = islemTipiColors[islem.type] || "#6b7280";
  const label =
    islem.type === "transfer"
      ? islem.isTransferIn
        ? "TRANSFER (Giriş)"
        : "TRANSFER (Çıkış)"
      : islemTipiLabels[islem.type] || islem.type.toUpperCase();

  const sign =
    islem.type === "transfer"
      ? islem.isTransferIn
        ? "+"
        : "-"
      : ["gelir", "tahsilat", "personel_tahsilat"].includes(islem.type)
      ? "+"
      : "-";

  const getIcon = () => {
    if (islem.type === "transfer") {
      return islem.isTransferIn ? (
        <ArrowDownLeft size={22} color="#f59e0b" />
      ) : (
        <ArrowUpRight size={22} color="#f59e0b" />
      );
    }
    if (["gelir", "tahsilat", "personel_tahsilat"].includes(islem.type)) {
      return <ArrowDownLeft size={22} color={color} />;
    }
    return <ArrowUpRight size={22} color={color} />;
  };

  const selectedKategori = kategoriler.find((k) => k.id === editKategoriId);

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            {getIcon()}
          </View>
          <View style={styles.info}>
            <Text style={[styles.type, { color }]}>{label}</Text>
            {islem.cari && <Text style={styles.cari}>{islem.cari.name}</Text>}
            {islem.personel && (
              <Text style={styles.personel}>{islem.personel.name}</Text>
            )}
            {islem.kategori && (
              <Text style={styles.kategori}>{islem.kategori.name}</Text>
            )}
            {islem.type === "transfer" && islem.target_kasa && (
              <Text style={styles.transferKasa}>
                {islem.isTransferIn ? "← " : "→ "}
                {islem.target_kasa.name}
              </Text>
            )}
            {islem.description && (
              <Text
                style={styles.desc}
                numberOfLines={isExpanded ? undefined : 1}
              >
                {islem.description}
              </Text>
            )}
            {/* Kullanıcı Etiketi */}
            {islem.created_by_user && (
              <View style={styles.userRow}>
                <CreatedByBadge user={islem.created_by_user} size="small" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color }]}>
            {sign}
            {formatCurrency(islem.amount)}
          </Text>
          {isExpanded ? (
            <ChevronUp size={20} color="#9ca3af" />
          ) : (
            <ChevronDown size={20} color="#9ca3af" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Edit */}
      {isExpanded && (
        <View style={styles.expanded}>
          {/* Tutar */}
          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Tutar</Text>
            <View style={styles.amountBox}>
              <Text style={styles.currency}>₺</Text>
              <TextInput
                style={styles.amountInput}
                value={editAmount}
                onChangeText={onEditAmountChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Tarih */}
          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Tarih</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => onShowDatePicker(true)}
            >
              <Calendar size={18} color="#6b7280" />
              <Text style={styles.dateText}>
                {editDate.toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && Platform.OS === "ios" && (
            <View style={styles.iosDatePicker}>
              <DateTimePicker
                value={editDate}
                mode="date"
                display="spinner"
                onChange={(_, date) => date && onEditDateChange(date)}
                locale="tr-TR"
              />
              <TouchableOpacity
                style={styles.datePickerDone}
                onPress={() => onShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={editDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                onShowDatePicker(false);
                if (date) onEditDateChange(date);
              }}
            />
          )}

          {/* Kategori - sadece gelir/gider için */}
          {islem.source === "islem" &&
            ["gelir", "gider"].includes(islem.type) && (
              <View style={styles.editRow}>
                <Text style={styles.editLabel}>Kategori</Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={onKategoriPress}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !editKategoriId && { color: "#9ca3af" },
                    ]}
                  >
                    {selectedKategori?.name || "Seçilmedi"}
                  </Text>
                  <ChevronDown size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            )}

          {/* Açıklama */}
          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Açıklama</Text>
            <TextInput
              style={styles.descInput}
              value={editDesc}
              onChangeText={onEditDescChange}
              placeholder="Açıklama ekle..."
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Butonlar */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Trash2 size={18} color="#ef4444" />
              <Text style={styles.deleteBtnText}>Sil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={loading}
            >
              <Check size={18} color="#fff" />
              <Text style={styles.saveBtnText}>
                {loading ? "..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  left: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  right: { alignItems: "flex-end", gap: 6 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { marginLeft: 14, flex: 1 },
  type: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  cari: { fontSize: 14, color: "#3b82f6", marginTop: 3, fontWeight: "500" },
  personel: { fontSize: 14, color: "#ec4899", marginTop: 3, fontWeight: "500" },
  kategori: {
    fontSize: 13,
    color: "#8b5cf6",
    marginTop: 3,
    fontStyle: "italic",
  },
  transferKasa: {
    fontSize: 14,
    color: "#f59e0b",
    marginTop: 3,
    fontWeight: "500",
  },
  desc: { fontSize: 14, color: "#9ca3af", marginTop: 4 },
  userRow: { marginTop: 4 },
  amount: { fontSize: 18, fontWeight: "700" },
  expanded: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  editRow: { marginTop: 14 },
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 6,
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateText: { fontSize: 15, color: "#111827", flex: 1 },
  iosDatePicker: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },
  datePickerDone: {
    backgroundColor: "#3b82f6",
    padding: 12,
    alignItems: "center",
  },
  datePickerDoneText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectText: { fontSize: 15, color: "#111827" },
  descInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
  },
  deleteBtnText: { fontSize: 14, fontWeight: "600", color: "#ef4444" },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#10b981",
  },
  saveBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});

export default IslemCard;
