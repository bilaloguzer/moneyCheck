// History screen - list of all receipts with search and filter options
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useReceiptListSupabase } from '@/lib/hooks/receipt/useReceiptListSupabase';
import { ReceiptCard } from '@/components/receipt/ReceiptCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { Receipt } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { SkeletonList } from '@/components/common/Skeleton';
import { EmptyReceipts } from '@/components/common/EmptyState';
import { hapticLight } from '@/lib/utils/haptics';

export default function HistoryScreen() {
  const router = useRouter();
  const { receipts, loading, refetch } = useReceiptListSupabase(100, 0); // Fetch up to 100
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Filter and sort receipts
  const filteredReceipts = useMemo(() => {
    if (!receipts?.data) return [];

    let filtered = receipts.data;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((receipt: Receipt) => 
        receipt.merchantName?.toLowerCase().includes(query) ||
        receipt.totalAmount?.toString().includes(query)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const amountA = a.totalAmount || 0;
        const amountB = b.totalAmount || 0;
        return sortOrder === 'asc' ? amountA - amountB : amountB - amountA;
      }
    });

    return filtered;
  }, [receipts?.data, searchQuery, sortBy, sortOrder]);

  if (loading && !refreshing && !receipts) {
    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>History</Text>
          </View>
          <ActivityIndicator size="large" color="#37352F" style={{marginTop: 40}} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons name="funnel-outline" size={20} color="#37352F" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#787774" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by merchant or amount..."
          placeholderTextColor="#787774"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#787774" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsText}>
          {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Receipt List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredReceipts.length > 0 ? (
          <View style={styles.list}>
            {filteredReceipts.map((receipt: Receipt) => (
              <ReceiptCard 
                key={receipt.id} 
                receipt={receipt} 
                onPress={() => {
                  hapticLight();
                  router.push(`/receipt/${receipt.id}`);
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.content}>
            <Ionicons name="receipt-outline" size={64} color="#E9E9E7" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching receipts' : 'No receipts yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term' : 'Your scanned receipts will appear here'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort & Filter</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#37352F" />
              </TouchableOpacity>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionButton, sortBy === 'date' && styles.optionButtonActive]}
                  onPress={() => setSortBy('date')}
                >
                  <Ionicons name="calendar-outline" size={20} color={sortBy === 'date' ? '#FFFFFF' : '#787774'} />
                  <Text style={[styles.optionText, sortBy === 'date' && styles.optionTextActive]}>
                    Date
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, sortBy === 'amount' && styles.optionButtonActive]}
                  onPress={() => setSortBy('amount')}
                >
                  <Ionicons name="cash-outline" size={20} color={sortBy === 'amount' ? '#FFFFFF' : '#787774'} />
                  <Text style={[styles.optionText, sortBy === 'amount' && styles.optionTextActive]}>
                    Amount
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort Order */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Order</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[styles.optionButton, sortOrder === 'desc' && styles.optionButtonActive]}
                  onPress={() => setSortOrder('desc')}
                >
                  <Ionicons name="arrow-down-outline" size={20} color={sortOrder === 'desc' ? '#FFFFFF' : '#787774'} />
                  <Text style={[styles.optionText, sortOrder === 'desc' && styles.optionTextActive]}>
                    Newest First
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, sortOrder === 'asc' && styles.optionButtonActive]}
                  onPress={() => setSortOrder('asc')}
                >
                  <Ionicons name="arrow-up-outline" size={20} color={sortOrder === 'asc' ? '#FFFFFF' : '#787774'} />
                  <Text style={[styles.optionText, sortOrder === 'asc' && styles.optionTextActive]}>
                    Oldest First
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#37352F',
    letterSpacing: -0.5,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#37352F',
    padding: 0,
  },
  resultsCount: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 13,
    color: '#787774',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  list: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#787774',
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#37352F',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    backgroundColor: '#F7F6F3',
  },
  optionButtonActive: {
    backgroundColor: '#2C9364',
    borderColor: '#2C9364',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#787774',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  applyButton: {
    backgroundColor: '#37352F',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
