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
import { X, ChevronDown, DollarSign, Calendar, Gift, MinusCircle } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { Personel, PersonelIslemType } from '../types';

interface PersonelIslemModalProps {
  visible: boolean;
  onClose: () => void;
  personel: Personel | null;
}

const islemTypes: { value: PersonelIslemType; label: string; icon: any; color: string }[] = [
  { value: 'maas', label: 'Maaş Ödemesi', icon: DollarSign, color: '#10b981' },
  { value: 'avans', label: 'Avans', icon: Calendar, color: '#f59e0b' },
  { value: 'prim', label: 'Prim', icon: Gift, color: '#3b82f6' },
  { value: 'kesinti', label: 'Kesinti', icon: MinusCircle, color: '#ef4444' },
];

export default function PersonelIslemModal({ visible, onClose, personel }: PersonelIslemModalProps) {
  const { addPersonelIslem, kasalar, fetchKasalar } = useStore();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<PersonelIslemType>('maas');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedKasa, setSelectedKasa] = useState<string>('');
  const [showKasaPicker, setShowKasaPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchKasalar();
      // Maaş ödemesi için varsayılan tutarı ayarla
      if (personel) {
        setAmount(personel.salary.toString());
      }
    }
  }, [visible, personel]);

  useEffect(() => {
    // Maaş seçildiğinde personelin maaşını yaz
    if (type === 'maas' && personel) {
      setAmount(personel.salary.toString());
    } else if (type !== 'maas') {
      setAmount('');
    }
  }, [type, personel]);

  const resetForm = () => {
    setType('maas');
    setAmount('');
    setDescription('');
    setSelectedKasa('');
  };

  const handleSubmit = async () => {
    if (!personel) return;

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Hata', 'Geçerli bir tutar girin');
      return;
    }

    if (!selectedKasa && type !== 'kesinti') {
      Alert.alert('Hata', 'Lütfen bir kasa seçin');
      return;
    }

    setLoading(true);
    const { error } = await addPersonelIslem({
      personel_id: personel.id,
      type,
      amount: parseFloat(amount),
      description: description.trim() || undefined,
      date: new Date().toISOString().split('T')[0],
      kasa_id: selectedKasa || undefined,
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

  const selectedKasaName = kasalar.find(k => k.id === selectedKasa)?.name || 'Kasa Seç';

  if (!personel) return null;

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
          <Text style={styles.title}>{personel.name}</Text>
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
          <Text style={styles.label}>İşlem Tipi</Text>
          <View style={styles.typeGrid}>
            {islemTypes.map((item) => {
              const IconComponent = item.icon;
              const isSelected = type === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeButton,
                    isSelected && { backgroundColor: item.color, borderColor: item.color }
                  ]}
                  onPress={() => setType(item.value)}
                >
                  <IconComponent size={20} color={isSelected ? '#fff' : item.color} />
                  <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

          {/* Kasa Seçimi (kesinti hariç) */}
          {type !== 'kesinti' && (
            <>
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
            </>
          )}

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
    backgroundColor: '#3b82f6',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  typeTextActive: {
    color: '#fff',
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
    backgroundColor: '#dbeafe',
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
