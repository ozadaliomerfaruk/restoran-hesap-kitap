import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useStore } from '../../src/store/useStore';
import {
  Wallet,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Building2,
  CreditCard,
  Calendar,
  RefreshCw,
  Users,
  UserCheck,
  ChevronRight,
  CalendarDays,
  X,
} from 'lucide-react-native';

type FilterType = 'gunluk' | 'aylik' | 'yillik' | 'ozel';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    profile,
    fetchProfile,
    kasalar,
    fetchKasalar,
    islemler,
    fetchIslemler,
    cariler,
    fetchCariler,
    personeller,
    fetchPersoneller,
    tekrarlayanOdemeler,
    fetchTekrarlayanOdemeler,
    fetchKategoriler,
  } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('aylik');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchKasalar();
      fetchIslemler();
      fetchCariler();
      fetchPersoneller();
      fetchTekrarlayanOdemeler();
      fetchKategoriler();
    }
  }, [profile?.restaurant_id]);

  const loadAllData = async () => {
    await fetchProfile();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    if (profile?.restaurant_id) {
      await Promise.all([
        fetchKasalar(),
        fetchIslemler(),
        fetchCariler(),
        fetchPersoneller(),
        fetchTekrarlayanOdemeler(),
      ]);
    }
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Tarih filtreleme
  const getFilteredIslemler = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return islemler.filter(islem => {
      const islemDate = new Date(islem.date);

      if (filter === 'gunluk') {
        return islemDate >= today;
      } else if (filter === 'aylik') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return islemDate >= monthStart;
      } else if (filter === 'yillik') {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return islemDate >= yearStart;
      } else if (filter === 'ozel' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return islemDate >= start && islemDate <= end;
      } else {
        return true;
      }
    });
  };

  const handleDateFilterSelect = () => {
    setShowDatePicker(true);
  };

  const applyCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      setFilter('ozel');
      setShowDatePicker(false);
    }
  };

  const clearCustomFilter = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setFilter('aylik');
  };

  const formatDateRange = () => {
    if (!customStartDate || !customEndDate) return '';
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    return `${start.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`;
  };

  const filteredIslemler = getFilteredIslemler();

  const toplamGelir = filteredIslemler
    .filter(i => i.type === 'gelir' || i.type === 'tahsilat')
    .reduce((sum, i) => sum + i.amount, 0);

  const toplamGider = filteredIslemler
    .filter(i => i.type === 'gider' || i.type === 'odeme')
    .reduce((sum, i) => sum + i.amount, 0);

  // Toplam kasa bakiyesi (TRY)
  const totalKasaBakiye = kasalar
    .filter(k => k.currency === 'TRY' && k.type !== 'kredi_karti')
    .reduce((sum, k) => sum + k.balance, 0);

  // Kredi kartları
  const krediKartlari = kasalar.filter(k => k.type === 'kredi_karti');
  const toplamKrediKartiBorcu = krediKartlari.reduce((sum, k) => sum + Math.abs(k.balance), 0);

  // Tedarikçilere borç (negatif bakiye = biz borçluyuz)
  const tedarikciBorclari = cariler
    .filter(c => c.type === 'tedarikci' && c.balance < 0)
    .reduce((sum, c) => sum + Math.abs(c.balance), 0);

  // Personel borçları (avans vb.)
  const personelBorclari = personeller
    .reduce((sum, p) => sum + (p.balance || 0), 0);

  // Yaklaşan ödemeler (7 gün içinde)
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const yaklasanOdemeler = tekrarlayanOdemeler.filter(o => {
    const dueDate = new Date(o.next_date);
    return dueDate <= sevenDaysLater;
  }).slice(0, 3);

  // Kasa icon mapping
  const kasaIcons: Record<string, { icon: any; color: string; bgColor: string }> = {
    nakit: { icon: Wallet, color: '#10b981', bgColor: '#dcfce7' },
    banka: { icon: Building2, color: '#3b82f6', bgColor: '#dbeafe' },
    kredi_karti: { icon: CreditCard, color: '#f59e0b', bgColor: '#fef3c7' },
    birikim: { icon: Wallet, color: '#8b5cf6', bgColor: '#ede9fe' },
  };

  const filterLabels: Record<FilterType, string> = {
    gunluk: 'Günlük',
    aylik: 'Aylık',
    yillik: 'Yıllık',
    ozel: 'Özel',
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
          <View>
            <Text style={styles.greeting}>Hoş geldiniz,</Text>
            <Text style={styles.userName}>{profile?.name || user?.user_metadata?.name || 'Kullanıcı'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#111827" />
            {yaklasanOdemeler.length > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>

        {/* Filtre */}
        <View style={styles.filterRow}>
          {(['gunluk', 'aylik', 'yillik'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {filterLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.filterButton, styles.dateFilterButton, filter === 'ozel' && styles.filterButtonActive]}
            onPress={handleDateFilterSelect}
          >
            <CalendarDays size={16} color={filter === 'ozel' ? '#fff' : '#6b7280'} />
          </TouchableOpacity>
        </View>

        {/* Özel Tarih Seçiliyse Göster */}
        {filter === 'ozel' && customStartDate && customEndDate && (
          <View style={styles.customDateBadge}>
            <Text style={styles.customDateText}>{formatDateRange()}</Text>
            <TouchableOpacity onPress={clearCustomFilter}>
              <X size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Tarih Seçici Modal */}
        {showDatePicker && (
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Tarih Aralığı Seçin</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <X size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <View style={styles.dateInputContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>Başlangıç</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={customStartDate}
                    onChangeText={setCustomStartDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>Bitiş</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={customEndDate}
                    onChangeText={setCustomEndDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.datePickerApply} onPress={applyCustomDateFilter}>
                <Text style={styles.datePickerApplyText}>Uygula</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Gelir/Gider Kartları */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.cardHeader}>
              <ArrowDownLeft size={20} color="#10b981" />
              <Text style={styles.cardLabel}>Toplam Gelir</Text>
            </View>
            <Text style={styles.cardAmount}>{formatCurrency(toplamGelir)}</Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.cardHeader}>
              <ArrowUpRight size={20} color="#ef4444" />
              <Text style={styles.cardLabel}>Toplam Gider</Text>
            </View>
            <Text style={styles.cardAmount}>{formatCurrency(toplamGider)}</Text>
          </View>
        </View>

        {/* Kasa Bakiyeleri */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kasa Bakiyeleri</Text>
            <TouchableOpacity onPress={() => router.push('/kasa')}>
              <Text style={styles.seeAllText}>Tümü</Text>
            </TouchableOpacity>
          </View>

          {/* Genel Durum */}
          <View style={styles.totalBalanceCard}>
            <Text style={styles.totalBalanceLabel}>Genel Durum</Text>
            <Text style={styles.totalBalanceAmount}>{formatCurrency(totalKasaBakiye)}</Text>
          </View>

          {kasalar.filter(k => k.type !== 'kredi_karti').length > 0 ? (
            <View style={styles.kasaContainer}>
              {kasalar.filter(k => k.type !== 'kredi_karti').slice(0, 4).map((kasa) => {
                const iconConfig = kasaIcons[kasa.type] || kasaIcons.nakit;
                const IconComponent = iconConfig.icon;
                return (
                  <View key={kasa.id} style={styles.kasaItem}>
                    <View style={[styles.kasaIcon, { backgroundColor: iconConfig.bgColor }]}>
                      <IconComponent size={20} color={iconConfig.color} />
                    </View>
                    <View style={styles.kasaInfo}>
                      <Text style={styles.kasaName}>{kasa.name}</Text>
                      <Text style={styles.kasaAmount}>{formatCurrency(kasa.balance)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyState} onPress={() => router.push('/kasa')}>
              <Wallet size={32} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz kasa eklenmemiş</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Kredi Kartları */}
        {krediKartlari.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kredi Kartları</Text>
            <View style={styles.kasaContainer}>
              {krediKartlari.map((kart) => (
                <View key={kart.id} style={styles.kasaItem}>
                  <View style={[styles.kasaIcon, { backgroundColor: '#fef3c7' }]}>
                    <CreditCard size={20} color="#f59e0b" />
                  </View>
                  <View style={styles.kasaInfo}>
                    <Text style={styles.kasaName}>{kart.name}</Text>
                    <Text style={[styles.kasaAmount, { color: kart.balance < 0 ? '#ef4444' : '#111827' }]}>
                      {formatCurrency(kart.balance)}
                    </Text>
                  </View>
                </View>
              ))}
              {krediKartlari.length > 1 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalRowLabel}>Toplam Borç</Text>
                  <Text style={styles.totalRowAmount}>{formatCurrency(toplamKrediKartiBorcu)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Borçlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Borçlar</Text>
          <View style={styles.borcContainer}>
            <TouchableOpacity style={styles.borcItem} onPress={() => router.push('/cari')}>
              <View style={styles.borcLeft}>
                <View style={[styles.borcIcon, { backgroundColor: '#fee2e2' }]}>
                  <Building2 size={20} color="#ef4444" />
                </View>
                <View>
                  <Text style={styles.borcLabel}>Tedarikçilere Borç</Text>
                  <Text style={styles.borcSublabel}>
                    {cariler.filter(c => c.type === 'tedarikci' && c.balance < 0).length} tedarikçi
                  </Text>
                </View>
              </View>
              <View style={styles.borcRight}>
                <Text style={styles.borcAmount}>{formatCurrency(tedarikciBorclari)}</Text>
                <ChevronRight size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.borcItem} onPress={() => router.push('/personel')}>
              <View style={styles.borcLeft}>
                <View style={[styles.borcIcon, { backgroundColor: '#dbeafe' }]}>
                  <UserCheck size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.borcLabel}>Personel Avansları</Text>
                  <Text style={styles.borcSublabel}>
                    {personeller.filter(p => (p.balance || 0) > 0).length} personel
                  </Text>
                </View>
              </View>
              <View style={styles.borcRight}>
                <Text style={styles.borcAmount}>{formatCurrency(Math.abs(personelBorclari))}</Text>
                <ChevronRight size={18} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Yaklaşan Ödemeler */}
        {yaklasanOdemeler.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yaklaşan Ödemeler</Text>
              <TouchableOpacity onPress={() => router.push('/tekrarlayan')}>
                <Text style={styles.seeAllText}>Tümü</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.odemelerContainer}>
              {yaklasanOdemeler.map((odeme) => {
                const isOverdue = new Date(odeme.next_date) < new Date(today);
                return (
                  <TouchableOpacity
                    key={odeme.id}
                    style={[styles.odemeItem, isOverdue && styles.odemeItemOverdue]}
                    onPress={() => router.push('/tekrarlayan')}
                  >
                    <View style={styles.odemeLeft}>
                      <View style={[styles.odemeIcon, isOverdue && styles.odemeIconOverdue]}>
                        {isOverdue ? (
                          <AlertCircle size={18} color="#ef4444" />
                        ) : (
                          <RefreshCw size={18} color="#8b5cf6" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.odemeName}>{odeme.name}</Text>
                        <View style={styles.odemeDateRow}>
                          <Calendar size={12} color="#6b7280" />
                          <Text style={[styles.odemeDate, isOverdue && styles.odemeDateOverdue]}>
                            {isOverdue ? 'Gecikti' : formatDate(odeme.next_date)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.odemeAmount}>{formatCurrency(odeme.amount)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  dateFilterButton: {
    flex: 0,
    paddingHorizontal: 12,
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  customDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  customDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10b981',
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 340,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dateInputContainer: {
    gap: 16,
    marginBottom: 20,
  },
  dateInputWrapper: {
    gap: 6,
  },
  dateInputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  dateInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  datePickerApply: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  datePickerApplyText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 12,
  },
  totalBalanceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  totalBalanceLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  totalBalanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  kasaContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kasaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  kasaIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kasaInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kasaName: {
    fontSize: 14,
    color: '#374151',
  },
  kasaAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  totalRowLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  totalRowAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  borcContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  borcItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  borcLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  borcIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  borcLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  borcSublabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  borcRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  borcAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  odemelerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  odemeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  odemeItemOverdue: {
    backgroundColor: '#fef2f2',
  },
  odemeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  odemeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  odemeIconOverdue: {
    backgroundColor: '#fee2e2',
  },
  odemeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  odemeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  odemeDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  odemeDateOverdue: {
    color: '#ef4444',
    fontWeight: '500',
  },
  odemeAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
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
    marginTop: 12,
  },
  bottomPadding: {
    height: 20,
  },
});
