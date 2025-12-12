// CariCard Component - Ana liste item'ı

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
  ChevronRight,
  Building2,
  Users,
  FileText,
  EyeOff,
} from "lucide-react-native";
import { Cari, Kasa, Kategori } from "../../../types";
import { formatCurrency } from "../../../shared/utils";
import { CariIslemTipi } from "../types";
import { getIslemTipiConfig, getBalanceText } from "../constants";
import DatePickerField from "../../../components/DatePickerField";

interface CariCardProps {
  cari: Cari;
  isExpanded: boolean;
  activeIslemTipi: CariIslemTipi | null;
  nakitBankaKasalar: Kasa[];
  kategoriler: Kategori[];
  formDate: string;
  formKasaId: string;
  formKategoriId: string;
  formDescription: string;
  formAmount: string;
  formLoading: boolean;
  onToggleExpand: () => void;
  onSelectIslemTipi: (tip: CariIslemTipi) => void;
  onKalemliPress: () => void;
  onDetayPress: () => void;
  onDateChange: (date: string) => void;
  onKasaChange: (kasaId: string) => void;
  onKategoriPress: () => void;
  onDescriptionChange: (desc: string) => void;
  onAmountChange: (amount: string) => void;
  onSubmit: () => void;
}

export const CariCard: React.FC<CariCardProps> = ({
  cari,
  isExpanded,
  activeIslemTipi,
  nakitBankaKasalar,
  kategoriler,
  formDate,
  formKasaId,
  formKategoriId,
  formDescription,
  formAmount,
  formLoading,
  onToggleExpand,
  onSelectIslemTipi,
  onKalemliPress,
  onDetayPress,
  onDateChange,
  onKasaChange,
  onKategoriPress,
  onDescriptionChange,
  onAmountChange,
  onSubmit,
}) => {
  const balanceInfo = getBalanceText(
    cari.balance || 0,
    cari.type,
    formatCurrency
  );
  const isExcluded = !cari.include_in_reports;
  const islemTipleri = getIslemTipiConfig(cari.type);
  const activeConfig = islemTipleri.find((t) => t.key === activeIslemTipi);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={[
          styles.header,
          isExpanded && styles.headerExpanded,
          isExcluded && styles.headerExcluded,
        ]}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View
            style={[
              styles.icon,
              {
                backgroundColor:
                  cari.type === "tedarikci" ? "#dbeafe" : "#dcfce7",
              },
              isExcluded && styles.iconExcluded,
            ]}
          >
            {cari.type === "tedarikci" ? (
              <Building2 size={22} color={isExcluded ? "#9ca3af" : "#3b82f6"} />
            ) : (
              <Users size={22} color={isExcluded ? "#9ca3af" : "#10b981"} />
            )}
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, isExcluded && styles.nameExcluded]}>
                {cari.name}
              </Text>
              {isExcluded && (
                <EyeOff size={14} color="#9ca3af" style={{ marginLeft: 6 }} />
              )}
            </View>
            <Text
              style={[
                styles.balance,
                { color: isExcluded ? "#9ca3af" : balanceInfo.color },
              ]}
            >
              {balanceInfo.text}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          {isExpanded ? (
            <ChevronUp size={22} color="#6b7280" />
          ) : (
            <ChevronDown size={22} color="#6b7280" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* İşlem Tipleri */}
          <View style={styles.islemTipleri}>
            {islemTipleri.map((tip) => {
              const Icon = tip.icon;
              const isActive = activeIslemTipi === tip.key;
              return (
                <TouchableOpacity
                  key={tip.key}
                  style={[
                    styles.islemTipBtn,
                    { backgroundColor: isActive ? tip.color : tip.bgColor },
                  ]}
                  onPress={() => onSelectIslemTipi(tip.key)}
                >
                  <Icon size={18} color={isActive ? "#fff" : tip.color} />
                  <Text
                    style={[
                      styles.islemTipText,
                      { color: isActive ? "#fff" : tip.color },
                    ]}
                  >
                    {tip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Kalemli Fatura Butonu */}
          <TouchableOpacity
            style={[
              styles.kalemliBtn,
              cari.type === "musteri" && styles.kalemliBtnMusteri,
            ]}
            onPress={onKalemliPress}
          >
            <FileText
              size={16}
              color={cari.type === "tedarikci" ? "#8b5cf6" : "#10b981"}
            />
            <Text
              style={[
                styles.kalemliBtnText,
                cari.type === "musteri" && styles.kalemliBtnTextMusteri,
              ]}
            >
              {cari.type === "tedarikci"
                ? "Kalemli Fatura Girişi"
                : "Kalemli Satış Faturası"}
            </Text>
            <ChevronRight
              size={16}
              color={cari.type === "tedarikci" ? "#8b5cf6" : "#10b981"}
            />
          </TouchableOpacity>

          {/* Form */}
          {activeIslemTipi && (
            <View style={styles.formContainer}>
              <DatePickerField value={formDate} onChange={onDateChange} />

              {/* Kasa Seçimi - ödeme/tahsilat için */}
              {(activeIslemTipi === "odeme" ||
                activeIslemTipi === "tahsilat") && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.kasaScroll}
                >
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
                          formKasaId === kasa.id && styles.kasaChipTextActive,
                        ]}
                      >
                        {kasa.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Kategori Seçimi - alış için */}
              {activeIslemTipi === "alis" && (
                <TouchableOpacity
                  style={styles.kategoriSelectBtn}
                  onPress={onKategoriPress}
                >
                  <Text
                    style={[
                      styles.kategoriSelectText,
                      !formKategoriId && styles.kategoriSelectPlaceholder,
                    ]}
                  >
                    {formKategoriId
                      ? kategoriler.find((k) => k.id === formKategoriId)
                          ?.name || "Kategori seç"
                      : "Kategori seç (opsiyonel)"}
                  </Text>
                  <ChevronRight size={18} color="#6b7280" />
                </TouchableOpacity>
              )}

              {/* Açıklama */}
              <View style={styles.formRow}>
                <FileText size={18} color="#6b7280" />
                <TextInput
                  style={styles.formInput}
                  value={formDescription}
                  onChangeText={onDescriptionChange}
                  placeholder="Açıklama (opsiyonel)"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Tutar ve Kaydet */}
              <View style={styles.amountRow}>
                <View style={styles.amountBox}>
                  <Text style={styles.currencySign}>₺</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={formAmount}
                    onChangeText={onAmountChange}
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    { backgroundColor: activeConfig?.color },
                    formLoading && styles.saveBtnDisabled,
                  ]}
                  onPress={onSubmit}
                  disabled={formLoading}
                >
                  <Text style={styles.saveBtnText}>
                    {formLoading ? "Kaydediliyor..." : "KAYDET"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Detay Butonu */}
          <TouchableOpacity style={styles.detayBtn} onPress={onDetayPress}>
            <Text style={styles.detayBtnText}>Geçmiş İşlemleri Gör</Text>
            <ChevronRight size={18} color="#3b82f6" />
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
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerExpanded: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  headerExcluded: { opacity: 0.7 },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconExcluded: { backgroundColor: "#f3f4f6" },
  info: { marginLeft: 12, flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  nameExcluded: { color: "#9ca3af" },
  balance: { fontSize: 13, marginTop: 4 },
  right: { paddingLeft: 8 },
  expandedContent: { padding: 16, paddingTop: 12 },
  islemTipleri: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  islemTipBtn: {
    flex: 1,
    minWidth: "22%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  islemTipText: { fontSize: 11, fontWeight: "700" },
  kalemliBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#f5f3ff",
    borderRadius: 10,
    marginBottom: 12,
  },
  kalemliBtnMusteri: { backgroundColor: "#ecfdf5" },
  kalemliBtnText: { fontSize: 14, fontWeight: "600", color: "#8b5cf6" },
  kalemliBtnTextMusteri: { color: "#10b981" },
  formContainer: { gap: 12, marginBottom: 12 },
  kasaScroll: { marginVertical: 4 },
  kasaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  kasaChipActive: { backgroundColor: "#3b82f6" },
  kasaChipText: { fontSize: 13, fontWeight: "500", color: "#6b7280" },
  kasaChipTextActive: { color: "#fff" },
  kategoriSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kategoriSelectText: { fontSize: 14, color: "#111827" },
  kategoriSelectPlaceholder: { color: "#9ca3af" },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  formInput: { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 12 },
  amountRow: { flexDirection: "row", gap: 12 },
  amountBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySign: { fontSize: 18, fontWeight: "600", color: "#6b7280" },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
    paddingLeft: 8,
  },
  saveBtn: {
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  detayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  detayBtnText: { fontSize: 14, fontWeight: "500", color: "#3b82f6" },
});
