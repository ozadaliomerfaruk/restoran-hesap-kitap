/**
 * KalemCard Component
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Trash2, Package, ChevronDown } from "lucide-react-native";
import { formatCurrency } from "../../../../shared/utils";
import { styles } from "./styles";
import { KalemCardProps } from "./types";
import { birimler, kdvOranlari, parseAmount } from "./constants";

export const KalemCard: React.FC<KalemCardProps> = ({
  kalem,
  index,
  onRemove,
  onUpdate,
  onSelectUrun,
  activeBirimKalemId,
  setActiveBirimKalemId,
  activeKdvKalemId,
  setActiveKdvKalemId,
}) => {
  const calculateTotal = (): number => {
    const qty = parseAmount(kalem.quantity) || 0;
    const price = parseAmount(kalem.unit_price) || 0;
    const kdv = parseAmount(kalem.kdv_rate) || 0;
    const subtotal = qty * price;
    return subtotal + subtotal * (kdv / 100);
  };

  return (
    <View style={styles.kalemCard}>
      {/* Header */}
      <View style={styles.kalemHeader}>
        <Text style={styles.kalemNo}>#{index + 1}</Text>
        <TouchableOpacity
          onPress={() => onRemove(kalem.id)}
          style={styles.removeKalemBtn}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Ürün Seç */}
      <TouchableOpacity
        style={styles.urunSelectBtn}
        onPress={() => onSelectUrun(kalem.id)}
      >
        <Package size={18} color={kalem.urun_adi ? "#3b82f6" : "#9ca3af"} />
        <Text
          style={[styles.urunSelectText, !kalem.urun_adi && styles.placeholder]}
        >
          {kalem.urun_adi || "Ürün Seç"}
        </Text>
        <ChevronDown size={18} color="#9ca3af" />
      </TouchableOpacity>

      {/* Miktar, Birim, Fiyat */}
      <View style={styles.kalemRow}>
        {/* Miktar */}
        <View style={styles.qtyBox}>
          <Text style={styles.kalemLabel}>Miktar</Text>
          <TextInput
            style={styles.qtyInput}
            value={kalem.quantity}
            onChangeText={(v) => onUpdate(kalem.id, "quantity", v)}
            keyboardType="decimal-pad"
            placeholder="1"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Birim */}
        <View style={styles.unitBox}>
          <Text style={styles.kalemLabel}>Birim</Text>
          <TouchableOpacity
            style={styles.unitSelectBtn}
            onPress={() =>
              setActiveBirimKalemId(
                activeBirimKalemId === kalem.id ? null : kalem.id
              )
            }
          >
            <Text style={styles.unitSelectText}>{kalem.unit}</Text>
            <ChevronDown size={14} color="#6b7280" />
          </TouchableOpacity>
          {activeBirimKalemId === kalem.id && (
            <View style={styles.birimDropdown}>
              <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                {birimler.map((b) => (
                  <TouchableOpacity
                    key={b.value}
                    style={styles.birimDropdownItem}
                    onPress={() => {
                      onUpdate(kalem.id, "unit", b.value);
                      setActiveBirimKalemId(null);
                    }}
                  >
                    <Text style={styles.birimDropdownText}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Birim Fiyat */}
        <View style={styles.priceBox}>
          <Text style={styles.kalemLabel}>B. Fiyat</Text>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencySmall}>₺</Text>
            <TextInput
              style={styles.priceInput}
              value={kalem.unit_price}
              onChangeText={(v) => onUpdate(kalem.id, "unit_price", v)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* KDV */}
        <View style={styles.kdvBox}>
          <Text style={styles.kalemLabel}>KDV</Text>
          <TouchableOpacity
            style={styles.kdvSelectBtn}
            onPress={() =>
              setActiveKdvKalemId(
                activeKdvKalemId === kalem.id ? null : kalem.id
              )
            }
          >
            <Text style={styles.kdvSelectText}>%{kalem.kdv_rate}</Text>
            <ChevronDown size={12} color="#6b7280" />
          </TouchableOpacity>
          {activeKdvKalemId === kalem.id && (
            <View style={styles.kdvDropdown}>
              {kdvOranlari.map((k) => (
                <TouchableOpacity
                  key={k.value}
                  style={styles.kdvDropdownItem}
                  onPress={() => {
                    onUpdate(kalem.id, "kdv_rate", k.value);
                    setActiveKdvKalemId(null);
                  }}
                >
                  <Text style={styles.kdvDropdownText}>{k.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Toplam */}
      <View style={styles.kalemTotalRow}>
        <Text style={styles.kalemTotalLabel}>Toplam:</Text>
        <Text style={styles.kalemTotalValue}>
          {formatCurrency(calculateTotal())}
        </Text>
      </View>
    </View>
  );
};
