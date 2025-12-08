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
import { X, Building2, Users } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { CariType } from '../types';

interface AddCariModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddCariModal({ visible, onClose }: AddCariModalProps) {
  const { addCari } = useStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<CariType>('tedarikci');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const resetForm = () => {
    setName('');
    setType('tedarikci');
    setPhone('');
    setEmail('');
    setAddress('');
    setTaxNumber('');
    setInitialBalance('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Cari adı zorunludur');
      return;
    }

    setLoading(true);
    const { error } = await addCari({
      name: name.trim(),
      type,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      tax_number: taxNumber.trim() || undefined,
      initial_balance: parseFloat(initialBalance) || 0,
      include_in_reports: true,
      is_archived: false,
      restaurant_id: '',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', 'Cari eklenirken bir hata oluştu');
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
          <Text style={styles.title}>Yeni Cari Ekle</Text>
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
          {/* Cari Tipi */}
          <Text style={styles.label}>Cari Tipi</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'tedarikci' && styles.typeButtonActive]}
              onPress={() => setType('tedarikci')}
            >
              <Building2 size={20} color={type === 'tedarikci' ? '#fff' : '#6b7280'} />
              <Text style={[styles.typeButtonText, type === 'tedarikci' && styles.typeButtonTextActive]}>
                Tedarikçi
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'musteri' && styles.typeButtonActive]}
              onPress={() => setType('musteri')}
            >
              <Users size={20} color={type === 'musteri' ? '#fff' : '#6b7280'} />
              <Text style={[styles.typeButtonText, type === 'musteri' && styles.typeButtonTextActive]}>
                Müşteri
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cari Adı */}
          <Text style={styles.label}>Cari Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: ABC Gıda Ltd."
            placeholderTextColor="#9ca3af"
          />

          {/* Telefon */}
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="0532 123 45 67"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
          />

          {/* E-posta */}
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="info@firma.com"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Adres */}
          <Text style={styles.label}>Adres</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Adres bilgisi"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />

          {/* Vergi No */}
          <Text style={styles.label}>Vergi No</Text>
          <TextInput
            style={styles.input}
            value={taxNumber}
            onChangeText={setTaxNumber}
            placeholder="Vergi numarası"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />

          {/* Başlangıç Bakiyesi */}
          <Text style={styles.label}>Başlangıç Bakiyesi</Text>
          <TextInput
            style={styles.input}
            value={initialBalance}
            onChangeText={setInitialBalance}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
          />
          <Text style={styles.hint}>
            {type === 'tedarikci'
              ? 'Pozitif: Borcunuz var, Negatif: Alacağınız var'
              : 'Pozitif: Alacağınız var, Negatif: Borcunuz var'}
          </Text>

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
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});
