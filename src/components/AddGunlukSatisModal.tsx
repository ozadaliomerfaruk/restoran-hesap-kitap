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
import { X, Wallet, CreditCard, Smartphone, Users } from "lucide-react-native";
import { useStore } from "../store/useStore";

interface AddGunlukSatisModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddGunlukSatisModal({
  visible,
  onClose,
}: AddGunlukSatisModalProps) {
  const { addGunlukSatis, gunlukSatislar } = useStore();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");
  const [customerCount, setCustomerCount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (visible) {
      // Bugün için zaten kayıt var mı kontrol et
      const today = new Date().toISOString().split("T")[0];
      const existing = gunlukSatislar.find((s) => s.date === today);
      if (existing) {
        setCashAmount(existing.cash_amount?.toString() || "");
        setCardAmount(existing.card_amount?.toString() || "");
        setOnlineAmount(existing.online_amount?.toString() || "");
        setCustomerCount(existing.customer_count?.toString() || "");
        setDescription(existing.description || "");
      }
    }
  }, [visible]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setCashAmount("");
    setCardAmount("");
    setOnlineAmount("");
    setCustomerCount("");
    setDescription("");
  };

  const calculateTotal = () => {
    return (
      (parseFloat(cashAmount) || 0) +
      (parseFloat(cardAmount) || 0) +
      (parseFloat(onlineAmount) || 0)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  const handleSubmit = async () => {
    const total = calculateTotal();
    if (total <= 0) {
      Alert.alert("Hata", "En az bir satış tutarı girin");
      return;
    }

    setLoading(true);
    const { error } = await addGunlukSatis({
      date,
      cash_amount: parseFloat(cashAmount) || 0,
      card_amount: parseFloat(cardAmount) || 0,
      online_amount: parseFloat(onlineAmount) || 0,
      total_amount: total,
      customer_count: customerCount ? parseInt(customerCount) : undefined,
      description: description.trim() || undefined,
      restaurant_id: "",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Satış kaydedilirken bir hata oluştu");
    } else {
      resetForm();
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
          <Text style={styles.title}>Günlük Satış</Text>
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
          {/* Tarih */}
          <Text style={styles.label}>Tarih</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />

          {/* Toplam Özet */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Toplam Satış</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(calculateTotal())}
            </Text>
          </View>

          {/* Satış Kanalları */}
          <View style={styles.sectionHeader}>
            <Wallet size={18} color="#10b981" />
            <Text style={styles.sectionTitle}>Satış Kanalları</Text>
          </View>

          {/* Nakit Satış */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <View style={[styles.iconBadge, { backgroundColor: "#dcfce7" }]}>
                <Wallet size={16} color="#10b981" />
              </View>
              <Text style={styles.inputLabel}>Nakit Satış</Text>
            </View>
            <View style={styles.amountInput}>
              <Text style={styles.currencySmall}>₺</Text>
              <TextInput
                style={styles.amountField}
                value={cashAmount}
                onChangeText={setCashAmount}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Kredi Kartı Satış */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <View style={[styles.iconBadge, { backgroundColor: "#dbeafe" }]}>
                <CreditCard size={16} color="#3b82f6" />
              </View>
              <Text style={styles.inputLabel}>Kredi Kartı Satış</Text>
            </View>
            <View style={styles.amountInput}>
              <Text style={styles.currencySmall}>₺</Text>
              <TextInput
                style={styles.amountField}
                value={cardAmount}
                onChangeText={setCardAmount}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Online Satış */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <View style={[styles.iconBadge, { backgroundColor: "#fef3c7" }]}>
                <Smartphone size={16} color="#f59e0b" />
              </View>
              <Text style={styles.inputLabel}>
                Online Satış (Yemeksepeti, Getir vb.)
              </Text>
            </View>
            <View style={styles.amountInput}>
              <Text style={styles.currencySmall}>₺</Text>
              <TextInput
                style={styles.amountField}
                value={onlineAmount}
                onChangeText={setOnlineAmount}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Müşteri Sayısı */}
          <View style={styles.sectionHeader}>
            <Users size={18} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>Ek Bilgiler</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Müşteri Sayısı (Opsiyonel)</Text>
            <TextInput
              style={styles.input}
              value={customerCount}
              onChangeText={setCustomerCount}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
            />
          </View>

          {/* Notlar */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notlar (Opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Günün notları..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.bottomPadding} />
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
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  saveButton: {
    backgroundColor: "#10b981",
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
    fontSize: 19,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 19,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 19,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 19,
    color: "#9ca3af",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 19,
    fontWeight: "500",
    color: "#374151",
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySmall: {
    fontSize: 20,
    fontWeight: "600",
    color: "#9ca3af",
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
    paddingLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
