import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, CreditCard, Calendar, Info } from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Kasa } from "../types";
import { formatCurrency } from "../shared/utils";

interface KrediKartiDuzenleModalProps {
  visible: boolean;
  onClose: () => void;
  kasa: Kasa;
  onSuccess?: () => void;
}

export default function KrediKartiDuzenleModal({
  visible,
  onClose,
  kasa,
  onSuccess,
}: KrediKartiDuzenleModalProps) {
  const { updateKasa } = useStore();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [billingDay, setBillingDay] = useState("");
  const [dueDay, setDueDay] = useState("");

  useEffect(() => {
    if (visible && kasa) {
      setName(kasa.name);
      setCreditLimit(kasa.credit_limit?.toString() || "");
      setBillingDay(kasa.billing_day?.toString() || "1");
      setDueDay(kasa.due_day?.toString() || "15");
    }
  }, [visible, kasa]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Kart adı zorunludur");
      return;
    }

    if (!creditLimit || parseFloat(creditLimit) <= 0) {
      Alert.alert("Hata", "Kredi limiti zorunludur ve 0'dan büyük olmalıdır");
      return;
    }

    const billing = parseInt(billingDay);
    const due = parseInt(dueDay);

    if (billing < 1 || billing > 31) {
      Alert.alert("Hata", "Ekstre kesim günü 1-31 arasında olmalıdır");
      return;
    }

    if (due < 1 || due > 31) {
      Alert.alert("Hata", "Son ödeme günü 1-31 arasında olmalıdır");
      return;
    }

    setLoading(true);

    const { error } = await updateKasa(kasa.id, {
      name: name.trim(),
      credit_limit: parseFloat(creditLimit),
      billing_day: billing,
      due_day: due,
    });

    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Kart bilgileri güncellenirken bir hata oluştu");
    } else {
      Alert.alert("Başarılı", "Kart bilgileri güncellendi");
      onSuccess?.();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Kart Bilgilerini Düzenle</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Kart Bilgisi */}
          <View style={styles.cardInfo}>
            <CreditCard size={20} color="#f59e0b" />
            <Text style={styles.cardInfoText}>Kredi Kartı Bilgileri</Text>
          </View>

          {/* Güncel Borç Bilgisi */}
          <View style={styles.currentDebtInfo}>
            <Text style={styles.currentDebtLabel}>Güncel Borç</Text>
            <Text style={styles.currentDebtValue}>
              {formatCurrency(kasa.balance)}
            </Text>
          </View>

          {/* Kart Adı */}
          <Text style={styles.label}>Kart Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: Yapı Kredi Maximum"
            placeholderTextColor="#9ca3af"
          />

          {/* Kredi Limiti */}
          <Text style={styles.label}>Kredi Limiti *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.amountInput}
              value={creditLimit}
              onChangeText={setCreditLimit}
              placeholder="50000"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          {/* Tarihler */}
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.label}>Ekstre Kesim Günü *</Text>
              <View style={styles.dayInputContainer}>
                <Calendar size={18} color="#6b7280" />
                <TextInput
                  style={styles.dayInput}
                  value={billingDay}
                  onChangeText={setBillingDay}
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dayLabel}>Her ayın</Text>
              </View>
            </View>

            <View style={styles.dateItem}>
              <Text style={styles.label}>Son Ödeme Günü *</Text>
              <View style={styles.dayInputContainer}>
                <Calendar size={18} color="#6b7280" />
                <TextInput
                  style={styles.dayInput}
                  value={dueDay}
                  onChangeText={setDueDay}
                  placeholder="15"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.dayLabel}>Her ayın</Text>
              </View>
            </View>
          </View>

          {/* Bilgi Kutusu */}
          <View style={styles.infoBox}>
            <Info size={18} color="#3b82f6" />
            <Text style={styles.infoText}>
              Son ödeme gününe 7 gün veya daha az kaldığında ana sayfada uyarı
              gösterilir.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  cardInfoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400e",
  },
  currentDebtInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  currentDebtLabel: {
    fontSize: 14,
    color: "#991b1b",
  },
  currentDebtValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#dc2626",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  dateItem: {
    flex: 1,
  },
  dayInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  dayInput: {
    width: 40,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  dayLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
});
