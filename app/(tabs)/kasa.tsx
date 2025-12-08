import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';
import AddKasaModal from '../../src/components/AddKasaModal';
import { Kasa as KasaType } from '../../src/types';

const kasaIcons = {
  nakit: { icon: Wallet, color: '#10b981', bgColor: '#dcfce7' },
  banka: { icon: Building2, color: '#3b82f6', bgColor: '#dbeafe' },
  kredi_karti: { icon: CreditCard, color: '#f59e0b', bgColor: '#fef3c7' },
  birikim: { icon: PiggyBank, color: '#8b5cf6', bgColor: '#ede9fe' },
};

const kasaTypeLabels = {
  nakit: 'Fiziksel Para',
  banka: 'Havale/EFT',
  kredi_karti: 'Kart Harcamaları',
  birikim: 'Yedek Para',
};

export default function Kasa() {
  const { kasalar, loadingKasalar, fetchKasalar, fetchProfile, profile } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKasalar();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const totalBalance = kasalar
    .filter(k => k.currency === 'TRY')
    .reduce((sum, kasa) => sum + kasa.balance, 0);

  const isPro = profile?.plan === 'pro' || profile?.plan === 'premium';

  const renderKasaItem = (kasa: KasaType) => {
    const iconConfig = kasaIcons[kasa.type];
    const IconComponent = iconConfig.icon;

    return (
      <TouchableOpacity key={kasa.id} style={styles.kasaCard}>
        <View style={styles.kasaLeft}>
          <View style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}>
            <IconComponent size={24} color={iconConfig.color} />
          </View>
          <View style={styles.kasaInfo}>
            <Text style={styles.kasaName}>{kasa.name}</Text>
            <Text style={styles.kasaType}>{kasaTypeLabels[kasa.type]}</Text>
          </View>
        </View>
        <View style={styles.kasaRight}>
          <Text style={styles.kasaBalance}>
            {formatCurrency(kasa.balance, kasa.currency)}
          </Text>
          <ChevronRight size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kasa</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Toplam Bakiye */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Toplam Bakiye</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalBalance)}</Text>
          <TouchableOpacity style={styles.transferButton}>
            <ArrowRightLeft size={18} color="#10b981" />
            <Text style={styles.transferText}>Kasalar Arası Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Kasalar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kasalarım</Text>
          {kasalar.length > 0 ? (
            <View style={styles.kasaList}>
              {kasalar.map(renderKasaItem)}
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyKasaCard} onPress={() => setShowAddModal(true)}>
              <Wallet size={32} color="#9ca3af" />
              <Text style={styles.emptyKasaText}>Henüz kasa eklenmemiş</Text>
              <Text style={styles.emptyKasaSubtext}>İlk kasanızı eklemek için tıklayın</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Birikim Kasası Ekle */}
        {!isPro && (
          <TouchableOpacity style={styles.addKasaCard}>
            <View style={[styles.kasaIcon, { backgroundColor: '#f3f4f6' }]}>
              <PiggyBank size={24} color="#6b7280" />
            </View>
            <View style={styles.addKasaInfo}>
              <Text style={styles.addKasaTitle}>Birikim Kasası Ekle</Text>
              <Text style={styles.addKasaText}>Pro planla kullanılabilir</Text>
            </View>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Son Hareketler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Hareketler</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Henüz hareket bulunmuyor</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Modal */}
      <AddKasaModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#10b981',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCard: {
    backgroundColor: '#111827',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  transferText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 16,
  },
  kasaList: {
    gap: 12,
  },
  kasaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kasaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kasaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kasaInfo: {
    gap: 2,
  },
  kasaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  kasaType: {
    fontSize: 12,
    color: '#6b7280',
  },
  kasaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kasaBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptyKasaCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyKasaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyKasaSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  addKasaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addKasaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addKasaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addKasaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f59e0b',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
