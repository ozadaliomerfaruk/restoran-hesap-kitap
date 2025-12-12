// SatisGecmisiList Component - Satış geçmişi listesi

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Package, Edit3, Calendar, Trash2 } from "lucide-react-native";
import { SatisKaydi } from "../../../types";
import { formatCurrency } from "../../../shared/utils";

interface SatisGecmisiListProps {
  satislar: SatisKaydi[];
  unit: string;
  onEditSatis: (satis: SatisKaydi) => void;
  onEditDate: (satis: SatisKaydi) => void;
  onDeleteSatis: (satis: SatisKaydi) => void;
}

export const SatisGecmisiList: React.FC<SatisGecmisiListProps> = ({
  satislar,
  unit,
  onEditSatis,
  onEditDate,
  onDeleteSatis,
}) => {
  const getDateKey = (dateStr: string) => dateStr.split("T")[0];

  const formatDateHeader = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Satış Geçmişi ({satislar.length})</Text>

      {satislar.length > 0 ? (
        satislar.map((satis, index) => {
          const prevSatis = index > 0 ? satislar[index - 1] : null;
          const showDateHeader =
            !prevSatis || getDateKey(prevSatis.date) !== getDateKey(satis.date);

          return (
            <View key={satis.id}>
              {showDateHeader && (
                <View style={styles.dateSeparator}>
                  <View style={styles.dateSeparatorLine} />
                  <Text style={styles.dateSeparatorText}>
                    {formatDateHeader(satis.date)}
                  </Text>
                  <View style={styles.dateSeparatorLine} />
                </View>
              )}

              <View style={styles.satisItem}>
                <View style={styles.satisLeft}>
                  <View style={styles.satisIconBox}>
                    <Package size={16} color="#8b5cf6" />
                  </View>
                  <View style={styles.satisInfo}>
                    <Text style={styles.satisAdet}>
                      {satis.quantity} {unit || "adet"}
                    </Text>
                    <Text style={styles.satisFiyat}>
                      Birim: {formatCurrency(satis.unit_price)}
                    </Text>
                    {satis.notes && (
                      <Text style={styles.satisNotes}>{satis.notes}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.satisRight}>
                  <Text style={styles.satisToplam}>
                    {formatCurrency(satis.total_price)}
                  </Text>
                  <View style={styles.satisActions}>
                    <TouchableOpacity
                      style={styles.satisActionBtn}
                      onPress={() => onEditSatis(satis)}
                    >
                      <Edit3 size={16} color="#8b5cf6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.satisActionBtn}
                      onPress={() => onEditDate(satis)}
                    >
                      <Calendar size={16} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.satisActionBtn}
                      onPress={() => onDeleteSatis(satis)}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz satış kaydı yok</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
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
  satisItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  satisLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  satisIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  satisInfo: {
    marginLeft: 12,
    flex: 1,
  },
  satisAdet: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  satisFiyat: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  satisNotes: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
    fontStyle: "italic",
  },
  satisRight: {
    alignItems: "flex-end",
  },
  satisToplam: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8b5cf6",
  },
  satisActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  satisActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
