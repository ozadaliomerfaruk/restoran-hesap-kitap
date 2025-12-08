import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Users, Building2 } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';
import AddCariModal from '../../src/components/AddCariModal';
import { CariType } from '../../src/types';

export default function Cari() {
  const { cariler, loadingCariler, fetchCariler, fetchProfile, profile } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | CariType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (profile?.restaurant_id) {
      fetchCariler();
    }
  }, [profile?.restaurant_id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCariler();
    setRefreshing(false);
  };

  const filteredCariler = cariler.filter(cari => {
    if (filter === 'all') return true;
    return cari.type === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const renderCariItem = ({ item }: { item: typeof cariler[0] }) => (
    <TouchableOpacity style={styles.cariCard}>
      <View style={styles.cariLeft}>
        <View style={[
          styles.cariIcon,
          { backgroundColor: item.type === 'tedarikci' ? '#dbeafe' : '#dcfce7' }
        ]}>
          {item.type === 'tedarikci' ? (
            <Building2 size={20} color="#3b82f6" />
          ) : (
            <Users size={20} color="#10b981" />
          )}
        </View>
        <View style={styles.cariInfo}>
          <Text style={styles.cariName}>{item.name}</Text>
          <Text style={styles.cariType}>
            {item.type === 'tedarikci' ? 'Tedarikçi' : 'Müşteri'}
          </Text>
        </View>
      </View>
      <View style={styles.cariRight}>
        <Text style={[
          styles.cariBalance,
          { color: item.balance >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          {formatCurrency(item.balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cariler</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TouchableOpacity style={styles.searchBar}>
        <Search size={20} color="#9ca3af" />
        <Text style={styles.searchText}>Cari ara...</Text>
      </TouchableOpacity>

      {/* Filtreler */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tümü ({cariler.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'tedarikci' && styles.filterButtonActive]}
          onPress={() => setFilter('tedarikci')}
        >
          <Building2 size={16} color={filter === 'tedarikci' ? '#fff' : '#6b7280'} />
          <Text style={[styles.filterText, filter === 'tedarikci' && styles.filterTextActive]}>
            Tedarikçi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'musteri' && styles.filterButtonActive]}
          onPress={() => setFilter('musteri')}
        >
          <Users size={16} color={filter === 'musteri' ? '#fff' : '#6b7280'} />
          <Text style={[styles.filterText, filter === 'musteri' && styles.filterTextActive]}>
            Müşteri
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste veya Boş Durum */}
      {filteredCariler.length > 0 ? (
        <FlatList
          data={filteredCariler}
          renderItem={renderCariItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Users size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>Henüz cari hesap yok</Text>
          <Text style={styles.emptyText}>
            Tedarikçi veya müşteri eklemek için{'\n'}
            sağ üstteki + butonuna tıklayın
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>İlk Cariyi Ekle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Modal */}
      <AddCariModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  cariCard: {
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
  cariLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cariIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cariInfo: {
    flex: 1,
  },
  cariName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cariType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cariRight: {
    alignItems: 'flex-end',
  },
  cariBalance: {
    fontSize: 16,
    fontWeight: '600',
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
