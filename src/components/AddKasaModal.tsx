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
import {
  X,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  Calendar,
  Info,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { KasaType } from "../types";

interface AddKasaModalProps {
  visible: boolean;
  onClose: () => void;
}

const kasaTypes = [
  { type: "nakit" as KasaType, label: "Nakit", icon: Wallet, color: "#10b981" },
  {
    type: "banka" as KasaType,
    label: "Banka",
    icon: Building2,
    color: "#3b82f6",
  },
  {
    type: "kredi_karti" as KasaType,
    label: "Kredi Kartı",
    icon: CreditCard,
    color: "#f59e0b",
  },
  {
    type: "birikim" as KasaType,
    label: "Birikim",
    icon: PiggyBank,
    color: "#8b5cf6",
  },
];

export default function AddKasaModal({ visible, onClose }: AddKasaModalProps) {
  const { addKasa, profile } = useStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<KasaType>("nakit");
  const [currency, setCurrency] = useState<"TRY" | "USD" | "EUR">("TRY");

  // Kredi kartı için özel alanlar
  const [creditLimit, setCreditLimit] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [dueDay, setDueDay] = useState("15");
  const [currentDebt, setCurrentDebt] = useState(""); // Mevcut borç (opsiyonel)

  const isPro = profile?.plan === "pro" || profile?.plan === "premium";
  const isKrediKarti = type === "kredi_karti";

  const resetForm = () => {
    setName("");
    setType("nakit");
    setCurrency("TRY");
    setCreditLimit("");
    setBillingDay("1");
    setDueDay("15");
    setCurrentDebt("");
  };

  // Kredi kartı seçildiğinde varsayılan değerleri ayarla
  useEffect(() => {
    if (type === "kredi_karti") {
      setCurrency("TRY"); // Kredi kartı sadece TRY olabilir
    }
  }, [type]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Kasa adı zorunludur");
      return;
    }

    if (type === "birikim" && !isPro) {
      Alert.alert(
        "Pro Gerekli",
        "Birikim kasası açmak için Pro plana yükseltmeniz gerekiyor"
      );
      return;
    }

    // Kredi kartı validasyonları
    if (isKrediKarti) {
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
    }

    setLoading(true);

    const kasaData: any = {
      name: name.trim(),
      type,
      currency,
      is_active: true,
      is_archived: false,
      restaurant_id: "",
    };

    // Kredi kartı için özel alanlar
    if (isKrediKarti) {
      kasaData.credit_limit = parseFloat(creditLimit);
      kasaData.billing_day = parseInt(billingDay);
      kasaData.due_day = parseInt(dueDay);
      // Mevcut borç varsa balance olarak ekle
      if (currentDebt && parseFloat(currentDebt) > 0) {
        kasaData.balance = parseFloat(currentDebt);
      }
    }

    const { error } = await addKasa(kasaData);
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Kasa eklenirken bir hata oluştu");
    } else {
      resetForm();
      onClose();
    }
  };

  const formatCurrency = (value: string) => {
    // Sadece rakam ve nokta kabul et
    const cleaned = value.replace(/[^0-9.]/g, "");
    return cleaned;
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
          <Text style={styles.title}>Yeni Kasa Ekle</Text>
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
          {/* Kasa Tipi */}
          <Text style={styles.label}>Kasa Tipi</Text>
          <View style={styles.typeGrid}>
            {kasaTypes.map((item) => {
              const IconComponent = item.icon;
              const isDisabled = item.type === "birikim" && !isPro;
              const isSelected = type === item.type;

              return (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.typeCard,
                    isSelected && {
                      borderColor: item.color,
                      backgroundColor: `${item.color}10`,
                    },
                    isDisabled && styles.typeCardDisabled,
                  ]}
                  onPress={() => !isDisabled && setType(item.type)}
                  disabled={isDisabled}
                >
                  <View
                    style={[
                      styles.typeIcon,
                      { backgroundColor: `${item.color}20` },
                    ]}
                  >
                    <IconComponent size={24} color={item.color} />
                  </View>
                  <Text
                    style={[
                      styles.typeLabel,
                      isDisabled && styles.typeLabelDisabled,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isDisabled && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Kasa Adı */}
          <Text style={styles.label}>Kasa Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={
              isKrediKarti
                ? "Örn: Yapı Kredi, Garanti BONUS"
                : "Örn: Ana Kasa, Ziraat Bankası"
            }
            placeholderTextColor="#9ca3af"
          />

          {/* Kredi Kartı Özel Alanları */}
          {isKrediKarti && (
            <>
              {/* Bilgi Kutusu */}
              <View style={styles.infoBox}>
                <Info size={18} color="#3b82f6" />
                <Text style={styles.infoText}>
                  Kredi kartı borcu "kullanılan limit" olarak takip edilir.
                  Harcama yaptıkça borç artar, ödeme yaptıkça azalır.
                </Text>
              </View>

              {/* Kredi Limiti */}
              <Text style={styles.label}>Kredi Limiti *</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>₺</Text>
                <TextInput
                  style={styles.inputWithPrefixField}
                  value={creditLimit}
                  onChangeText={(text) => setCreditLimit(formatCurrency(text))}
                  placeholder="50000"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              {/* Mevcut Borç (Opsiyonel) */}
              <Text style={styles.label}>Mevcut Borç (Opsiyonel)</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.inputPrefix}>₺</Text>
                <TextInput
                  style={styles.inputWithPrefixField}
                  value={currentDebt}
                  onChangeText={(text) => setCurrentDebt(formatCurrency(text))}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.helperText}>
                Kartınızda mevcut borç varsa girin, yoksa boş bırakın.
              </Text>

              {/* Ekstre Kesim ve Son Ödeme Günleri */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Ekstre Kesim Günü</Text>
                  <View style={styles.dayInputContainer}>
                    <Calendar size={18} color="#6b7280" />
                    <TextInput
                      style={styles.dayInput}
                      value={billingDay}
                      onChangeText={(text) => {
                        const num = text.replace(/[^0-9]/g, "");
                        if (
                          num === "" ||
                          (parseInt(num) >= 1 && parseInt(num) <= 31)
                        ) {
                          setBillingDay(num);
                        }
                      }}
                      placeholder="1"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.dayLabel}>. gün</Text>
                  </View>
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.label}>Son Ödeme Günü</Text>
                  <View style={styles.dayInputContainer}>
                    <Calendar size={18} color="#6b7280" />
                    <TextInput
                      style={styles.dayInput}
                      value={dueDay}
                      onChangeText={(text) => {
                        const num = text.replace(/[^0-9]/g, "");
                        if (
                          num === "" ||
                          (parseInt(num) >= 1 && parseInt(num) <= 31)
                        ) {
                          setDueDay(num);
                        }
                      }}
                      placeholder="15"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.dayLabel}>. gün</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Para Birimi - Kredi kartı için gösterme */}
          {!isKrediKarti && (
            <>
              <Text style={styles.label}>Para Birimi</Text>
              <View style={styles.currencyButtons}>
                {(["TRY", "USD", "EUR"] as const).map((curr) => {
                  const isDisabled = curr !== "TRY" && !isPro;
                  return (
                    <TouchableOpacity
                      key={curr}
                      style={[
                        styles.currencyButton,
                        currency === curr && styles.currencyButtonActive,
                        isDisabled && styles.currencyButtonDisabled,
                      ]}
                      onPress={() => !isDisabled && setCurrency(curr)}
                      disabled={isDisabled}
                    >
                      <Text
                        style={[
                          styles.currencyButtonText,
                          currency === curr && styles.currencyButtonTextActive,
                          isDisabled && styles.currencyButtonTextDisabled,
                        ]}
                      >
                        {curr === "TRY"
                          ? "₺ TRY"
                          : curr === "USD"
                          ? "$ USD"
                          : "€ EUR"}
                      </Text>
                      {isDisabled && <Text style={styles.proTag}>PRO</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

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
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "47%",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeCardDisabled: {
    opacity: 0.6,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  typeLabelDisabled: {
    color: "#9ca3af",
  },
  proBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f59e0b",
  },
  currencyButtons: {
    flexDirection: "row",
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  currencyButtonActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  currencyButtonDisabled: {
    opacity: 0.6,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  currencyButtonTextActive: {
    color: "#fff",
  },
  currencyButtonTextDisabled: {
    color: "#9ca3af",
  },
  proTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f59e0b",
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
  // Kredi kartı özel stilleri
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  inputWithPrefix: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  inputWithPrefixField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    minWidth: 30,
    textAlign: "center",
  },
  dayLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
});
