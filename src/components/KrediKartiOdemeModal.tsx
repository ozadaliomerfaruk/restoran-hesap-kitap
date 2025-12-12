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
  CreditCard,
  Calendar,
  Wallet,
  Building2,
  ChevronDown,
  Check,
  Info,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useStore } from "../store/useStore";
import { Kasa } from "../types";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../shared/utils";
interface KrediKartiOdemeModalProps {
  visible: boolean;
  onClose: () => void;
  kasa: Kasa; // Kredi kartı kasası
  onSuccess?: () => void;
}

const kasaIcons: Record<string, any> = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
};

export default function KrediKartiOdemeModal({
  visible,
  onClose,
  kasa,
  onSuccess,
}: KrediKartiOdemeModalProps) {
  const { profile, kasalar, fetchKasalar } = useStore();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sourceKasaId, setSourceKasaId] = useState("");
  const [showKasaPicker, setShowKasaPicker] = useState(false);

  // Ödeme yapılabilecek kasalar (nakit ve banka, kredi kartı hariç)
  const availableKasalar = kasalar.filter(
    (k) =>
      (k.type === "nakit" || k.type === "banka") &&
      !k.is_archived &&
      k.is_active
  );

  useEffect(() => {
    if (visible && availableKasalar.length > 0 && !sourceKasaId) {
      // Varsayılan olarak ilk uygun kasayı seç
      setSourceKasaId(availableKasalar[0].id);
    }
  }, [visible, availableKasalar]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setSourceKasaId(availableKasalar.length > 0 ? availableKasalar[0].id : "");
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    if (!sourceKasaId) {
      Alert.alert("Hata", "Ödeme yapılacak kasayı seçin");
      return;
    }

    const odemeTutari = parseFloat(amount);
    const sourceKasa = kasalar.find((k) => k.id === sourceKasaId);

    if (!sourceKasa) {
      Alert.alert("Hata", "Kaynak kasa bulunamadı");
      return;
    }

    if (odemeTutari > sourceKasa.balance) {
      Alert.alert(
        "Yetersiz Bakiye",
        `${sourceKasa.name} bakiyesi: ${formatCurrency(
          sourceKasa.balance
        )}\nÖdeme tutarı: ${formatCurrency(odemeTutari)}`
      );
      return;
    }

    if (odemeTutari > kasa.balance) {
      Alert.alert(
        "Uyarı",
        `Kredi kartı borcu: ${formatCurrency(
          kasa.balance
        )}\nÖdeme tutarı borcunuzdan fazla. Devam etmek istiyor musunuz?`,
        [
          { text: "İptal", style: "cancel" },
          { text: "Devam Et", onPress: () => processPayment(odemeTutari) },
        ]
      );
      return;
    }

    await processPayment(odemeTutari);
  };

  const processPayment = async (odemeTutari: number) => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      const sourceKasa = kasalar.find((k) => k.id === sourceKasaId);

      // İşlem kaydı (transfer olarak - kredi kartı ödemesi)
      const { error: islemError } = await supabase.from("islemler").insert({
        type: "kredi_karti_odeme",
        amount: odemeTutari,
        description: description || `${kasa.name} kredi kartı ödemesi`,
        date,
        kasa_id: sourceKasaId, // Paranın çıktığı kasa
        kasa_hedef_id: kasa.id, // Kredi kartı
        restaurant_id: profile?.restaurant_id,
        created_by: user.id,
      });

      if (islemError) throw islemError;

      // Kaynak kasadan para çık
      await supabase.rpc("update_kasa_balance", {
        kasa_id: sourceKasaId,
        amount: -odemeTutari,
      });

      // Kredi kartı borcunu azalt
      await supabase.rpc("update_kasa_balance", {
        kasa_id: kasa.id,
        amount: -odemeTutari,
      });

      Alert.alert("Başarılı", `${formatCurrency(odemeTutari)} ödeme yapıldı`);
      fetchKasalar();
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      Alert.alert("Hata", error.message || "Ödeme yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  const selectedSourceKasa = kasalar.find((k) => k.id === sourceKasaId);

  // Hızlı tutar butonları
  const quickAmounts = [
    { label: "Tamamı", value: kasa.balance },
    { label: "Asgari", value: Math.max(kasa.balance * 0.2, 100) }, // %20 veya min 100
    { label: "Yarısı", value: kasa.balance / 2 },
  ];

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
          <Text style={styles.title}>Kart Borcu Öde</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Ödeniyor..." : "Öde"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Kart Bilgisi */}
          <View style={styles.cardInfo}>
            <View style={styles.cardInfoLeft}>
              <CreditCard size={20} color="#ef4444" />
              <Text style={styles.cardName}>{kasa.name}</Text>
            </View>
            <View style={styles.cardInfoRight}>
              <Text style={styles.cardDebtLabel}>Güncel Borç</Text>
              <Text style={styles.cardDebtValue}>
                {formatCurrency(kasa.balance)}
              </Text>
            </View>
          </View>

          {/* Bilgi Kutusu */}
          <View style={styles.infoBox}>
            <Info size={18} color="#3b82f6" />
            <Text style={styles.infoText}>
              Kredi kartı borcu ödemesi gider olarak kaydedilmez. Sadece
              nakit/banka bakiyeniz azalır ve kart borcunuz kapanır.
            </Text>
          </View>

          {/* Kaynak Kasa Seçimi */}
          <Text style={styles.label}>Ödeme Yapılacak Kasa *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowKasaPicker(true)}
          >
            {selectedSourceKasa ? (
              <View style={styles.selectedKasa}>
                <View
                  style={[
                    styles.kasaIcon,
                    {
                      backgroundColor:
                        kasaIcons[selectedSourceKasa.type]?.bgColor ||
                        "#f3f4f6",
                    },
                  ]}
                >
                  {selectedSourceKasa.type === "nakit" ? (
                    <Wallet size={18} color={kasaIcons.nakit.color} />
                  ) : (
                    <Building2 size={18} color={kasaIcons.banka.color} />
                  )}
                </View>
                <View style={styles.selectedKasaInfo}>
                  <Text style={styles.selectedKasaName}>
                    {selectedSourceKasa.name}
                  </Text>
                  <Text style={styles.selectedKasaBalance}>
                    Bakiye: {formatCurrency(selectedSourceKasa.balance)}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.selectPlaceholder}>Kasa seçin</Text>
            )}
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Tutar */}
          <Text style={styles.label}>Ödeme Tutarı *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          {/* Hızlı Tutar Butonları */}
          {kasa.balance > 0 && (
            <View style={styles.quickAmounts}>
              {quickAmounts.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAmountBtn}
                  onPress={() => setAmount(Math.round(item.value).toString())}
                >
                  <Text style={styles.quickAmountLabel}>{item.label}</Text>
                  <Text style={styles.quickAmountValue}>
                    {formatCurrency(item.value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tarih */}
          <Text style={styles.label}>Tarih</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#6b7280" />
            <Text style={styles.dateText}>
              {new Date(date).toLocaleDateString("tr-TR")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDate(selectedDate.toISOString().split("T")[0]);
                }
              }}
            />
          )}

          {/* Açıklama */}
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Açıklama ekleyin (opsiyonel)"
            placeholderTextColor="#9ca3af"
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Kasa Picker Modal */}
      <Modal visible={showKasaPicker} animationType="slide">
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Kasa Seç</Text>
            <TouchableOpacity onPress={() => setShowKasaPicker(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {availableKasalar.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Ödeme yapılabilecek kasa bulunamadı
                </Text>
              </View>
            ) : (
              availableKasalar.map((k) => {
                const iconConfig = kasaIcons[k.type] || kasaIcons.nakit;
                const IconComponent = iconConfig.icon;
                return (
                  <TouchableOpacity
                    key={k.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSourceKasaId(k.id);
                      setShowKasaPicker(false);
                    }}
                  >
                    <View style={styles.pickerItemLeft}>
                      <View
                        style={[
                          styles.pickerKasaIcon,
                          { backgroundColor: iconConfig.bgColor },
                        ]}
                      >
                        <IconComponent size={20} color={iconConfig.color} />
                      </View>
                      <View>
                        <Text style={styles.pickerItemText}>{k.name}</Text>
                        <Text style={styles.pickerItemSubtext}>
                          Bakiye: {formatCurrency(k.balance)}
                        </Text>
                      </View>
                    </View>
                    {sourceKasaId === k.id && (
                      <Check size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>
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
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  cardInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#991b1b",
  },
  cardInfoRight: {
    alignItems: "flex-end",
  },
  cardDebtLabel: {
    fontSize: 11,
    color: "#991b1b",
  },
  cardDebtValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#dc2626",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: "#9ca3af",
  },
  selectedKasa: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  kasaIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedKasaInfo: {
    flex: 1,
  },
  selectedKasaName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  selectedKasaBalance: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 14,
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  quickAmountBtn: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickAmountLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 2,
  },
  quickAmountValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  dateText: {
    fontSize: 15,
    color: "#111827",
  },
  descInput: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
  },
  // Picker styles
  pickerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pickerKasaIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  pickerItemSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
  },
});
