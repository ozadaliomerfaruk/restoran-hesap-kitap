import { useState } from "react";
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
import { X } from "lucide-react-native";
import { useStore } from "../store/useStore";

interface AddPersonelModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddPersonelModal({
  visible,
  onClose,
}: AddPersonelModalProps) {
  const { addPersonel } = useStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const resetForm = () => {
    setName("");
    setPhone("");
    setPosition("");
    setSalary("");
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Personel adı gerekli");
      return;
    }

    if (!position.trim()) {
      Alert.alert("Hata", "Pozisyon gerekli");
      return;
    }

    if (!salary || parseFloat(salary) < 0) {
      Alert.alert("Hata", "Geçerli bir maaş girin");
      return;
    }

    setLoading(true);
    const { error } = await addPersonel({
      name: name.trim(),
      phone: phone.trim() || undefined,
      position: position.trim(),
      salary: parseFloat(salary),
      start_date: startDate,
      is_archived: false,
      restaurant_id: "",
    });
    setLoading(false);

    if (error) {
      Alert.alert("Hata", "Personel eklenirken bir hata oluştu");
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
          <Text style={styles.title}>Yeni Personel</Text>
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
          <Text style={styles.label}>Ad Soyad *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Personel adı"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Pozisyon *</Text>
          <TextInput
            style={styles.input}
            value={position}
            onChangeText={setPosition}
            placeholder="Örn: Garson, Aşçı, Kasiyer"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="05XX XXX XX XX"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Maaş *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.amountInput}
              value={salary}
              onChangeText={setSalary}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.label}>İşe Başlama Tarihi</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
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
    backgroundColor: "#3b82f6",
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
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 19,
    color: "#111827",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    paddingVertical: 14,
  },
  bottomPadding: {
    height: 40,
  },
});
