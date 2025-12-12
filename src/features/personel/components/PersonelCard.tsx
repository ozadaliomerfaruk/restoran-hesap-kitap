// PersonelCard Component - Ana liste item'ı

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  CalendarDays,
  PlusCircle,
  MinusCircle,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
} from "lucide-react-native";
import { Personel, Kasa } from "../../../types";
import { formatCurrency } from "../../../shared/utils";
import { getBalanceInfo, GIDER_KATEGORILERI } from "../constants";
import { IslemTipi, GiderKategori } from "../types";
import DatePickerField from "../../../components/DatePickerField";

interface PersonelCardProps {
  personel: Personel;
  isExpanded: boolean;
  activeIslemTipi: IslemTipi | null;
  izinGunleri: number;
  nakitBankaKasalar: Kasa[];
  // Form state
  formDate: string;
  formKasaId: string | null;
  formKategori: GiderKategori;
  formDescription: string;
  formAmount: string;
  formLoading: boolean;
  // Callbacks
  onToggleExpand: () => void;
  onSelectIslemTipi: (tip: IslemTipi) => void;
  onIzinEkle: () => void;
  onIzinDus: () => void;
  onOpenDetail: () => void;
  // Form callbacks
  onDateChange: (date: string) => void;
  onKasaChange: (kasaId: string) => void;
  onKategoriChange: (kategori: GiderKategori) => void;
  onDescriptionChange: (desc: string) => void;
  onAmountChange: (amount: string) => void;
  onSubmit: () => void;
}

export const PersonelCard: React.FC<PersonelCardProps> = ({
  personel,
  isExpanded,
  activeIslemTipi,
  izinGunleri,
  nakitBankaKasalar,
  formDate,
  formKasaId,
  formKategori,
  formDescription,
  formAmount,
  formLoading,
  onToggleExpand,
  onSelectIslemTipi,
  onIzinEkle,
  onIzinDus,
  onOpenDetail,
  onDateChange,
  onKasaChange,
  onKategoriChange,
  onDescriptionChange,
  onAmountChange,
  onSubmit,
}) => {
  const balance = personel.balance || 0;
  const balanceInfo = getBalanceInfo(balance);
  const isExcluded = !personel.include_in_reports;

  return (
    <View style={[styles.container, isExcluded && styles.containerExcluded]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View style={[styles.avatar, isExcluded && styles.avatarExcluded]}>
            <Text
              style={[
                styles.avatarText,
                isExcluded && styles.avatarTextExcluded,
              ]}
            >
              {personel.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, isExcluded && styles.nameExcluded]}>
                {personel.name}
              </Text>
              {isExcluded && (
                <EyeOff size={14} color="#9ca3af" style={{ marginLeft: 6 }} />
              )}
            </View>
            <View style={styles.subInfo}>
              {personel.position ? (
                <Text
                  style={[
                    styles.position,
                    isExcluded && styles.positionExcluded,
                  ]}
                >
                  {personel.position}
                </Text>
              ) : null}
              {izinGunleri !== 0 && (
                <View
                  style={[
                    styles.izinBadge,
                    izinGunleri > 0
                      ? styles.izinBadgePositive
                      : styles.izinBadgeNegative,
                  ]}
                >
                  <CalendarDays
                    size={12}
                    color={izinGunleri > 0 ? "#10b981" : "#ef4444"}
                  />
                  <Text
                    style={[
                      styles.izinBadgeText,
                      { color: izinGunleri > 0 ? "#10b981" : "#ef4444" },
                    ]}
                  >
                    {izinGunleri > 0
                      ? `${izinGunleri} gün izin`
                      : `${Math.abs(izinGunleri)} gün eksik`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.right}>
          <View
            style={[
              styles.balanceBadge,
              { backgroundColor: isExcluded ? "#f3f4f6" : balanceInfo.bgColor },
            ]}
          >
            <Text
              style={[
                styles.balanceText,
                { color: isExcluded ? "#9ca3af" : balanceInfo.color },
              ]}
            >
              {formatCurrency(Math.abs(balance))}
            </Text>
          </View>
          {isExpanded ? (
            <ChevronUp size={20} color="#6b7280" />
          ) : (
            <ChevronDown size={20} color="#6b7280" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Durum kartları */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusCard,
                { backgroundColor: balanceInfo.bgColor, flex: 1 },
              ]}
            >
              <Text
                style={[styles.statusCardText, { color: balanceInfo.color }]}
              >
                {balanceInfo.text}: {formatCurrency(Math.abs(balance))}
              </Text>
            </View>
            <View
              style={[
                styles.statusCard,
                { backgroundColor: "#f0fdf4", flex: 1 },
              ]}
            >
              <CalendarDays size={16} color="#10b981" />
              <Text style={styles.statusCardText}>{izinGunleri} gün izin</Text>
            </View>
          </View>

          {/* İzin butonları */}
          <View style={styles.izinBtnRow}>
            <TouchableOpacity style={styles.izinBtn} onPress={onIzinEkle}>
              <PlusCircle size={18} color="#10b981" />
              <Text style={styles.izinBtnText}>İzin Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.izinBtn} onPress={onIzinDus}>
              <MinusCircle size={18} color="#f59e0b" />
              <Text style={[styles.izinBtnText, { color: "#f59e0b" }]}>
                İzin Düş
              </Text>
            </TouchableOpacity>
          </View>

          {/* İşlem tipi butonları */}
          <View style={styles.islemTipleri}>
            <TouchableOpacity
              style={[
                styles.islemTipiBtn,
                { borderColor: "#ef4444" },
                activeIslemTipi === "gider" && { backgroundColor: "#ef4444" },
              ]}
              onPress={() => onSelectIslemTipi("gider")}
            >
              <Wallet
                size={16}
                color={activeIslemTipi === "gider" ? "#fff" : "#ef4444"}
              />
              <Text
                style={[
                  styles.islemTipiBtnText,
                  { color: activeIslemTipi === "gider" ? "#fff" : "#ef4444" },
                ]}
              >
                GİDER
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.islemTipiBtn,
                { borderColor: "#3b82f6" },
                activeIslemTipi === "odeme" && { backgroundColor: "#3b82f6" },
              ]}
              onPress={() => onSelectIslemTipi("odeme")}
            >
              <ArrowUpRight
                size={16}
                color={activeIslemTipi === "odeme" ? "#fff" : "#3b82f6"}
              />
              <Text
                style={[
                  styles.islemTipiBtnText,
                  { color: activeIslemTipi === "odeme" ? "#fff" : "#3b82f6" },
                ]}
              >
                ÖDEME
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.islemTipiBtn,
                { borderColor: "#10b981" },
                activeIslemTipi === "tahsilat" && {
                  backgroundColor: "#10b981",
                },
              ]}
              onPress={() => onSelectIslemTipi("tahsilat")}
            >
              <ArrowDownLeft
                size={16}
                color={activeIslemTipi === "tahsilat" ? "#fff" : "#10b981"}
              />
              <Text
                style={[
                  styles.islemTipiBtnText,
                  {
                    color: activeIslemTipi === "tahsilat" ? "#fff" : "#10b981",
                  },
                ]}
              >
                TAHSİLAT
              </Text>
            </TouchableOpacity>
          </View>

          {/* İşlem formu */}
          {activeIslemTipi && (
            <View style={styles.formContainer}>
              <DatePickerField value={formDate} onChange={onDateChange} />

              {/* Gider kategorisi */}
              {activeIslemTipi === "gider" && (
                <View style={styles.kategoriContainer}>
                  <Text style={styles.formLabel}>Kategori</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.kategoriList}>
                      {GIDER_KATEGORILERI.map((kat) => {
                        const Icon = kat.icon;
                        return (
                          <TouchableOpacity
                            key={kat.value}
                            style={[
                              styles.kategoriChip,
                              formKategori === kat.value &&
                                styles.kategoriChipActive,
                            ]}
                            onPress={() => onKategoriChange(kat.value)}
                          >
                            <Icon
                              size={14}
                              color={
                                formKategori === kat.value ? "#fff" : "#6b7280"
                              }
                            />
                            <Text
                              style={[
                                styles.kategoriChipText,
                                formKategori === kat.value &&
                                  styles.kategoriChipTextActive,
                              ]}
                            >
                              {kat.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Kasa seçimi */}
              {(activeIslemTipi === "odeme" ||
                activeIslemTipi === "tahsilat") && (
                <View style={styles.kasaContainer}>
                  <Text style={styles.formLabel}>Kasa</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.kasaList}>
                      {nakitBankaKasalar.map((kasa) => (
                        <TouchableOpacity
                          key={kasa.id}
                          style={[
                            styles.kasaChip,
                            formKasaId === kasa.id && styles.kasaChipActive,
                          ]}
                          onPress={() => onKasaChange(kasa.id)}
                        >
                          <Text
                            style={[
                              styles.kasaChipText,
                              formKasaId === kasa.id &&
                                styles.kasaChipTextActive,
                            ]}
                          >
                            {kasa.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Açıklama */}
              <TextInput
                style={styles.descInput}
                placeholder="Açıklama (opsiyonel)"
                placeholderTextColor="#9ca3af"
                value={formDescription}
                onChangeText={onDescriptionChange}
              />

              {/* Tutar ve kaydet */}
              <View style={styles.amountRow}>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₺</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    value={formAmount}
                    onChangeText={onAmountChange}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    formLoading && styles.submitBtnDisabled,
                  ]}
                  onPress={onSubmit}
                  disabled={formLoading}
                >
                  <Text style={styles.submitBtnText}>
                    {formLoading ? "..." : "KAYDET"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Geçmiş işlemleri gör */}
          <TouchableOpacity style={styles.historyBtn} onPress={onOpenDetail}>
            <FileText size={16} color="#6b7280" />
            <Text style={styles.historyBtnText}>Geçmiş İşlemleri Gör</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  containerExcluded: {
    opacity: 0.7,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarExcluded: {
    backgroundColor: "#f3f4f6",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4f46e5",
  },
  avatarTextExcluded: {
    color: "#9ca3af",
  },
  info: {
    marginLeft: 14,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  nameExcluded: {
    color: "#9ca3af",
  },
  subInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  position: {
    fontSize: 13,
    color: "#6b7280",
  },
  positionExcluded: {
    color: "#9ca3af",
  },
  izinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  izinBadgePositive: {
    backgroundColor: "#dcfce7",
  },
  izinBadgeNegative: {
    backgroundColor: "#fef2f2",
  },
  izinBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  statusCardText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  izinBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  izinBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
  },
  izinBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#10b981",
  },
  islemTipleri: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  islemTipiBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  islemTipiBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  formContainer: {
    marginTop: 16,
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  kategoriContainer: {
    marginTop: 4,
  },
  kategoriList: {
    flexDirection: "row",
    gap: 8,
  },
  kategoriChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  kategoriChipActive: {
    backgroundColor: "#ef4444",
  },
  kategoriChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  kategoriChipTextActive: {
    color: "#fff",
  },
  kasaContainer: {
    marginTop: 4,
  },
  kasaList: {
    flexDirection: "row",
    gap: 8,
  },
  kasaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  kasaChipActive: {
    backgroundColor: "#3b82f6",
  },
  kasaChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  kasaChipTextActive: {
    color: "#fff",
  },
  descInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },
  amountRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  submitBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  historyBtnText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
