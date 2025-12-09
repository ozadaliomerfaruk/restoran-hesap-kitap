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
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Users,
  Check,
  Calendar,
  Edit3,
  CheckCircle,
} from "lucide-react-native";
import { useStore } from "../store/useStore";
import { Personel } from "../types";

interface HakedisModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PersonelHakedis {
  personel: Personel;
  amount: number;
  selected: boolean;
}

export default function HakedisModal({ visible, onClose }: HakedisModalProps) {
  const {
    personeller,
    fetchPersoneller,
    addPersonelIslem,
    fetchPersonelIslemler,
  } = useStore();

  const [hakedisler, setHakedisler] = useState<PersonelHakedis[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hakedisDate, setHakedisDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (visible) {
      fetchPersoneller();
      // Mevcut ayı al
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      setHakedisDate(`${year}-${month}-01`);
    }
  }, [visible]);

  useEffect(() => {
    // Personeller yüklendiğinde hakediş listesini oluştur
    const list = personeller.map((p) => ({
      personel: p,
      amount: p.salary || 0,
      selected: (p.salary || 0) > 0, // Maaşı olanları otomatik seç
    }));
    setHakedisler(list);
  }, [personeller]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getCurrentMonthName = () => {
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    const date = new Date(hakedisDate);
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const toggleSelect = (id: string) => {
    setHakedisler((prev) =>
      prev.map((h) =>
        h.personel.id === id ? { ...h, selected: !h.selected } : h
      )
    );
  };

  const selectAll = () => {
    const allSelected = hakedisler.every((h) => h.selected);
    setHakedisler((prev) =>
      prev.map((h) => ({ ...h, selected: !allSelected }))
    );
  };

  const startEdit = (id: string, currentAmount: number) => {
    setEditingId(id);
    setEditValue(currentAmount.toString());
  };

  const saveEdit = (id: string) => {
    const newAmount = parseFloat(editValue) || 0;
    setHakedisler((prev) =>
      prev.map((h) => (h.personel.id === id ? { ...h, amount: newAmount } : h))
    );
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const selectedHakedisler = hakedisler.filter(
    (h) => h.selected && h.amount > 0
  );
  const totalAmount = selectedHakedisler.reduce((sum, h) => sum + h.amount, 0);

  const handleSubmit = async () => {
    if (selectedHakedisler.length === 0) {
      Alert.alert("Uyarı", "En az bir personel seçmelisiniz");
      return;
    }

    Alert.alert(
      "Hakedişi Onayla",
      `${selectedHakedisler.length} personel için toplam ${formatCurrency(
        totalAmount
      )} tutarında maaş hakedişi kaydedilecek.\n\nDevam etmek istiyor musunuz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          onPress: async () => {
            setLoading(true);
            let successCount = 0;
            let errorCount = 0;

            for (const h of selectedHakedisler) {
              const { error } = await addPersonelIslem({
                personel_id: h.personel.id,
                type: "maas",
                amount: h.amount,
                description: `${getCurrentMonthName()} maaş hakedişi`,
                date: hakedisDate,
                restaurant_id: "",
                updated_at: new Date().toISOString(),
              });

              if (error) {
                errorCount++;
              } else {
                successCount++;
              }
            }

            setLoading(false);
            await fetchPersonelIslemler();
            await fetchPersoneller();

            if (errorCount === 0) {
              Alert.alert(
                "Başarılı",
                `${successCount} personel için maaş hakedişi kaydedildi.`,
                [{ text: "Tamam", onPress: onClose }]
              );
            } else {
              Alert.alert(
                "Kısmi Başarı",
                `${successCount} işlem başarılı, ${errorCount} işlem başarısız oldu.`
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ArrowLeft size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aylık Maaş Hakedişi</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Ay Seçimi */}
        <View style={styles.monthSection}>
          <Calendar size={20} color="#3b82f6" />
          <Text style={styles.monthLabel}>Hakediş Dönemi:</Text>
          <Text style={styles.monthValue}>{getCurrentMonthName()}</Text>
        </View>

        {/* Özet Kart */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Seçili Personel</Text>
              <Text style={styles.summaryValue}>
                {selectedHakedisler.length} / {hakedisler.length}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Toplam Tutar</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Tümünü Seç */}
        <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll}>
          <View
            style={[
              styles.checkbox,
              hakedisler.every((h) => h.selected) && styles.checkboxActive,
            ]}
          >
            {hakedisler.every((h) => h.selected) && (
              <Check size={14} color="#fff" />
            )}
          </View>
          <Text style={styles.selectAllText}>Tümünü Seç/Kaldır</Text>
        </TouchableOpacity>

        {/* Personel Listesi */}
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {hakedisler.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz personel eklenmemiş</Text>
            </View>
          ) : (
            hakedisler.map((h) => (
              <View key={h.personel.id} style={styles.personelCard}>
                <TouchableOpacity
                  style={styles.personelLeft}
                  onPress={() => toggleSelect(h.personel.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      h.selected && styles.checkboxActive,
                    ]}
                  >
                    {h.selected && <Check size={14} color="#fff" />}
                  </View>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {h.personel.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.personelInfo}>
                    <Text style={styles.personelName}>{h.personel.name}</Text>
                    {h.personel.position && (
                      <Text style={styles.personelPosition}>
                        {h.personel.position}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.personelRight}>
                  {editingId === h.personel.id ? (
                    <View style={styles.editContainer}>
                      <View style={styles.editInputBox}>
                        <Text style={styles.editCurrency}>₺</Text>
                        <TextInput
                          style={styles.editInput}
                          value={editValue}
                          onChangeText={setEditValue}
                          keyboardType="decimal-pad"
                          autoFocus
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.editSaveBtn}
                        onPress={() => saveEdit(h.personel.id)}
                      >
                        <Check size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.amountBox}
                      onPress={() => startEdit(h.personel.id, h.amount)}
                    >
                      <Text
                        style={[
                          styles.amountText,
                          h.amount === 0 && styles.amountZero,
                        ]}
                      >
                        {formatCurrency(h.amount)}
                      </Text>
                      <Edit3 size={14} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Alt Buton */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (selectedHakedisler.length === 0 || loading) &&
                styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedHakedisler.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CheckCircle size={22} color="#fff" />
                <Text style={styles.submitText}>Hakedişi Gerçekleştir</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Bu işlem seçili personeller için maaş gideri kaydı oluşturacaktır
          </Text>
        </View>
      </View>
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
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  monthSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbeafe",
    paddingVertical: 12,
    gap: 8,
  },
  monthLabel: {
    fontSize: 19,
    color: "#1e40af",
  },
  monthValue: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1e40af",
  },
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  summaryLabel: {
    fontSize: 19,
    color: "#6b7280",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10b981",
  },
  selectAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  selectAllText: {
    fontSize: 19,
    fontWeight: "500",
    color: "#6b7280",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 19,
    color: "#9ca3af",
    marginTop: 12,
  },
  personelCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  personelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4f46e5",
  },
  personelInfo: {
    flex: 1,
  },
  personelName: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  personelPosition: {
    fontSize: 19,
    color: "#6b7280",
    marginTop: 2,
  },
  personelRight: {
    marginLeft: 10,
  },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  amountText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
  },
  amountZero: {
    color: "#9ca3af",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  editCurrency: {
    fontSize: 19,
    fontWeight: "600",
    color: "#6b7280",
  },
  editInput: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 8,
    paddingLeft: 4,
    minWidth: 80,
  },
  editSaveBtn: {
    backgroundColor: "#10b981",
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  submitBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitText: {
    fontSize: 19,
    fontWeight: "700",
    color: "#fff",
  },
  footerNote: {
    fontSize: 19,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 10,
  },
});
