// Analytics screen - spending summaries, charts, category breakdowns
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAnalytics, TimeRange } from '@/lib/hooks/analytics/useAnalytics';
import { PieChart, BarChart } from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<TimeRange>('month');
  const { data, loading, refetch } = useAnalytics(range);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch, range])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderPeriodSelector = () => (
      <View style={styles.periodContainer}>
          {(['week', 'month', 'year', 'all'] as TimeRange[]).map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[styles.periodButton, range === p && styles.periodButtonActive]}
                onPress={() => setRange(p)}
              >
                  <Text style={[styles.periodText, range === p && styles.periodTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
              </TouchableOpacity>
          ))}
      </View>
  );

  return (
    <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        {renderPeriodSelector()}
      </View>

      <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₺{data?.totalSpent.toFixed(0) || '0'}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data?.receiptCount || '0'}</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>
      </View>

      {/* Category Chart */}
      <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
            <View style={{ alignItems: 'center' }}>
                <PieChart
                    data={data.categoryBreakdown}
                    donut
                    showText
                    textColor="black"
                    radius={120}
                    innerRadius={60}
                    textSize={12}
                    labelsPosition='outward'
                />
            </View>
          ) : (
            <Text style={styles.emptyText}>No category data for this period</Text>
          )}
      </View>

      {/* Daily Trend Chart */}
      <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Spending Trend</Text>
          {data?.dailySpending && data.dailySpending.length > 0 ? (
             <BarChart
                data={data.dailySpending}
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="#37352F"
                yAxisThickness={0}
                xAxisThickness={0}
                width={screenWidth - 80}
                isAnimated
             />
          ) : (
             <Text style={styles.emptyText}>No spending history for this period</Text>
          )}
      </View>

      {/* Top Items List */}
      <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Top Items</Text>
          {data?.topItems && data.topItems.map((item, index) => (
              <View key={index} style={styles.listItem}>
                  <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>{item.count} purchases</Text>
                  </View>
                  <Text style={styles.itemPrice}>₺{item.totalSpent.toFixed(2)}</Text>
              </View>
          ))}
          {(!data?.topItems || data.topItems.length === 0) && <Text style={styles.emptyText}>No items found</Text>}
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
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  periodContainer: {
      flexDirection: 'row',
      backgroundColor: '#F0F0F0',
      borderRadius: 8,
      padding: 4,
  },
  periodButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
  },
  periodButtonActive: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
  },
  periodText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#787774',
  },
  periodTextActive: {
      color: '#37352F',
      fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
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
  chartCard: {
      backgroundColor: '#FFFFFF',
      marginHorizontal: 20,
      marginBottom: 20,
      padding: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E9E9E7',
  },
  chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#37352F',
      marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20
  },
  listSection: {
      paddingHorizontal: 20,
      paddingBottom: 40,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
      color: '#37352F',
  },
  listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#E9E9E7',
  },
  rankBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#F0F0F0',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  rankText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#787774',
  },
  itemName: {
      fontSize: 15,
      fontWeight: '500',
      color: '#37352F',
  },
  itemMeta: {
      fontSize: 12,
      color: '#787774',
  },
  itemPrice: {
      fontSize: 15,
      fontWeight: '600',
      color: '#37352F',
  },
});
