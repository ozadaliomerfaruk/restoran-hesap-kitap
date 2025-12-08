import { useState, useEffect } from 'react';
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
} from 'react-native';
import { X, ChevronDown } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { OdemeFrequency } from '../types';

interface AddTekrarlayanOdemeModalProps {
  visible: boolean;
  onClose: () => void;
}

const frequencies: { value: OdemeFrequency; label: string }[] = [
  { value: 'gunluk', label: 'Günlük' },
  { value: 'haftalik', label: 'Haftalık' },
  { value: 'aylik', label: 'Aylık' },
  { value: 'yillik', label: 'Yıllık' },
];

export default function AddTekrarlayanOdemeModal({ visible, onClose }: AddTekrarlayanOdemeModalProps) {
  const { addTekrarlayanOdeme, kasalar, cariler, kategoriler, fetchKasalar, fetchCariler, fetchKategoriler } = useStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<OdemeFrequency>('aylik');
  const [nextDate, setNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedKasa, setSelectedKasa] = useState<string>('');
  const [selectedCari, setSelectedCari] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<string>('');
  const [showKasaPicker, setShowKasaPicker] = useState(false);
  const [showCariPicker, setShowCariPicker] = useState(false);
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchKasalar();
      fetchCariler();
      fetchKategoriler();
    }
  }, [visible]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setFrequency('aylik');
    setNextDate(new Date().toISOString().split('T')[0]);
    setSelectedKasa('');
    setSelectedCari('');
    setSelectedKategori('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Ödeme adı gerekli');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin');
      return;
    }

    setLoading(true);
    const { error } = await addTekrarlayanOdeme({
      name: name.trim(),
      amount: parseFloat(amount),
      frequency,
      next_date: nextDate,
      kasa_id: selectedKasa || undefined,
      cari_id: selectedCari || undefined,
      kategori_id: selectedKategori || undefined,
      is_active: true,
      restaurant_id: '',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', 'Ödeme eklenirken bir hata oluştu');
    } else {
      resetForm();
      onClose();
    }
  };

  const giderKategoriler = kategoriler.filter(k => k.type === 'gider');
  const selectedKasaName = kasalar.find(k => k.id === selectedKasa)?.name || 'Kasa Seç (Opsiyonel)';
  const selectedCariName = cariler.find(c => c.id === selectedCari)?.name || 'Cari Seç (Opsiyonel)';
  const selectedKategoriName = kategoriler.find(k => k.id === selectedKategori)?.name || 'Kategori Seç (Opsiyonel)';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Yeni Tekrarlayan Ödeme</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Ödeme Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: Kira, Elektrik, Sigorta"
            placeholderTextColor="#9ca3af"
          />

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

          <Text style={styles.label}>Tekrar Sıklığı</Text>
          <View style={styles.frequencyGrid}>
            {frequencies.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.frequencyButton,
                  frequency === item.value && styles.frequencyButtonActive
                ]}
                onPress={() => setFrequency(item.value)}
              >
                <Text style={[
                  styles.frequencyText,
                  frequency === item.value && styles.frequencyTextActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Sonraki Ödeme Tarihi</Text>
          <TextInput
            style={styles.input}
            value={nextDate}
            onChangeText={setNextDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Kasa</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowKasaPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !selectedKasa && styles.pickerButtonPlaceholder]}>
              {selectedKasaName}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          <Text style={styles.label}>Cari</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowCariPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !selectedCari && styles.pickerButtonPlaceholder]}>
              {selectedCariName}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowKategoriPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !selectedKategori && styles.pickerButtonPlaceholder]}>
              {selectedKategoriName}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Kasa Picker */}
        <Modal visible={showKasaPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowKasaPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Kasa Seç</Text>
              <ScrollView style={styles.pickerList}>
                <TouchableOpacity
                  style={[styles.pickerItem, !selectedKasa && styles.pickerItemSelected]}
                  onPress={() => {
                    setSelectedKasa('');
                    setShowKasaPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>Seçim Yok</Text>
                </TouchableOpacity>
                {kasalar.map((kasa) => (
                  <TouchableOpacity
                    key={kasa.id}
                    style={[styles.pickerItem, selectedKasa === kasa.id && styles.pickerItemSelected]}
                    onPress={() => {
                      setSelectedKasa(kasa.id);
                      setShowKasaPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{kasa.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

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
                  style={[styles.pickerItem, !selectedCari && styles.pickerItemSelected]}
                  onPress={() => {
                    setSelectedCari('');
                    setShowCariPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>Seçim Yok</Text>
                </TouchableOpacity>
                {cariler.map((cari) => (
                  <TouchableOpacity
                    key={cari.id}
                    style={[styles.pickerItem, selectedCari === cari.id && styles.pickerItemSelected]}
                    onPress={() => {
                      setSelectedCari(cari.id);
                      setShowCariPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{cari.name}</Text>
                    <Text style={styles.pickerItemSubtext}>{cari.type === 'tedarikci' ? 'Tedarikçi' : 'Müşteri'}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Kategori Picker */}
        <Modal visible={showKategoriPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowKategoriPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Kategori Seç</Text>
              <ScrollView style={styles.pickerList}>
                <TouchableOpacity
                  style={[styles.pickerItem, !selectedKategori && styles.pickerItemSelected]}
                  onPress={() => {
                    setSelectedKategori('');
                    setShowKategoriPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>Seçim Yok</Text>
                </TouchableOpacity>
                {giderKategoriler.map((kategori) => (
                  <TouchableOpacity
                    key={kategori.id}
                    style={[styles.pickerItem, selectedKategori === kategori.id && styles.pickerItemSelected]}
                    onPress={() => {
                      setSelectedKategori(kategori.id);
                      setShowKategoriPicker(false);
                    }}
                  >
                    <Text style={styles.pickerItemText}>{kategori.name}</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 16,
  },
  frequencyGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  frequencyButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerButtonPlaceholder: {
    color: '#9ca3af',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerList: {
    padding: 8,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#ede9fe',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerItemSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomPadding: {
    height: 40,
  },
});
