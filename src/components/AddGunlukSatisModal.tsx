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
import { X, Wallet, CreditCard, Smartphone } from 'lucide-react-native';
import { useStore } from '../store/useStore';

interface AddGunlukSatisModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddGunlukSatisModal({ visible, onClose }: AddGunlukSatisModalProps) {
  const { addGunlukSatis, gunlukSatislar } = useStore();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nakitSatis, setNakitSatis] = useState('');
  const [krediKartiSatis, setKrediKartiSatis] = useState('');
  const [yemeksepeti, setYemeksepeti] = useState('');
  const [getir, setGetir] = useState('');
  const [trendyol, setTrendyol] = useState('');
  const [digerOnline, setDigerOnline] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      // Bugün için zaten kayıt var mı kontrol et
      const today = new Date().toISOString().split('T')[0];
      const existing = gunlukSatislar.find(s => s.date === today);
      if (existing) {
        setNakitSatis(existing.nakit_satis.toString());
        setKrediKartiSatis(existing.kredi_karti_satis.toString());
        setYemeksepeti(existing.yemeksepeti.toString());
        setGetir(existing.getir.toString());
        setTrendyol(existing.trendyol.toString());
        setDigerOnline(existing.diger_online.toString());
        setNotes(existing.notes || '');
      }
    }
  }, [visible]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setNakitSatis('');
    setKrediKartiSatis('');
    setYemeksepeti('');
    setGetir('');
    setTrendyol('');
    setDigerOnline('');
    setNotes('');
  };

  const calculateTotal = () => {
    return (
      (parseFloat(nakitSatis) || 0) +
      (parseFloat(krediKartiSatis) || 0) +
      (parseFloat(yemeksepeti) || 0) +
      (parseFloat(getir) || 0) +
      (parseFloat(trendyol) || 0) +
      (parseFloat(digerOnline) || 0)
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const handleSubmit = async () => {
    const total = calculateTotal();
    if (total <= 0) {
      Alert.alert('Hata', 'En az bir satış tutarı girin');
      return;
    }

    setLoading(true);
    const { error } = await addGunlukSatis({
      date,
      nakit_satis: parseFloat(nakitSatis) || 0,
      kredi_karti_satis: parseFloat(krediKartiSatis) || 0,
      yemeksepeti: parseFloat(yemeksepeti) || 0,
      getir: parseFloat(getir) || 0,
      trendyol: parseFloat(trendyol) || 0,
      diger_online: parseFloat(digerOnline) || 0,
      notes: notes.trim() || undefined,
      restaurant_id: '',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', 'Satış kaydedilirken bir hata oluştu');
    } else {
      resetForm();
      onClose();
    }
  };

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
          <Text style={styles.title}>Günlük Satış</Text>
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
            <Text style={styles.totalValue}>{formatCurrency(calculateTotal())}</Text>
          </View>

          {/* Ana Satış Kanalları */}
          <View style={styles.sectionHeader}>
            <Wallet size={18} color="#10b981" />
            <Text style={styles.sectionTitle}>Ana Satış Kanalları</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Nakit Satış</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySmall}>₺</Text>
                <TextInput
                  style={styles.amountField}
                  value={nakitSatis}
                  onChangeText={setNakitSatis}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Kredi Kartı</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySmall}>₺</Text>
                <TextInput
                  style={styles.amountField}
                  value={krediKartiSatis}
                  onChangeText={setKrediKartiSatis}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Online Satış Kanalları */}
          <View style={styles.sectionHeader}>
            <Smartphone size={18} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Online Satış Kanalları</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Yemeksepeti</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySmall}>₺</Text>
                <TextInput
                  style={styles.amountField}
                  value={yemeksepeti}
                  onChangeText={setYemeksepeti}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Getir</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySmall}>₺</Text>
                <TextInput
                  style={styles.amountField}
                  value={getir}
                  onChangeText={setGetir}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Trendyol</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySmall}>₺</Text>
                <TextInput
                  style={styles.amountField}
                  value={trendyol}
                  onChangeText={setTrendyol}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.inputHalf}>
              <Text style={styles.inputLabel}>Diğer Online</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySmall}>₺</Text>
                <TextInput
                  style={styles.amountField}
                  value={digerOnline}
                  onChangeText={setDigerOnline}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Notlar */}
          <Text style={styles.label}>Notlar</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Opsiyonel not"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#10b981',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  totalCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  currencySmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  amountField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 12,
    paddingLeft: 6,
  },
  bottomPadding: {
    height: 40,
  },
});
