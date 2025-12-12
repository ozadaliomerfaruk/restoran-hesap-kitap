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
  Switch,
} from "react-native";
import {
  X,
  CreditCard,
  Calendar,
  Tag,
  Truck,
  ChevronDown,
  Check,
  Info,
  Search,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useStore } from "../store/useStore";
import { Kasa, Cari, Kategori } from "../types";
import { supabase } from "../lib/supabase";

interface KrediKartiHarcamaModalProps {
  visible: boolean;
  onClose: () => void;
  kasa: Kasa;
  onSuccess?: () => void;
}

export default function KrediKartiHarcamaModal({
  visible,
  onClose,
  kasa,
  onSuccess,
}: KrediKartiHarcamaModalProps) {
  const {
    profile,
    kategoriler,
    fetchKategoriler,
    cariler,
    fetchCariler,
    fetchKasalar,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [kategoriId, setKategoriId] = useState("");
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [kategoriSearch, setKategoriSearch] = useState("");
  const [cariId, setCariId] = useState("");
  const [showCariPicker, setShowCariPicker] = useState(false);
  const [cariSearch, setCariSearch] = useState("");

  // Taksit
  const [isTaksitli, setIsTaksitli] = useState(false);
  const [taksitSayisi, setTaksitSayisi] = useState("3");

  useEffect(() => {
    if (visible) {
      fetchKategoriler();
      fetchCariler();
    }
  }, [visible]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setKategoriId("");
    setCariId("");
    setIsTaksitli(false);
    setTaksitSayisi("3");
    setKategoriSearch("");
    setCariSearch("");
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Hata", "Geçerli bir tutar girin");
      return;
    }

    const harcamaTutari = parseFloat(amount);
    const kullanilabilir = (kasa.credit_limit || 0) - kasa.balance;

    if (harcamaTutari > kullanilabilir) {
      Alert.alert(
        "Limit Yetersiz",
        `Kullanılabilir limit: ${formatCurrency(
          kullanilabilir
        )}\nHarcama tutarı: ${formatCurrency(harcamaTutari)}`
      );
      return;
    }

    if (isTaksitli && (!taksitSayisi || parseInt(taksitSayisi) < 2)) {
      Alert.alert("Hata", "Taksit sayısı en az 2 olmalıdır");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      if (isTaksitli) {
        // Taksitli harcama
        const taksitSayisiNum = parseInt(taksitSayisi);
        const taksitTutari =
          Math.round((harcamaTutari / taksitSayisiNum) * 100) / 100;

        // Taksit kaydı oluştur
        const { data: taksitData, error: taksitError } = await supabase
          .from("taksitler")
          .insert({
            restaurant_id: profile?.restaurant_id,
            title: description || `Kredi Kartı Taksit - ${kasa.name}`,
            description: `${taksitSayisiNum} taksit`,
            total_amount: harcamaTutari,
            installment_count: taksitSayisiNum,
            installment_amount: taksitTutari,
            paid_count: 0,
            remaining_amount: harcamaTutari,
            kasa_id: kasa.id,
            kategori_id: kategoriId || null,
            cari_id: cariId || null,
            start_date: date,
            next_payment_date: date,
            is_completed: false,
            created_by: user.id,
          })
          .select()
          .single();

        if (taksitError) throw taksitError;

        // Taksit ödemelerini oluştur
        const odemeler = [];
        let currentDate = new Date(date);
        for (let i = 1; i <= taksitSayisiNum; i++) {
          odemeler.push({
            taksit_id: taksitData.id,
            restaurant_id: profile?.restaurant_id,
            installment_no: i,
            amount: taksitTutari,
            due_date: currentDate.toISOString().split("T")[0],
            is_paid: false,
          });
          // Bir sonraki ay
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        const { error: odemelerError } = await supabase
          .from("taksit_odemeleri")
          .insert(odemeler);

        if (odemelerError) throw odemelerError;

        // İşlem kaydı (gider olarak)
        await supabase.from("islemler").insert({
          type: "gider",
          amount: harcamaTutari,
          description:
            description || `Taksitli Alış (${taksitSayisiNum} taksit)`,
          date,
          kasa_id: kasa.id,
          cari_id: cariId || null,
          kategori_id: kategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: user.id,
        });

        // Kredi kartı bakiyesini artır (ilk taksit tutarı kadar değil, toplam tutar kadar)
        // Çünkü kredi kartında borç hemen oluşur
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: harcamaTutari,
        });

        // Tedarikçi varsa bakiyesini güncelle
        if (cariId) {
          // Tedarikçiye ödeme yapıldı, borç kapandı
          await supabase.rpc("update_cari_balance", {
            cari_id: cariId,
            amount: -harcamaTutari,
          });
        }
      } else {
        // Tek çekim harcama
        // İşlem kaydı
        const { error: islemError } = await supabase.from("islemler").insert({
          type: "gider",
          amount: harcamaTutari,
          description: description || "Kredi Kartı Harcaması",
          date,
          kasa_id: kasa.id,
          cari_id: cariId || null,
          kategori_id: kategoriId || null,
          restaurant_id: profile?.restaurant_id,
          created_by: user.id,
        });

        if (islemError) throw islemError;

        // Kredi kartı bakiyesini artır (borç arttı)
        await supabase.rpc("update_kasa_balance", {
          kasa_id: kasa.id,
          amount: harcamaTutari,
        });

        // Tedarikçi varsa bakiyesini güncelle
        if (cariId) {
          await supabase.rpc("update_cari_balance", {
            cari_id: cariId,
            amount: -harcamaTutari,
          });
        }
      }

      Alert.alert(
        "Başarılı",
        isTaksitli ? "Taksitli harcama kaydedildi" : "Harcama kaydedildi"
      );
      fetchKasalar();
      resetForm();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Harcama hatası:", error);
      Alert.alert("Hata", error.message || "Harcama kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Gider kategorileri
  const giderKategoriler = kategoriler.filter((k) => k.type === "gider");
  const filteredKategoriler = giderKategoriler.filter((k) =>
    k.name.toLowerCase().includes(kategoriSearch.toLowerCase())
  );

  // Tedarikçiler
  const tedarikciler = cariler.filter(
    (c) => c.type === "tedarikci" && !c.is_archived
  );
  const filteredTedarikciler = tedarikciler.filter((c) =>
    c.name.toLowerCase().includes(cariSearch.toLowerCase())
  );

  const selectedKategori = kategoriler.find((k) => k.id === kategoriId);
  const selectedCari = cariler.find((c) => c.id === cariId);

  const kullanilabilir = (kasa.credit_limit || 0) - kasa.balance;

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
          <Text style={styles.title}>Kredi Kartı Harcaması</Text>
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
            <View style={styles.cardInfoLeft}>
              <CreditCard size={20} color="#f59e0b" />
              <Text style={styles.cardName}>{kasa.name}</Text>
            </View>
            <View style={styles.cardInfoRight}>
              <Text style={styles.cardLimitLabel}>Kullanılabilir</Text>
              <Text style={styles.cardLimitValue}>
                {formatCurrency(kullanilabilir)}
              </Text>
            </View>
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
              keyboardType="numeric"
            />
          </View>

          {/* Taksitli mi? */}
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Text style={styles.switchLabel}>Taksitli Alışveriş</Text>
              <Text style={styles.switchDesc}>Taksit sayısını belirleyin</Text>
            </View>
            <Switch
              value={isTaksitli}
              onValueChange={setIsTaksitli}
              trackColor={{ false: "#e5e7eb", true: "#fde68a" }}
              thumbColor={isTaksitli ? "#f59e0b" : "#9ca3af"}
            />
          </View>

          {/* Taksit Sayısı */}
          {isTaksitli && (
            <>
              <Text style={styles.label}>Taksit Sayısı *</Text>
              <View style={styles.taksitOptions}>
                {["2", "3", "4", "6", "9", "12"].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.taksitOption,
                      taksitSayisi === num && styles.taksitOptionActive,
                    ]}
                    onPress={() => setTaksitSayisi(num)}
                  >
                    <Text
                      style={[
                        styles.taksitOptionText,
                        taksitSayisi === num && styles.taksitOptionTextActive,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {amount && parseFloat(amount) > 0 && (
                <View style={styles.taksitInfo}>
                  <Info size={16} color="#3b82f6" />
                  <Text style={styles.taksitInfoText}>
                    Aylık taksit:{" "}
                    {formatCurrency(
                      parseFloat(amount) / parseInt(taksitSayisi)
                    )}
                  </Text>
                </View>
              )}
            </>
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

          {/* Kategori */}
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowKategoriPicker(true)}
          >
            <Tag size={20} color="#6b7280" />
            <Text style={styles.selectText}>
              {selectedKategori?.name || "Kategori seçin"}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Tedarikçi */}
          <Text style={styles.label}>Tedarikçi (Opsiyonel)</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCariPicker(true)}
          >
            <Truck size={20} color="#6b7280" />
            <Text style={styles.selectText}>
              {selectedCari?.name || "Tedarikçi seçin"}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Açıklama */}
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Açıklama ekleyin"
            placeholderTextColor="#9ca3af"
            multiline
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Kategori Picker Modal */}
      <Modal visible={showKategoriPicker} animationType="slide">
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Kategori Seç</Text>
            <TouchableOpacity onPress={() => setShowKategoriPicker(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              value={kategoriSearch}
              onChangeText={setKategoriSearch}
              placeholder="Kategori ara..."
              placeholderTextColor="#9ca3af"
            />
          </View>
          <ScrollView>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setKategoriId("");
                setShowKategoriPicker(false);
              }}
            >
              <Text style={styles.pickerItemText}>Kategori Seçilmedi</Text>
              {!kategoriId && <Check size={20} color="#10b981" />}
            </TouchableOpacity>
            {filteredKategoriler.map((kat) => (
              <TouchableOpacity
                key={kat.id}
                style={styles.pickerItem}
                onPress={() => {
                  setKategoriId(kat.id);
                  setShowKategoriPicker(false);
                }}
              >
                <Text style={styles.pickerItemText}>{kat.name}</Text>
                {kategoriId === kat.id && <Check size={20} color="#10b981" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Tedarikçi Picker Modal */}
      <Modal visible={showCariPicker} animationType="slide">
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Tedarikçi Seç</Text>
            <TouchableOpacity onPress={() => setShowCariPicker(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              value={cariSearch}
              onChangeText={setCariSearch}
              placeholder="Tedarikçi ara..."
              placeholderTextColor="#9ca3af"
            />
          </View>
          <ScrollView>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => {
                setCariId("");
                setShowCariPicker(false);
              }}
            >
              <Text style={styles.pickerItemText}>Tedarikçi Seçilmedi</Text>
              {!cariId && <Check size={20} color="#10b981" />}
            </TouchableOpacity>
            {filteredTedarikciler.map((cari) => (
              <TouchableOpacity
                key={cari.id}
                style={styles.pickerItem}
                onPress={() => {
                  setCariId(cari.id);
                  setShowCariPicker(false);
                }}
              >
                <View>
                  <Text style={styles.pickerItemText}>{cari.name}</Text>
                  <Text style={styles.pickerItemSubtext}>
                    Bakiye: {formatCurrency(cari.balance)}
                  </Text>
                </View>
                {cariId === cari.id && <Check size={20} color="#10b981" />}
              </TouchableOpacity>
            ))}
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
    justifyContent: "space-between",
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  cardInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400e",
  },
  cardInfoRight: {
    alignItems: "flex-end",
  },
  cardLimitLabel: {
    fontSize: 11,
    color: "#92400e",
  },
  cardLimitValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  switchLeft: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  switchDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  taksitOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  taksitOption: {
    width: 50,
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  taksitOptionActive: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  taksitOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  taksitOptionTextActive: {
    color: "#f59e0b",
  },
  taksitInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  taksitInfoText: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "500",
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
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  selectText: {
    flex: 1,
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
    minHeight: 80,
    textAlignVertical: "top",
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
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
  pickerItemText: {
    fontSize: 15,
    color: "#111827",
  },
  pickerItemSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
});
