/**
 * IslemEditModal Component
 * İşlem düzenleme modalı
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Package } from "lucide-react-native";
import DatePickerField from "../../../../components/DatePickerField";
import { formatCurrency } from "../../../../shared/utils";
import { styles } from "./styles";
import { IslemEditModalProps, IslemKalemi } from "./types";

export const IslemEditModal: React.FC<IslemEditModalProps> = ({
  visible,
  islem,
  kalemler: initialKalemler,
  onClose,
  onSave,
  saving,
}) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [editKalemler, setEditKalemler] = useState<IslemKalemi[]>([]);

  useEffect(() => {
    if (visible && islem) {
      setAmount(String(islem.amount));
      setDate(islem.date);
      setDescription(islem.description || "");
      setEditKalemler([...initialKalemler]);
    }
  }, [visible, islem, initialKalemler]);

  const isKalemliFatura = editKalemler.length > 0;

  const updateKalem = (index: number, field: string, value: string) => {
    const updated = [...editKalemler];
    const kalem = updated[index];

    if (field === "quantity") {
      kalem.quantity = parseFloat(value) || 0;
    } else if (field === "unit_price") {
      kalem.unit_price = parseFloat(value) || 0;
    }

    const subtotal = kalem.quantity * kalem.unit_price;
    const kdv = subtotal * (kalem.kdv_rate / 100);
    kalem.total_price = subtotal + kdv;

    setEditKalemler(updated);
  };

  const handleSave = () => {
    let finalAmount: number;
    if (isKalemliFatura) {
      finalAmount = editKalemler.reduce((sum, k) => sum + k.total_price, 0);
    } else {
      finalAmount = parseFloat(amount) || 0;
    }

    onSave({
      amount: finalAmount,
      date,
      description,
      kalemler: editKalemler,
    });
  };

  if (!islem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.editContainer} edges={["top"]}>
        {/* Header */}
        <View style={styles.editHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.editHeaderTitle}>İşlemi Düzenle</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.editContent}>
          {/* Tutar */}
          {!isKalemliFatura && (
            <View style={styles.editSection}>
              <Text style={styles.editLabel}>Tutar</Text>
              <TextInput
                style={styles.editAmountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}

          {/* Tarih */}
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Tarih</Text>
            <DatePickerField value={date} onChange={setDate} />
          </View>

          {/* Açıklama */}
          <View style={styles.editSection}>
            <Text style={styles.editLabel}>Açıklama</Text>
            <TextInput
              style={styles.editDescInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Açıklama (opsiyonel)"
              placeholderTextColor="#9ca3af"
              multiline
            />
          </View>

          {/* Kalemler (varsa) */}
          {isKalemliFatura && (
            <View style={styles.editSection}>
              <View style={styles.kalemlerHeader}>
                <Package size={18} color="#374151" />
                <Text style={styles.kalemlerTitle}>
                  Fatura Kalemleri ({editKalemler.length})
                </Text>
              </View>

              {editKalemler.map((kalem, index) => (
                <View key={kalem.id} style={styles.kalemEditItem}>
                  <View style={styles.kalemEditHeader}>
                    <Text style={styles.kalemNo}>{index + 1}.</Text>
                    <Text style={styles.kalemAdi}>{kalem.urun_adi}</Text>
                  </View>
                  <View style={styles.kalemEditInputRow}>
                    <View style={styles.kalemEditInputGroup}>
                      <Text style={styles.kalemEditInputLabel}>Miktar</Text>
                      <TextInput
                        style={styles.kalemEditInput}
                        value={String(kalem.quantity)}
                        onChangeText={(v) => updateKalem(index, "quantity", v)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={styles.kalemEditInputGroup}>
                      <Text style={styles.kalemEditInputLabel}>
                        Birim Fiyat
                      </Text>
                      <TextInput
                        style={styles.kalemEditInput}
                        value={String(kalem.unit_price)}
                        onChangeText={(v) =>
                          updateKalem(index, "unit_price", v)
                        }
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <Text style={styles.kalemEditTotal}>
                    {formatCurrency(kalem.total_price)}
                  </Text>
                </View>
              ))}

              <View style={styles.kalemlerTotal}>
                <Text style={styles.kalemlerTotalLabel}>Toplam</Text>
                <Text style={styles.kalemlerTotalValue}>
                  {formatCurrency(
                    editKalemler.reduce((sum, k) => sum + k.total_price, 0)
                  )}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
