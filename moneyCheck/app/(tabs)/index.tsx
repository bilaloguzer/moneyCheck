// Home screen - main dashboard with recent receipts, quick stats, capture button
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useReceiptListSupabase } from '@/lib/hooks/receipt/useReceiptListSupabase';
import { ReceiptCard } from '@/components/receipt/ReceiptCard';
import { useCallback, useState } from 'react';
import { Receipt } from '@/lib/types';
import { SkeletonAnalyticsCard, SkeletonList } from '@/components/common/Skeleton';
import { EmptyReceipts } from '@/components/common/EmptyState';
import { hapticLight, hapticMedium } from '@/lib/utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { receipts, loading, refetch } = useReceiptListSupabase(5, 0); // Fetch top 5 receipts
  const [refreshing, setRefreshing] = useState(false);

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

  // Calculate stats from loaded receipts (Note: ideally should be a separate aggregated query)
  // For now, we will use the data we have, but "This Month" requires checking dates.
  // Since useReceiptList is paginated, this stat might be inaccurate if we only load 5.
  // TODO: Create a separate hook for aggregated stats.
  // For immediate feedback, we will display stats based on the *recent* fetch if we wanted, 
  // but better to just show "Recent Activity" for now or use a separate stats hook.
  
  // Let's rely on the recent list for "Receipts" count at least if it's small, 
  // but paginatedResult returns totalCount!
  const totalReceipts = receipts?.totalCount || 0;
  
  // We can't easily calculate "This Month" total without fetching all receipts for this month.
  // I'll update the UI to show "Total Receipts" and maybe remove "This Month" until we add that endpoint/hook.
  // Or we can just calculate it from the displayed receipts as a placeholder "Recent Spending".

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to moneyCheck</Text>
        <Text style={styles.subtitle}>Scan receipts and track your spending</Text>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          hapticMedium();
          router.push('/receipt/capture');
        }}
      >
        <Ionicons name="camera" size={32} color="#fff" />
        <Text style={styles.scanButtonText}>Scan Receipt</Text>
      </TouchableOpacity>

      <View style={styles.quickStats}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        {loading && !refreshing && !receipts ? (
          <View style={styles.statsGrid}>
            <SkeletonAnalyticsCard />
            <SkeletonAnalyticsCard />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalReceipts}</Text>
              <Text style={styles.statLabel}>Total Receipts</Text>
            </View>
            {/* Placeholder for future specific stats */}
            <View style={styles.statCard}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Analytics Coming Soon</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Recent Receipts</Text>
             {totalReceipts > 0 && (
                 <TouchableOpacity onPress={() => {
                   hapticLight();
                   router.push('/(tabs)/history');
                 }}>
                     <Text style={styles.seeAllText}>See All</Text>
                 </TouchableOpacity>
             )}
        </View>
        
        {loading && !refreshing && !receipts ? (
          <View style={{ paddingHorizontal: 20 }}>
            <SkeletonList count={3} />
          </View>
        ) : receipts?.data && receipts.data.length > 0 ? (
            <View style={styles.list}>
                {receipts.data.map((receipt: Receipt) => (
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
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
              <EmptyReceipts 
                onAddReceipt={() => {
                  hapticMedium();
                  router.push('/receipt/capture');
                }} 
              />
            </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  header: {
    padding: 24,
    paddingTop: 60, // increased top padding for status bar
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#37352F',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#787774',
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#37352F',
    margin: 24,
    marginTop: 32,
    padding: 18,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  quickStats: {
    padding: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#787774',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#2C9364',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#37352F',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#787774',
  },
  recentSection: {
    padding: 24,
  },
  list: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#787774',
    fontSize: 14,
    marginTop: 32,
    lineHeight: 20,
  },
});
