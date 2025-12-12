// IzinModal Component - İzin ekleme/düşme modal

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, PlusCircle, MinusCircle } from "lucide-react-native";
import { Personel } from "../../../types";
import { IzinTipiValue, izinTypeLabels } from "../types";
import DatePickerField from "../../../components/DatePickerField";

interface IzinModalProps {
  visible: boolean;
  personel: Personel | null;
  tipiEkleDus: "ekle" | "dus";
  onClose: () => void;
  onSubmit: (data: {
    type: IzinTipiValue;
    startDate: string;
    endDate: string;
    days: string;
    description: string;
    tipiEkleDus: "ekle" | "dus";
  }) => Promise<boolean>;
}

export const IzinModal: React.FC<IzinModalProps> = ({
  visible,
  personel,
  tipiEkleDus,
  onClose,
  onSubmit,
}) => {
  const [izinType, setIzinType] = useState<IzinTipiValue>("yillik");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [days, setDays] = useState("1");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setIzinType("yillik");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate(new Date().toISOString().split("T")[0]);
      setDays("1");
      setDescription("");
    }
  }, [visible]);

  // Tarihlerden gün hesapla
  const calculateDays = (start: string, end: string) => {
    const startD = new Date(start);
    const endD = new Date(end);
    if (endD >= startD) {
      const diffTime = endD.getTime() - startD.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDays(String(diffDays));
    }
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (tipiEkleDus === "dus") {
      calculateDays(date, endDate);
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    if (tipiEkleDus === "dus") {
      calculateDays(startDate, date);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const success = await onSubmit({
      type: izinType,
      startDate,
      endDate,
      days,
      description,
      tipiEkleDus,
    });
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  if (!personel) return null;

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
          <Text style={styles.title}>
            {tipiEkleDus === "ekle" ? "İzin Hakkı Ekle" : "İzin Kullandır"} -{" "}
            {personel.name}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* İzin tipi seçimi */}
          <Text style={styles.label}>İzin Türü</Text>
          <View style={styles.typeRow}>
            {(
              ["yillik", "hastalik", "mazeret", "ucretsiz"] as IzinTipiValue[]
            ).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  izinType === type && styles.typeChipActive,
                ]}
                onPress={() => setIzinType(type)}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    izinType === type && styles.typeChipTextActive,
                  ]}
                >
                  {izinTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* İZİN EKLEME: Sadece gün sayısı ve tarih */}
          {tipiEkleDus === "ekle" ? (
            <>
              <Text style={styles.label}>Gün Sayısı</Text>
              <View style={styles.daysInputContainer}>
                <TextInput
                  style={styles.daysInput}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.daysLabel}>gün</Text>
              </View>

              <DatePickerField
                value={startDate}
                onChange={setStartDate}
                label="Ne Zaman Hakedildi?"
              />
            </>
          ) : (
            <>
              {/* İZİN DÜŞME: İki tarih alanı */}
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <DatePickerField
                    value={startDate}
                    onChange={handleStartDateChange}
                    label="İzne Çıkış Tarihi"
                  />
                </View>
                <View style={styles.dateField}>
                  <DatePickerField
                    value={endDate}
                    onChange={handleEndDateChange}
                    label="İzinden Dönüş Tarihi"
                  />
                </View>
              </View>

              {/* Manuel gün sayısı */}
              <Text style={styles.label}>Düşülecek Gün Sayısı</Text>
              <View style={styles.manualDaysContainer}>
                <TouchableOpacity
                  style={styles.dayAdjustBtn}
                  onPress={() => {
                    const current = parseInt(days) || 1;
                    if (current > 1) setDays(String(current - 1));
                  }}
                >
                  <MinusCircle size={24} color="#ef4444" />
                </TouchableOpacity>
                <View style={styles.dayInputWrapper}>
                  <TextInput
                    style={styles.manualDaysInput}
                    value={days}
                    onChangeText={(text) => {
                      const num = text.replace(/[^0-9]/g, "");
                      setDays(num);
                    }}
                    keyboardType="number-pad"
                    textAlign="center"
                    placeholder="1"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text style={styles.dayInputLabel}>gün</Text>
                </View>
                <TouchableOpacity
                  style={styles.dayAdjustBtn}
                  onPress={() => {
                    const current = parseInt(days) || 0;
                    setDays(String(current + 1));
                  }}
                >
                  <PlusCircle size={24} color="#10b981" />
                </TouchableOpacity>
              </View>
              <Text style={styles.daysHint}>
                Tarihlerden otomatik hesaplandı. İsterseniz manuel
                değiştirebilirsiniz.
              </Text>
            </>
          )}

          {/* Açıklama */}
          <Text style={[styles.label, { marginTop: 16 }]}>
            Açıklama (opsiyonel)
          </Text>
          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={setDescription}
            placeholder={
              tipiEkleDus === "ekle"
                ? "Ör: Yıllık izin hakkı..."
                : "Ör: Tatil, rapor..."
            }
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              tipiEkleDus === "ekle"
                ? styles.submitBtnEkle
                : styles.submitBtnDus,
              loading && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {tipiEkleDus === "ekle" ? (
              <PlusCircle size={20} color="#fff" />
            ) : (
              <MinusCircle size={20} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>
              {loading
                ? "Kaydediliyor..."
                : tipiEkleDus === "ekle"
                ? "İzin Hakkı Ekle"
                : "İzin Kullandır"}
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  typeChipActive: {
    backgroundColor: "#10b981",
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  typeChipTextActive: {
    color: "#fff",
  },
  daysInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  daysInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 12,
  },
  daysLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  manualDaysContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  dayAdjustBtn: {
    padding: 8,
  },
  dayInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  manualDaysInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    minWidth: 50,
  },
  dayInputLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  daysHint: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 16,
  },
  descInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    textAlignVertical: "top",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitBtnEkle: {
    backgroundColor: "#10b981",
  },
  submitBtnDus: {
    backgroundColor: "#f59e0b",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
