// Analytics screen - spending summaries, charts, category breakdowns
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useReceiptList } from '@/lib/hooks/receipt/useReceiptList';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

export default function AnalyticsScreen() {
  const { receipts, loading, refetch } = useReceiptList(undefined, 1, 100);
  const [refreshing, setRefreshing] = useState(false);

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

  // Calculate simple analytics from receipts
  const totalSpent = receipts?.data?.reduce((sum, r) => sum + r.total, 0) || 0;
  const totalReceipts = receipts?.totalCount || 0;
  const averageSpent = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₺{totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalReceipts}</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>
      </View>

      <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₺{averageSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Average Receipt</Text>
          </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.emptySubtext}>
          More detailed charts and category breakdowns coming soon.
        </Text>
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
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#37352F',
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
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
  content: {
    padding: 24,
    alignItems: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#787774',
    textAlign: 'center',
    lineHeight: 20,
  },
});
