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
  ChevronDown,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { CekSenetType, CekSenetDirection } from "../types";

interface AddCekSenetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddCekSenetModal({
  visible,
  onClose,
}: AddCekSenetModalProps) {
  const { addCekSenet, cariler, fetchCariler } = useStore();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<CekSenetType>("cek");
  const [direction, setDirection] = useState<CekSenetDirection>("alacak");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedCari, setSelectedCari] = useState<string>("");
  const [bankName, setBankName] = useState("");
  const [documentNo, setDocumentNo] = useState("");
  const [description, setDescription] = useState("");
  const [showCariPicker, setShowCariPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCariler();
      // Varsayılan vade tarihi: 30 gün sonra
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      setDueDate(defaultDate.toISOString().split("T")[0]);
    }
  }, [visible]);

  const resetForm = () => {
    setType("cek");
    setDirection("alacak");
    setAmount("");
    setDueDate("");
    setSelectedCari("");
    setBankName("");
    setDocumentNo("");
    setDescription("");
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    if (!dueDate) {
      Alert.alert("Hata", "Vade tarihi gerekli");
      return;
    }

    setLoading(true);
    const { error } = await addCekSenet({
      type,
      direction,
      amount: parseFloat(amount),
      due_date: dueDate,
      cari_id: selectedCari || undefined,
      bank_name: bankName.trim() || undefined,
      document_no: documentNo.trim() || undefined,
      description: description.trim() || undefined,
      status: "beklemede",
      restaurant_id: "",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Kayıt eklenirken bir hata oluştu");
    } else {
      resetForm();
      onClose();
    }
  };

  const selectedCariName =
    cariler.find((c) => c.id === selectedCari)?.name || "Cari Seç (Opsiyonel)";

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
          <Text style={styles.title}>Yeni Çek/Senet</Text>
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
          {/* Tip Seçimi */}
          <Text style={styles.label}>Tip</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "cek" && styles.typeButtonActive,
              ]}
              onPress={() => setType("cek")}
            >
              <FileText size={20} color={type === "cek" ? "#fff" : "#6366f1"} />
              <Text
                style={[
                  styles.typeText,
                  type === "cek" && styles.typeTextActive,
                ]}
              >
                Çek
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "senet" && styles.typeButtonActive,
              ]}
              onPress={() => setType("senet")}
            >
              <FileText
                size={20}
                color={type === "senet" ? "#fff" : "#6366f1"}
              />
              <Text
                style={[
                  styles.typeText,
                  type === "senet" && styles.typeTextActive,
                ]}
              >
                Senet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Yön Seçimi */}
          <Text style={styles.label}>Yön</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === "alacak" && styles.directionButtonAlacak,
              ]}
              onPress={() => setDirection("alacak")}
            >
              <ArrowDownLeft
                size={20}
                color={direction === "alacak" ? "#fff" : "#10b981"}
              />
              <Text
                style={[
                  styles.typeText,
                  direction === "alacak" && styles.typeTextActive,
                ]}
              >
                Alacak (Tahsil Edilecek)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.directionButton,
                direction === "borc" && styles.directionButtonBorc,
              ]}
              onPress={() => setDirection("borc")}
            >
              <ArrowUpRight
                size={20}
                color={direction === "borc" ? "#fff" : "#ef4444"}
              />
              <Text
                style={[
                  styles.typeText,
                  direction === "borc" && styles.typeTextActive,
                ]}
              >
                Borç (Ödenecek)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tutar */}
          <Text style={styles.label}>Tutar *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Vade Tarihi */}
          <Text style={styles.label}>Vade Tarihi *</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />

          {/* Cari Seçimi */}
          <Text style={styles.label}>Cari</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCariPicker(true)}
          >
            <Text
              style={[
                styles.pickerButtonText,
                !selectedCari && styles.pickerButtonPlaceholder,
              ]}
            >
              {selectedCariName}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Banka Adı (sadece çek için) */}
          {type === "cek" && (
            <>
              <Text style={styles.label}>Banka Adı</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="Örn: Garanti Bankası"
                placeholderTextColor="#9ca3af"
              />
            </>
          )}

          {/* Belge No */}
          <Text style={styles.label}>
            {type === "cek" ? "Çek No" : "Senet No"}
          </Text>
          <TextInput
            style={styles.input}
            value={documentNo}
            onChangeText={setDocumentNo}
            placeholder="Opsiyonel"
            placeholderTextColor="#9ca3af"
          />

          {/* Açıklama */}
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Opsiyonel açıklama"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Cari Picker */}
        <Modal visible={showCariPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowCariPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Cari Seç</Text>
              <ScrollView style={styles.pickerList}>
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    !selectedCari && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCari("");
                    setShowCariPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>Seçim Yok</Text>
                </TouchableOpacity>
                {cariler.map((cari) => (
                  <TouchableOpacity
                    key={cari.id}
                    style={[
                      styles.pickerItem,
                      selectedCari === cari.id && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedCari(cari.id);
                      setShowCariPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{cari.name}</Text>
                    <Text style={styles.pickerItemSubtext}>
                      {cari.type === "tedarikci" ? "Tedarikçi" : "Müşteri"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
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
    backgroundColor: "#6366f1",
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
    marginTop: 16,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  typeButtonActive: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  directionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  directionButtonAlacak: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  directionButtonBorc: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  typeText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#6b7280",
  },
  typeTextActive: {
    color: "#fff",
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
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 16,
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
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerButtonText: {
    fontSize: 19,
    color: "#111827",
  },
  pickerButtonPlaceholder: {
    color: "#9ca3af",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pickerList: {
    padding: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: "#eef2ff",
  },
  pickerItemText: {
    fontSize: 19,
    color: "#111827",
  },
  pickerItemSubtext: {
    fontSize: 19,
    color: "#6b7280",
  },
  bottomPadding: {
    height: 40,
  },
});
