import { useState } from 'react';
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
import { X, Wallet, Building2, CreditCard, PiggyBank } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { KasaType } from '../types';

interface AddKasaModalProps {
  visible: boolean;
  onClose: () => void;
}

const kasaTypes = [
  { type: 'nakit' as KasaType, label: 'Nakit', icon: Wallet, color: '#10b981' },
  { type: 'banka' as KasaType, label: 'Banka', icon: Building2, color: '#3b82f6' },
  { type: 'kredi_karti' as KasaType, label: 'Kredi Kartı', icon: CreditCard, color: '#f59e0b' },
  { type: 'birikim' as KasaType, label: 'Birikim', icon: PiggyBank, color: '#8b5cf6' },
];

export default function AddKasaModal({ visible, onClose }: AddKasaModalProps) {
  const { addKasa, profile } = useStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<KasaType>('nakit');
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';

  const resetForm = () => {
    setName('');
    setType('nakit');
    setCurrency('TRY');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Kasa adı zorunludur');
      return;
    }

    if (type === 'birikim' && !isPro) {
      Alert.alert('Pro Gerekli', 'Birikim kasası açmak için Pro plana yükseltmeniz gerekiyor');
      return;
    }

    setLoading(true);
    const { error } = await addKasa({
      name: name.trim(),
      type,
      currency,
      is_active: true,
      is_archived: false,
      restaurant_id: '',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', 'Kasa eklenirken bir hata oluştu');
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
          <Text style={styles.title}>Yeni Kasa Ekle</Text>
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
          {/* Kasa Tipi */}
          <Text style={styles.label}>Kasa Tipi</Text>
          <View style={styles.typeGrid}>
            {kasaTypes.map((item) => {
              const IconComponent = item.icon;
              const isDisabled = item.type === 'birikim' && !isPro;
              const isSelected = type === item.type;

              return (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.typeCard,
                    isSelected && { borderColor: item.color, backgroundColor: `${item.color}10` },
                    isDisabled && styles.typeCardDisabled,
                  ]}
                  onPress={() => !isDisabled && setType(item.type)}
                  disabled={isDisabled}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${item.color}20` }]}>
                    <IconComponent size={24} color={item.color} />
                  </View>
                  <Text style={[styles.typeLabel, isDisabled && styles.typeLabelDisabled]}>
                    {item.label}
                  </Text>
                  {isDisabled && (
                    <View style={styles.proBadge}>
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Kasa Adı */}
          <Text style={styles.label}>Kasa Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: Ana Kasa, Ziraat Bankası"
            placeholderTextColor="#9ca3af"
          />

          {/* Para Birimi */}
          <Text style={styles.label}>Para Birimi</Text>
          <View style={styles.currencyButtons}>
            {(['TRY', 'USD', 'EUR'] as const).map((curr) => {
              const isDisabled = curr !== 'TRY' && !isPro;
              return (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyButton,
                    currency === curr && styles.currencyButtonActive,
                    isDisabled && styles.currencyButtonDisabled,
                  ]}
                  onPress={() => !isDisabled && setCurrency(curr)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.currencyButtonText,
                      currency === curr && styles.currencyButtonTextActive,
                      isDisabled && styles.currencyButtonTextDisabled,
                    ]}
                  >
                    {curr === 'TRY' ? '₺ TRY' : curr === 'USD' ? '$ USD' : '€ EUR'}
                  </Text>
                  {isDisabled && (
                    <Text style={styles.proTag}>PRO</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

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
    marginBottom: 12,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardDisabled: {
    opacity: 0.6,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  typeLabelDisabled: {
    color: '#9ca3af',
  },
  proBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f59e0b',
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  currencyButtonDisabled: {
    opacity: 0.6,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  currencyButtonTextActive: {
    color: '#fff',
  },
  currencyButtonTextDisabled: {
    color: '#9ca3af',
  },
  proTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f59e0b',
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
