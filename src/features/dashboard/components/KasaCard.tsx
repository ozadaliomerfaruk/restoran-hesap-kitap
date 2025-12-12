/**
 * Kasa Card - Tek bir kasa kartı
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Info,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  AlertTriangle,
  ShoppingCart,
  Banknote,
} from "lucide-react-native";
import { colors, spacing, borderRadius } from "@/shared/constants";
import { formatCurrency } from "@/shared/utils";
import { Kasa } from "@/types";
import { kasaTypeConfig, IslemTipi } from "../constants";

interface KasaCardProps {
  kasa: Kasa;
  isExpanded: boolean;
  activeIslemTipi: IslemTipi | null;
  onToggleExpand: () => void;
  onSelectIslemTipi: (tipi: IslemTipi) => void;
  onKrediKartiHarcama: () => void;
  onKrediKartiBorcOde: () => void;
  hasOtherKasalar: boolean;
  children?: React.ReactNode; // İşlem formu için
}

export function KasaCard({
  kasa,
  isExpanded,
  activeIslemTipi,
  onToggleExpand,
  onSelectIslemTipi,
  onKrediKartiHarcama,
  onKrediKartiBorcOde,
  hasOtherKasalar,
  children,
}: KasaCardProps) {
  const router = useRouter();
  const config = kasaTypeConfig[kasa.type] || kasaTypeConfig.nakit;
  const IconComponent = config.icon;
  const isKrediKarti = kasa.type === "kredi_karti";
  const odemeBilgisi = getKrediKartiOdemeBilgisi(kasa);

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onToggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View style={[styles.icon, { backgroundColor: config.bgColor }]}>
            <IconComponent size={20} color={config.color} />
          </View>
          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{kasa.name}</Text>
              {odemeBilgisi && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        odemeBilgisi.type === "danger" ? "#fef2f2" : "#fffbeb",
                    },
                  ]}
                >
                  <AlertTriangle
                    size={10}
                    color={
                      odemeBilgisi.type === "danger" ? "#ef4444" : "#f59e0b"
                    }
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          odemeBilgisi.type === "danger"
                            ? "#ef4444"
                            : "#f59e0b",
                      },
                    ]}
                  >
                    {odemeBilgisi.text}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.type}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text
            style={[
              styles.balance,
              isKrediKarti && kasa.balance > 0 && styles.negative,
              !isKrediKarti && kasa.balance < 0 && styles.negative,
            ]}
          >
            {formatCurrency(isKrediKarti ? -kasa.balance : kasa.balance)}
          </Text>
          {isExpanded ? (
            <ChevronUp size={18} color="#9ca3af" />
          ) : (
            <ChevronDown size={18} color="#9ca3af" />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.expanded}>
          {/* Kredi Kartı Özet */}
          {isKrediKarti && kasa.credit_limit && (
            <View style={styles.krediOzet}>
              <View style={styles.krediOzetRow}>
                <View style={styles.krediOzetItem}>
                  <Text style={styles.krediOzetLabel}>Limit</Text>
                  <Text style={styles.krediOzetValue}>
                    {formatCurrency(kasa.credit_limit)}
                  </Text>
                </View>
                <View style={styles.krediOzetDivider} />
                <View style={styles.krediOzetItem}>
                  <Text style={styles.krediOzetLabel}>Kullanılan</Text>
                  <Text style={[styles.krediOzetValue, { color: "#ef4444" }]}>
                    {formatCurrency(kasa.balance)}
                  </Text>
                </View>
                <View style={styles.krediOzetDivider} />
                <View style={styles.krediOzetItem}>
                  <Text style={styles.krediOzetLabel}>Kalan</Text>
                  <Text style={[styles.krediOzetValue, { color: "#10b981" }]}>
                    {formatCurrency(kasa.credit_limit - kasa.balance)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Detay Butonu */}
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => router.push(`/kasadetay?id=${kasa.id}`)}
          >
            <Info size={18} color="#6b7280" />
            <Text style={styles.historyBtnText}>Hesap Detaylarını Gör</Text>
            <ChevronRight size={18} color="#9ca3af" />
          </TouchableOpacity>

          {/* İşlem Butonları */}
          {isKrediKarti ? (
            <>
              <View style={styles.islemRow}>
                <IslemButton
                  icon={ShoppingCart}
                  label="Harcama"
                  color="#f59e0b"
                  onPress={onKrediKartiHarcama}
                />
                <IslemButton
                  icon={ArrowUpRight}
                  label="Ödeme"
                  color="#3b82f6"
                  isActive={activeIslemTipi === "odeme"}
                  onPress={() => onSelectIslemTipi("odeme")}
                />
              </View>
              <View style={styles.islemRow}>
                <IslemButton
                  icon={Banknote}
                  label="Borç Öde"
                  color="#10b981"
                  onPress={onKrediKartiBorcOde}
                />
                {hasOtherKasalar && (
                  <IslemButton
                    icon={ArrowRightLeft}
                    label="Transfer"
                    color="#8b5cf6"
                    isActive={activeIslemTipi === "transfer"}
                    onPress={() => onSelectIslemTipi("transfer")}
                  />
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.islemRow}>
                <IslemButton
                  icon={ArrowDownLeft}
                  label="Gelir"
                  color="#10b981"
                  isActive={activeIslemTipi === "gelir"}
                  onPress={() => onSelectIslemTipi("gelir")}
                />
                <IslemButton
                  icon={ArrowUpRight}
                  label="Gider"
                  color="#ef4444"
                  isActive={activeIslemTipi === "gider"}
                  onPress={() => onSelectIslemTipi("gider")}
                />
                <IslemButton
                  icon={ArrowUpRight}
                  label="Ödeme"
                  color="#3b82f6"
                  isActive={activeIslemTipi === "odeme"}
                  onPress={() => onSelectIslemTipi("odeme")}
                />
              </View>
              <View style={styles.islemRow}>
                <IslemButton
                  icon={ArrowDownLeft}
                  label="Tahsilat"
                  color="#8b5cf6"
                  isActive={activeIslemTipi === "tahsilat"}
                  onPress={() => onSelectIslemTipi("tahsilat")}
                />
                {hasOtherKasalar && (
                  <IslemButton
                    icon={ArrowRightLeft}
                    label="Transfer"
                    color="#f59e0b"
                    isActive={activeIslemTipi === "transfer"}
                    onPress={() => onSelectIslemTipi("transfer")}
                  />
                )}
              </View>
            </>
          )}

          {/* İşlem Formu (children) */}
          {children}
        </View>
      )}
    </View>
  );
}

// İşlem Butonu Alt Component
interface IslemButtonProps {
  icon: any;
  label: string;
  color: string;
  isActive?: boolean;
  onPress: () => void;
}

function IslemButton({
  icon: Icon,
  label,
  color,
  isActive,
  onPress,
}: IslemButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.islemBtn,
        isActive && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
    >
      <Icon size={16} color={isActive ? "#fff" : color} />
      <Text style={[styles.islemBtnText, { color: isActive ? "#fff" : color }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Yardımcı fonksiyon
function getKrediKartiOdemeBilgisi(kasa: Kasa) {
  if (kasa.type !== "kredi_karti" || !kasa.due_day) return null;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let dueDate = new Date(currentYear, currentMonth, kasa.due_day);
  if (dueDate < today) {
    dueDate = new Date(currentYear, currentMonth + 1, kasa.due_day);
  }

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (kasa.balance <= 0) return null;

  if (diffDays <= 0) {
    return { type: "danger" as const, text: "Bugün son gün!", days: 0 };
  } else if (diffDays <= 3) {
    return {
      type: "danger" as const,
      text: `${diffDays} gün kaldı`,
      days: diffDays,
    };
  } else if (diffDays <= 7) {
    return {
      type: "warning" as const,
      text: `${diffDays} gün kaldı`,
      days: diffDays,
    };
  }
  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  type: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balance: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  negative: {
    color: "#ef4444",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  expanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  krediOzet: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  krediOzetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  krediOzetItem: {
    flex: 1,
    alignItems: "center",
  },
  krediOzetDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e5e7eb",
  },
  krediOzetLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  krediOzetValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
  },
  historyBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  islemRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  islemBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  islemBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default KasaCard;
