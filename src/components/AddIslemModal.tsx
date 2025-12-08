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
import { X, ArrowDownLeft, ArrowUpRight, ChevronDown } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { IslemType } from '../types';

interface AddIslemModalProps {
  visible: boolean;
  onClose: () => void;
  initialType?: 'gelir' | 'gider';
}

export default function AddIslemModal({ visible, onClose, initialType = 'gider' }: AddIslemModalProps) {
  const { addIslem, kasalar, cariler, kategoriler, fetchKasalar, fetchCariler, fetchKategoriler } = useStore();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<IslemType>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
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

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setSelectedKasa('');
    setSelectedCari('');
    setSelectedKategori('');
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin');
      return;
    }

    if (!selectedKasa) {
      Alert.alert('Hata', 'Lütfen bir kasa seçin');
      return;
    }

    setLoading(true);
    const { error } = await addIslem({
      type,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
      kasa_id: selectedKasa,
      cari_id: selectedCari || undefined,
      kategori_id: selectedKategori || undefined,
      restaurant_id: '',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', 'İşlem eklenirken bir hata oluştu');
    } else {
      resetForm();
      onClose();
    }
  };

  const filteredKategoriler = kategoriler.filter(k =>
    type === 'gelir' || type === 'tahsilat' ? k.type === 'gelir' : k.type === 'gider'
  );

  const selectedKasaName = kasalar.find(k => k.id === selectedKasa)?.name || 'Kasa Seç';
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
          <Text style={styles.title}>Yeni İşlem</Text>
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
          {/* İşlem Tipi */}
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'gelir' && styles.typeButtonGelir]}
              onPress={() => setType('gelir')}
            >
              <ArrowDownLeft size={20} color={type === 'gelir' ? '#fff' : '#10b981'} />
              <Text style={[styles.typeButtonText, type === 'gelir' && styles.typeButtonTextActive]}>
                Gelir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'gider' && styles.typeButtonGider]}
              onPress={() => setType('gider')}
            >
              <ArrowUpRight size={20} color={type === 'gider' ? '#fff' : '#ef4444'} />
              <Text style={[styles.typeButtonText, type === 'gider' && styles.typeButtonTextActive]}>
                Gider
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
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Kasa Seçimi */}
          <Text style={styles.label}>Kasa *</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowKasaPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !selectedKasa && styles.pickerButtonPlaceholder]}>
              {selectedKasaName}
            </Text>
            <ChevronDown size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Cari Seçimi */}
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

          {/* Kategori Seçimi */}
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

          {/* Açıklama */}
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="İşlem açıklaması"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Kasa Picker Modal */}
        <Modal visible={showKasaPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowKasaPicker(false)}
          >
            <View style={styles.pickerModal}>
              <Text style={styles.pickerTitle}>Kasa Seç</Text>
              <ScrollView style={styles.pickerList}>
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
                    <Text style={styles.pickerItemSubtext}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: kasa.currency }).format(kasa.balance)}
                    </Text>
                  </TouchableOpacity>
                ))}
                {kasalar.length === 0 && (
                  <Text style={styles.emptyText}>Henüz kasa eklenmemiş</Text>
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Cari Picker Modal */}
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

        {/* Kategori Picker Modal */}
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
                {filteredKategoriler.map((kategori) => (
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
                {filteredKategoriler.length === 0 && (
                  <Text style={styles.emptyText}>Kategori bulunamadı</Text>
                )}
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
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonGelir: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeButtonGider: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 20,
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
    backgroundColor: '#dcfce7',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerItemSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    paddingVertical: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
