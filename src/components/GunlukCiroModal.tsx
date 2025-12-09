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
  TrendingUp,
  ChevronDown,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Kasa, Kategori } from "../types";
import DatePickerField from "./DatePickerField";

interface GunlukCiroModalProps {
  visible: boolean;
  onClose: () => void;
}

const kasaIcons: Record<string, any> = {
  nakit: { icon: Wallet, color: "#10b981", bgColor: "#dcfce7" },
  banka: { icon: Building2, color: "#3b82f6", bgColor: "#dbeafe" },
  kredi_karti: { icon: CreditCard, color: "#f59e0b", bgColor: "#fef3c7" },
  birikim: { icon: PiggyBank, color: "#8b5cf6", bgColor: "#ede9fe" },
};

export default function GunlukCiroModal({
  visible,
  onClose,
}: GunlukCiroModalProps) {
  const {
    kasalar,
    kategoriler,
    fetchKategoriler,
    addIslem,
    fetchKasalar,
    fetchIslemler,
  } = useStore();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [ciroValues, setCiroValues] = useState<Record<string, string>>({});
  const [ciroKategoriler, setCiroKategoriler] = useState<
    Record<string, string>
  >({});
  const [showKategoriPicker, setShowKategoriPicker] = useState<string | null>(
    null
  );
  const [description, setDescription] = useState("");

  // Sadece nakit ve banka kasalarını göster (kredi kartı hariç)
  const ciroKasalar = kasalar.filter(
    (k) => k.type === "nakit" || k.type === "banka"
  );

  // Gelir kategorileri
  const gelirKategoriler = kategoriler.filter((k) => k.type === "gelir");

  useEffect(() => {
    if (visible) {
      fetchKategoriler();
      // Her kasa için boş değer oluştur
      const initialValues: Record<string, string> = {};
      const initialKategoriler: Record<string, string> = {};
      ciroKasalar.forEach((kasa) => {
        initialValues[kasa.id] = "";
        initialKategoriler[kasa.id] = "";
      });
      setCiroValues(initialValues);
      setCiroKategoriler(initialKategoriler);
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setShowKategoriPicker(null);
    }
  }, [visible, kasalar]);

  const handleValueChange = (kasaId: string, value: string) => {
    setCiroValues((prev) => ({
      ...prev,
      [kasaId]: value,
    }));
  };

  const handleKategoriChange = (kasaId: string, kategoriId: string) => {
    setCiroKategoriler((prev) => ({
      ...prev,
      [kasaId]: kategoriId,
    }));
    setShowKategoriPicker(null);
  };

  const calculateTotal = () => {
    return Object.values(ciroValues).reduce((sum, val) => {
      return sum + (parseFloat(val) || 0);
    }, 0);
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
      Alert.alert("Hata", "En az bir kasaya ciro girin");
      return;
    }

    setLoading(true);
    let hasError = false;

    // Her kasa için ayrı gelir işlemi oluştur
    for (const kasa of ciroKasalar) {
      const amount = parseFloat(ciroValues[kasa.id]) || 0;
      if (amount > 0) {
        const kategoriId = ciroKategoriler[kasa.id] || undefined;
        const { error } = await addIslem({
          type: "gelir",
          amount,
          description: description.trim() || `Günlük ciro - ${kasa.name}`,
          date,
          kasa_id: kasa.id,
          kategori_id: kategoriId,
        });
        if (error) {
          hasError = true;
        }
      }
    }

    setLoading(false);

    if (hasError) {
      Alert.alert("Uyarı", "Bazı cirolar kaydedilirken hata oluştu");
    } else {
      Alert.alert(
        "Başarılı",
        `Toplam ${formatCurrency(total)} ciro kaydedildi`
      );
      fetchKasalar();
      fetchIslemler();
      onClose();
    }
  };

  const renderKasaInput = (kasa: Kasa) => {
    const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
    const IconComponent = iconConfig.icon;
    const selectedKategori = gelirKategoriler.find(
      (k) => k.id === ciroKategoriler[kasa.id]
    );

    return (
      <View key={kasa.id} style={styles.kasaInputCard}>
        <View style={styles.kasaHeader}>
          <View
            style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}
          >
            <IconComponent size={20} color={iconConfig.color} />
          </View>
          <View style={styles.kasaInfo}>
            <Text style={styles.kasaName}>{kasa.name}</Text>
            <Text style={styles.kasaBalance}>
              Mevcut: {formatCurrency(kasa.balance)}
            </Text>
          </View>
        </View>

        {/* Tutar Girişi */}
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>₺</Text>
          <TextInput
            style={styles.amountInput}
            value={ciroValues[kasa.id] || ""}
            onChangeText={(value) => handleValueChange(kasa.id, value)}
            placeholder="0"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Kategori Seçimi */}
        <View style={styles.kategoriContainer}>
          <TouchableOpacity
            style={styles.kategoriDropdown}
            onPress={() =>
              setShowKategoriPicker(
                showKategoriPicker === kasa.id ? null : kasa.id
              )
            }
          >
            <Text
              style={[
                styles.kategoriDropdownText,
                !selectedKategori && styles.kategoriDropdownPlaceholder,
              ]}
            >
              {selectedKategori?.name || "Kategori seç (opsiyonel)"}
            </Text>
            <ChevronDown size={18} color="#6b7280" />
          </TouchableOpacity>

          {showKategoriPicker === kasa.id && (
            <View style={styles.kategoriPickerContainer}>
              <ScrollView style={styles.kategoriPicker} nestedScrollEnabled>
                <TouchableOpacity
                  style={styles.kategoriOption}
                  onPress={() => handleKategoriChange(kasa.id, "")}
                >
                  <Text style={styles.kategoriOptionText}>Seçilmedi</Text>
                </TouchableOpacity>
                {gelirKategoriler.map((kat) => (
                  <TouchableOpacity
                    key={kat.id}
                    style={[
                      styles.kategoriOption,
                      ciroKategoriler[kasa.id] === kat.id &&
                        styles.kategoriOptionActive,
                    ]}
                    onPress={() => handleKategoriChange(kasa.id, kat.id)}
                  >
                    <Text
                      style={[
                        styles.kategoriOptionText,
                        ciroKategoriler[kasa.id] === kat.id &&
                          styles.kategoriOptionTextActive,
                      ]}
                    >
                      {kat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
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
          <Text style={styles.title}>Günlük Ciro Gir</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || calculateTotal() <= 0}
            style={[
              styles.saveButton,
              (loading || calculateTotal() <= 0) && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tarih */}
          <View style={styles.dateContainer}>
            <DatePickerField value={date} onChange={setDate} label="Tarih" />
          </View>

          {/* Toplam Özet */}
          <View style={styles.totalCard}>
            <TrendingUp size={24} color="#fff" />
            <View style={styles.totalInfo}>
              <Text style={styles.totalLabel}>Toplam Ciro</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(calculateTotal())}
              </Text>
            </View>
          </View>

          {/* Kasa Girişleri */}
          <Text style={styles.sectionTitle}>Kasalara Ciro Gir</Text>

          {ciroKasalar.length > 0 ? (
            ciroKasalar.map(renderKasaInput)
          ) : (
            <View style={styles.emptyState}>
              <Wallet size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz kasa eklenmemiş</Text>
            </View>
          )}

          {/* Açıklama */}
          <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Günün notları..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
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
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  totalInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  kasaInputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kasaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  kasaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  kasaInfo: {
    flex: 1,
  },
  kasaName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  kasaBalance: {
    fontSize: 15,
    color: "#6b7280",
    marginTop: 2,
  },
  amountInputContainer: {
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
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 14,
    paddingLeft: 8,
  },
  kategoriContainer: {
    marginTop: 12,
    zIndex: 10,
  },
  kategoriDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kategoriDropdownText: {
    fontSize: 14,
    color: "#111827",
  },
  kategoriDropdownPlaceholder: {
    color: "#9ca3af",
  },
  kategoriPickerContainer: {
    position: "relative",
    zIndex: 100,
  },
  kategoriPicker: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kategoriOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  kategoriOptionActive: {
    backgroundColor: "#dcfce7",
  },
  kategoriOptionText: {
    fontSize: 14,
    color: "#111827",
  },
  kategoriOptionTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 12,
  },
  bottomPadding: {
    height: 40,
  },
});
