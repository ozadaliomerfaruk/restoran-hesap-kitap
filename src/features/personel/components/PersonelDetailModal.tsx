// PersonelDetailModal Component - Personel detay modal

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  MoreVertical,
  Wallet,
  CalendarDays,
  Trash2,
  EyeOff,
} from "lucide-react-native";
import { Personel, PersonelIslem, Izin, Kasa } from "../../../types";
import { formatCurrency, formatDate } from "../../../shared/utils";
import { getBalanceInfo, getIslemTypeInfo } from "../constants";
import { izinTypeLabels } from "../types";
import { PersonelMenuModal } from "./PersonelMenuModal";

interface PersonelDetailModalProps {
  visible: boolean;
  personel: Personel | null;
  personelIslemler: PersonelIslem[];
  izinler: Izin[];
  kasalar: Kasa[];
  onClose: () => void;
  onDeleteIslem: (islem: PersonelIslem) => void;
  onDeleteIzin: (izin: Izin) => void;
  onUpdateName: (name: string) => Promise<boolean>;
  onArchive: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onToggleIncludeInReports: () => Promise<boolean>;
}

export const PersonelDetailModal: React.FC<PersonelDetailModalProps> = ({
  visible,
  personel,
  personelIslemler,
  izinler,
  kasalar,
  onClose,
  onDeleteIslem,
  onDeleteIzin,
  onUpdateName,
  onArchive,
  onDelete,
  onToggleIncludeInReports,
}) => {
  const [activeTab, setActiveTab] = useState<"hesap" | "izin">("hesap");
  const [showMenuModal, setShowMenuModal] = useState(false);

  if (!personel) return null;

  const balance = personel.balance || 0;
  const balanceInfo = getBalanceInfo(balance);

  // Personel işlemleri (tarihe göre sıralı)
  const filteredIslemler = personelIslemler
    .filter((i) => i.personel_id === personel.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Personel izinleri
  const filteredIzinler = izinler
    .filter((i) => i.personel_id === personel.id)
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

  // İzin hesaplamaları
  const toplamHak = filteredIzinler
    .filter((i) => i.days > 0)
    .reduce((sum, i) => sum + i.days, 0);
  const kullanilanIzin = Math.abs(
    filteredIzinler
      .filter((i) => i.days < 0)
      .reduce((sum, i) => sum + i.days, 0)
  );
  const kalanIzin = toplamHak - kullanilanIzin;

  // Tarih ayracı için helper
  const getDateKey = (dateStr: string) => dateStr.split("T")[0];
  const formatDateHeader = (dateStr: string) => formatDate(dateStr, "full");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>{personel.name}</Text>
          <TouchableOpacity onPress={() => setShowMenuModal(true)}>
            <MoreVertical size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Raporlara dahil değil badge */}
        {!personel.include_in_reports && (
          <View style={styles.excludedBadge}>
            <EyeOff size={14} color="#f59e0b" />
            <Text style={styles.excludedBadgeText}>Raporlara dahil değil</Text>
          </View>
        )}

        {/* Tab butonları */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "hesap" && styles.tabActiveHesap]}
            onPress={() => setActiveTab("hesap")}
          >
            <Wallet
              size={16}
              color={activeTab === "hesap" ? "#fff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "hesap" && styles.tabTextActive,
              ]}
            >
              Hesap Hareketleri
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "izin" && styles.tabActiveIzin]}
            onPress={() => setActiveTab("izin")}
          >
            <CalendarDays
              size={16}
              color={activeTab === "izin" ? "#fff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "izin" && styles.tabTextActive,
              ]}
            >
              İzin Hareketleri
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hesap Hareketleri Tab */}
        {activeTab === "hesap" && (
          <ScrollView style={styles.content}>
            {/* Bakiye kartı */}
            <View
              style={[
                styles.balanceCard,
                { backgroundColor: balanceInfo.bgColor },
              ]}
            >
              <Text style={styles.balanceLabel}>Bakiye Durumu</Text>
              <Text style={[styles.balanceValue, { color: balanceInfo.color }]}>
                {balanceInfo.text}: {formatCurrency(Math.abs(balance))}
              </Text>
            </View>

            {/* İşlem listesi */}
            <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>

            {filteredIslemler.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz işlem yok</Text>
              </View>
            ) : (
              filteredIslemler.map((islem, index) => {
                const typeInfo = getIslemTypeInfo(islem.type);
                const Icon = typeInfo.icon;
                const kasaName = kasalar.find(
                  (k) => k.id === islem.kasa_id
                )?.name;

                const prevIslem =
                  index > 0 ? filteredIslemler[index - 1] : null;
                const showDateHeader =
                  !prevIslem ||
                  getDateKey(prevIslem.date) !== getDateKey(islem.date);

                const isGider = [
                  "maas",
                  "mesai",
                  "prim",
                  "avans",
                  "diger",
                  "tazminat",
                  "komisyon",
                  "kesinti",
                ].includes(islem.type);

                return (
                  <View key={islem.id}>
                    {showDateHeader && (
                      <View style={styles.dateSeparator}>
                        <View style={styles.dateSeparatorLine} />
                        <Text style={styles.dateSeparatorText}>
                          {formatDateHeader(islem.date)}
                        </Text>
                        <View style={styles.dateSeparatorLine} />
                      </View>
                    )}

                    <View style={styles.islemItem}>
                      <View style={styles.islemLeft}>
                        <View
                          style={[
                            styles.islemIcon,
                            { backgroundColor: `${typeInfo.color}20` },
                          ]}
                        >
                          <Icon size={16} color={typeInfo.color} />
                        </View>
                        <View style={styles.islemInfo}>
                          <Text
                            style={[
                              styles.islemType,
                              { color: typeInfo.color },
                            ]}
                          >
                            {typeInfo.label}
                          </Text>
                          {islem.description && (
                            <Text style={styles.islemDesc} numberOfLines={1}>
                              {islem.description}
                            </Text>
                          )}
                          {kasaName && (
                            <Text style={styles.islemKasa}>{kasaName}</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.islemRight}>
                        <Text
                          style={[
                            styles.islemAmount,
                            { color: typeInfo.color },
                          ]}
                        >
                          {isGider ? "+" : "-"}
                          {formatCurrency(islem.amount)}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => onDeleteIslem(islem)}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* İzin Hareketleri Tab */}
        {activeTab === "izin" && (
          <ScrollView style={styles.content}>
            {/* İzin özeti */}
            <View style={styles.izinSummaryCard}>
              <View style={styles.izinSummaryRow}>
                <View style={styles.izinSummaryItem}>
                  <Text style={styles.izinSummaryValue}>{toplamHak}</Text>
                  <Text style={styles.izinSummaryLabel}>Toplam Hak</Text>
                </View>
                <View style={styles.izinSummaryItem}>
                  <Text style={[styles.izinSummaryValue, { color: "#ef4444" }]}>
                    {kullanilanIzin}
                  </Text>
                  <Text style={styles.izinSummaryLabel}>Kullanılan</Text>
                </View>
                <View style={styles.izinSummaryItem}>
                  <Text
                    style={[
                      styles.izinSummaryValue,
                      { color: kalanIzin >= 0 ? "#10b981" : "#ef4444" },
                    ]}
                  >
                    {kalanIzin}
                  </Text>
                  <Text style={styles.izinSummaryLabel}>Kalan</Text>
                </View>
              </View>
            </View>

            {/* İzin listesi */}
            <Text style={styles.sectionTitle}>
              İzin Geçmişi ({filteredIzinler.length})
            </Text>

            {filteredIzinler.length === 0 ? (
              <View style={styles.emptyContainer}>
                <CalendarDays size={40} color="#d1d5db" />
                <Text style={styles.emptyText}>Henüz izin kaydı yok</Text>
              </View>
            ) : (
              filteredIzinler.map((izin) => (
                <View key={izin.id} style={styles.izinItem}>
                  <View style={styles.izinItemLeft}>
                    <View
                      style={[
                        styles.izinBadge,
                        {
                          backgroundColor:
                            izin.days > 0 ? "#dcfce7" : "#fef3c7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.izinBadgeText,
                          { color: izin.days > 0 ? "#10b981" : "#f59e0b" },
                        ]}
                      >
                        {izin.days > 0 ? `+${izin.days}` : izin.days} gün
                      </Text>
                    </View>
                    <View style={styles.izinInfo}>
                      <Text style={styles.izinType}>
                        {
                          izinTypeLabels[
                            izin.type as keyof typeof izinTypeLabels
                          ]
                        }
                      </Text>
                      <Text style={styles.izinDate}>
                        {formatDate(izin.start_date)}
                      </Text>
                      {izin.description && (
                        <Text style={styles.izinDesc} numberOfLines={1}>
                          {izin.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDeleteIzin(izin)}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Menu Modal */}
        <PersonelMenuModal
          visible={showMenuModal}
          personel={personel}
          onClose={() => setShowMenuModal(false)}
          onUpdateName={async (name) => {
            const success = await onUpdateName(name);
            if (success) setShowMenuModal(false);
            return success;
          }}
          onArchive={async () => {
            setShowMenuModal(false);
            const success = await onArchive();
            if (success) onClose();
            return success;
          }}
          onDelete={async () => {
            setShowMenuModal(false);
            const success = await onDelete();
            if (success) onClose();
            return success;
          }}
          onToggleIncludeInReports={async () => {
            setShowMenuModal(false);
            return onToggleIncludeInReports();
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  excludedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef3c7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  excludedBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#f59e0b",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActiveHesap: {
    backgroundColor: "#3b82f6",
  },
  tabActiveIzin: {
    backgroundColor: "#8b5cf6",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  islemItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  islemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  islemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  islemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  islemType: {
    fontSize: 13,
    fontWeight: "700",
  },
  islemDesc: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },
  islemKasa: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  islemRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  islemAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  izinSummaryCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  izinSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  izinSummaryItem: {
    alignItems: "center",
  },
  izinSummaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0369a1",
  },
  izinSummaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  izinItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  izinItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  izinBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  izinBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  izinInfo: {
    flex: 1,
  },
  izinType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  izinDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  izinDesc: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
});
