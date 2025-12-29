// History screen - list of all receipts with search and filter options
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useReceiptList } from '@/lib/hooks/receipt/useReceiptList';
import { ReceiptCard } from '@/components/receipt/ReceiptCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Receipt } from '@/lib/types';
import { SkeletonList } from '@/components/common/Skeleton';
import { EmptyReceipts } from '@/components/common/EmptyState';
import { hapticLight } from '@/lib/utils/haptics';

export default function HistoryScreen() {
  const router = useRouter();
  const { receipts, loading, refetch } = useReceiptList(undefined, 1, 50); // Fetch up to 50 for now
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

  if (loading && !refreshing && !receipts) {
    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>History</Text>
          </View>
          <View style={{ padding: 20 }}>
            <SkeletonList count={5} />
          </View>
        </View>
    );
  }

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {receipts?.data && receipts.data.length > 0 ? (
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
          <EmptyReceipts onAddReceipt={() => router.push('/receipt/capture')} />
      )}
    </ScrollView>
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
  list: {
    padding: 20,
    gap: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#787774',
    lineHeight: 20,
  },
});
