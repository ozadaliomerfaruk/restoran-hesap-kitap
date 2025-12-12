// UrunCard Component

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Calendar,
  Check,
  Info,
} from "lucide-react-native";
import { MenuItem } from "../../../types";
import { UrunStats } from "../types";
import { formatCurrency } from "../../../shared/utils";

interface UrunCardProps {
  item: MenuItem;
  isExpanded: boolean;
  stats: UrunStats;
  showCategory: boolean;
  satisAdet: string;
  satisFiyat: string;
  satisDate: Date;
  satisLoading: boolean;
  onToggle: () => void;
  onAdetChange: (val: string) => void;
  onFiyatChange: (val: string) => void;
  onDatePress: () => void;
  onSave: () => void;
  onDetailPress: () => void;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const UrunCard: React.FC<UrunCardProps> = ({
  item,
  isExpanded,
  stats,
  showCategory,
  satisAdet,
  satisFiyat,
  satisDate,
  satisLoading,
  onToggle,
  onAdetChange,
  onFiyatChange,
  onDatePress,
  onSave,
  onDetailPress,
}) => {
  const toplam =
    (parseInt(satisAdet) || 0) *
    (parseFloat(satisFiyat.replace(",", ".")) || 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardExpanded]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          <View style={[styles.icon, isExpanded && styles.iconExpanded]}>
            <Package size={20} color={isExpanded ? "#fff" : "#8b5cf6"} />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            {showCategory && (
              <Text style={styles.category}>{item.category}</Text>
            )}
            <Text style={styles.statsText}>
              {stats.toplamAdet} satış • {formatCurrency(stats.toplamCiro)}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <Text style={styles.unit}>{item.unit || "Adet"}</Text>
          {isExpanded ? (
            <ChevronUp size={20} color="#8b5cf6" />
          ) : (
            <ChevronDown size={20} color="#9ca3af" />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expanded}>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Tarih</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={onDatePress}>
              <Calendar size={18} color="#6b7280" />
              <Text style={styles.dateBtnText}>{formatDate(satisDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRowDouble}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Adet</Text>
              <TextInput
                style={styles.inputField}
                value={satisAdet}
                onChangeText={onAdetChange}
                keyboardType="number-pad"
                placeholder="1"
              />
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>Birim Fiyat</Text>
              <View style={styles.priceBox}>
                <Text style={styles.currency}>₺</Text>
                <TextInput
                  style={styles.priceInput}
                  value={satisFiyat}
                  onChangeText={onFiyatChange}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam:</Text>
            <Text style={styles.totalValue}>{formatCurrency(toplam)}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.detailBtn} onPress={onDetailPress}>
              <Info size={18} color="#6b7280" />
              <Text style={styles.detailBtnText}>Ürün Detayı</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, satisLoading && { opacity: 0.6 }]}
              onPress={onSave}
              disabled={satisLoading}
            >
              <Check size={18} color="#fff" />
              <Text style={styles.saveBtnText}>
                {satisLoading ? "..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
  },
  cardExpanded: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f3e8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  iconExpanded: { backgroundColor: "#8b5cf6" },
  info: { marginLeft: 12, flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#111827" },
  category: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  statsText: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  right: { alignItems: "flex-end" },
  price: { fontSize: 16, fontWeight: "700", color: "#111827" },
  unit: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  expanded: {
    backgroundColor: "#faf5ff",
    marginHorizontal: 16,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateBtnText: { fontSize: 14, color: "#374151" },
  inputRowDouble: { flexDirection: "row", gap: 12 },
  inputHalf: { flex: 1 },
  inputField: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
    marginTop: 6,
  },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  currency: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 6,
    fontSize: 16,
    color: "#111827",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e9d5ff",
  },
  totalLabel: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  totalValue: { fontSize: 20, fontWeight: "700", color: "#8b5cf6" },
  actionRow: { flexDirection: "row", gap: 12 },
  detailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 10,
  },
  detailBtnText: { fontSize: 14, fontWeight: "500", color: "#6b7280" },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#8b5cf6",
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
