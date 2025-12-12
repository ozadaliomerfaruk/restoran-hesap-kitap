/**
 * CariIslemList Component
 * Cariye ait işlem listesi
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  FileText,
  Tag,
  ChevronRight,
  ShoppingCart,
  RotateCcw,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { formatCurrency, formatDate } from "../../../../shared/utils";
import { styles } from "./styles";
import { CariIslemListProps } from "./types";
import { getIslemColor, getIslemLabel, getDateKey } from "./constants";

export const CariIslemList: React.FC<CariIslemListProps> = ({
  islemler,
  onIslemPress,
}) => {
  const formatDateHeader = (dateStr: string) => formatDate(dateStr, "full");

  const getIslemIcon = (type: string) => {
    switch (type) {
      case "gider":
        return <ShoppingCart size={16} color="#ef4444" />;
      case "gelir":
        return <RotateCcw size={16} color="#f59e0b" />;
      case "odeme":
        return <ArrowUpRight size={16} color="#3b82f6" />;
      case "tahsilat":
        return <ArrowDownLeft size={16} color="#10b981" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.islemlerSection}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <FileText size={20} color="#374151" />
          <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>
        </View>
        <Text style={styles.islemCount}>{islemler.length} işlem</Text>
      </View>

      {islemler.length > 0 ? (
        islemler.map((islem, index) => {
          const prevIslem = index > 0 ? islemler[index - 1] : null;
          const showDateHeader =
            !prevIslem || getDateKey(prevIslem.date) !== getDateKey(islem.date);

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

              <TouchableOpacity
                style={styles.islemItem}
                onPress={() => onIslemPress(islem)}
                activeOpacity={0.7}
              >
                <View style={styles.islemLeft}>
                  <View
                    style={[
                      styles.islemIconBox,
                      { backgroundColor: `${getIslemColor(islem.type)}15` },
                    ]}
                  >
                    {getIslemIcon(islem.type)}
                  </View>
                  <View style={styles.islemInfo}>
                    <Text
                      style={[
                        styles.islemType,
                        { color: getIslemColor(islem.type) },
                      ]}
                    >
                      {getIslemLabel(islem.type)}
                    </Text>
                    {islem.description && (
                      <Text style={styles.islemDesc} numberOfLines={1}>
                        {islem.description}
                      </Text>
                    )}
                    {islem.kategori && (
                      <View style={styles.islemKategori}>
                        <Tag size={10} color="#8b5cf6" />
                        <Text style={styles.islemKategoriText}>
                          {islem.kategori.name}
                        </Text>
                      </View>
                    )}
                    {islem.kasa && (
                      <Text style={styles.islemKasa}>
                        {islem.type === "odeme" || islem.type === "gider"
                          ? "← "
                          : "→ "}
                        {islem.kasa.name}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.islemRight}>
                  <Text
                    style={[
                      styles.islemAmount,
                      { color: getIslemColor(islem.type) },
                    ]}
                  >
                    {islem.type === "gider" || islem.type === "odeme"
                      ? "-"
                      : "+"}
                    {formatCurrency(islem.amount)}
                  </Text>
                  <ChevronRight size={16} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz işlem yok</Text>
        </View>
      )}
    </View>
  );
};
