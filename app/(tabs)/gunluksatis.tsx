import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Calendar, Wallet, CreditCard, Smartphone } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';
import AddGunlukSatisModal from '../../src/components/AddGunlukSatisModal';
import { GunlukSatis } from '../../src/types';

export default function GunlukSatisScreen() {
  const { gunlukSatislar, loadingGunlukSatislar, fetchGunlukSatislar, fetchProfile, profile } = useStore();
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
      fetchGunlukSatislar();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGunlukSatislar();
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Son 7 günün toplamları
  const last7Days = gunlukSatislar.slice(0, 7);
  const totalLast7Days = last7Days.reduce((sum, s) => sum + s.toplam, 0);
  const avgDaily = last7Days.length > 0 ? totalLast7Days / last7Days.length : 0;

  // Bugünün satışı
  const today = new Date().toISOString().split('T')[0];
  const todaySales = gunlukSatislar.find(s => s.date === today);

  const renderSatisItem = ({ item }: { item: GunlukSatis }) => {
    const isToday = item.date === today;
    const onlineToplam = item.yemeksepeti + item.getir + item.trendyol + item.diger_online;

    return (
      <TouchableOpacity style={[styles.satisCard, isToday && styles.satisCardToday]}>
        <View style={styles.satisHeader}>
          <View style={styles.satisDateContainer}>
            <Calendar size={16} color={isToday ? '#10b981' : '#6b7280'} />
            <Text style={[styles.satisDate, isToday && styles.satisDateToday]}>
              {formatDate(item.date)}
              {isToday && ' (Bugün)'}
            </Text>
          </View>
          <Text style={styles.satisToplam}>{formatCurrency(item.toplam)}</Text>
        </View>

        <View style={styles.satisDetails}>
          <View style={styles.satisDetailItem}>
            <Wallet size={14} color="#10b981" />
            <Text style={styles.satisDetailLabel}>Nakit</Text>
            <Text style={styles.satisDetailValue}>{formatCurrency(item.nakit_satis)}</Text>
          </View>
          <View style={styles.satisDetailItem}>
            <CreditCard size={14} color="#3b82f6" />
            <Text style={styles.satisDetailLabel}>Kart</Text>
            <Text style={styles.satisDetailValue}>{formatCurrency(item.kredi_karti_satis)}</Text>
          </View>
          <View style={styles.satisDetailItem}>
            <Smartphone size={14} color="#f59e0b" />
            <Text style={styles.satisDetailLabel}>Online</Text>
            <Text style={styles.satisDetailValue}>{formatCurrency(onlineToplam)}</Text>
          </View>
        </View>

        {onlineToplam > 0 && (
          <View style={styles.onlineBreakdown}>
            {item.yemeksepeti > 0 && (
              <Text style={styles.onlineItem}>Yemeksepeti: {formatCurrency(item.yemeksepeti)}</Text>
            )}
            {item.getir > 0 && (
              <Text style={styles.onlineItem}>Getir: {formatCurrency(item.getir)}</Text>
            )}
            {item.trendyol > 0 && (
              <Text style={styles.onlineItem}>Trendyol: {formatCurrency(item.trendyol)}</Text>
            )}
            {item.diger_online > 0 && (
              <Text style={styles.onlineItem}>Diğer: {formatCurrency(item.diger_online)}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Günlük Satış</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Özet Kartlar */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Bugün</Text>
          <Text style={styles.summaryValue}>
            {todaySales ? formatCurrency(todaySales.toplam) : '₺0,00'}
          </Text>
          {!todaySales && (
            <TouchableOpacity
              style={styles.addTodayButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={14} color="#10b981" />
              <Text style={styles.addTodayText}>Satış Gir</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Son 7 Gün</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalLast7Days)}</Text>
          <Text style={styles.summarySubtext}>Ort: {formatCurrency(avgDaily)}/gün</Text>
        </View>
      </View>

      {/* Liste veya Boş Durum */}
      {gunlukSatislar.length > 0 ? (
        <FlatList
          data={gunlukSatislar}
          renderItem={renderSatisItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <TrendingUp size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Satış kaydı yok</Text>
          <Text style={styles.emptyText}>
            Günlük satış verilerinizi{'\n'}
            kaydetmeye başlayın
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Satış Gir</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Modal */}
      <AddGunlukSatisModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  summarySubtext: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  addTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
  },
  addTodayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  satisCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  satisCardToday: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  satisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  satisDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  satisDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  satisDateToday: {
    color: '#10b981',
    fontWeight: '600',
  },
  satisToplam: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  satisDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  satisDetailItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  satisDetailLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  satisDetailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  onlineBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  onlineItem: {
    fontSize: 11,
    color: '#6b7280',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
