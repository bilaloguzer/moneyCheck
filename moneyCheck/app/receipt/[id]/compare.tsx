// Price comparison screen - shows price comparisons and savings opportunities for receipt items
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { ReceiptRepository } from '@/lib/database/repositories/ReceiptRepository';
import {  PriceHistoryService, PriceComparisonService } from '@/lib/services/price';
import type { PriceHistoryEntry, PriceStats, PriceComparison } from '@/lib/services/price';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function PriceComparisonScreen() {
  const {id} = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { db } = useDatabaseContext();
  const { t } = useLocalization();
  
  const [loading, setLoading] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [marketComparison, setMarketComparison] = useState<{
    comparison: PriceComparison & { sampleSize?: number; isRealData: boolean };
    marketData: any;
    allPrices: any[];
  } | null>(null);
  
  useEffect(() => {
    if (!db || !id) return;
    
    const loadData = async () => {
      try {
        const repository = new ReceiptRepository(db);
        const receipt = await repository.findById(parseInt(id));
        
        if (!receipt || !receipt.items || receipt.items.length === 0) {
          setLoading(false);
          return;
        }
        
        setReceiptData(receipt);
        await loadItemComparison(receipt, 0);
      } catch (error) {
        console.error('Error loading price comparison:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [db, id]);
  
  const loadItemComparison = async (receipt: any, itemIndex: number) => {
    if (!db || !receipt.items[itemIndex]) return;
    
    const item = receipt.items[itemIndex];
    setSelectedItemIndex(itemIndex);
    
    try {
      // Load price history
      const history = await PriceHistoryService.getUserPriceHistory(
        db,
        item.name,
        10
      );
      setPriceHistory(history);
      
      // Load price statistics
      const stats = await PriceHistoryService.getPriceStatistics(
        db,
        item.name
      );
      setPriceStats(stats);
      
      // Generate market comparison (hybrid: real + mock fallback)
      const comparison = await PriceComparisonService.getFullMarketComparison(
        item.name,
        item.unitPrice,
        receipt.merchantName || 'Unknown',
        true // Use real data when available
      );
      setMarketComparison(comparison);
    } catch (error) {
      console.error('Error loading item comparison:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#37352F" />
        <Text style={styles.loadingText}>{t('receipt.loadingComparison')}</Text>
      </View>
    );
  }

  if (!receiptData || !receiptData.items || receiptData.items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="pricetag-outline" size={64} color="#E9E9E7" />
        <Text style={styles.errorText}>{t('receipt.noItemsToCompare')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t('receipt.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const selectedItem = receiptData.items[selectedItemIndex];
  const rankColor = marketComparison ? PriceComparisonService.getRankColor(marketComparison.comparison.rank) : '#787774';
  const rankLabel = marketComparison ? PriceComparisonService.getRankLabel(marketComparison.comparison.rank, t) : '';
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#37352F" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('receipt.priceComparison')}</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Item Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('receipt.selectItem')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemSelector}>
            {receiptData.items.map((item: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.itemChip,
                  selectedItemIndex === index && styles.itemChipSelected
                ]}
                onPress={() => loadItemComparison(receiptData, index)}
              >
                <Text style={[
                  styles.itemChipText,
                  selectedItemIndex === index && styles.itemChipTextSelected
                ]}>
                  {item.name}
                </Text>
                <Text style={[
                  styles.itemChipPrice,
                  selectedItemIndex === index && styles.itemChipPriceSelected
                ]}>
                  {item.unitPrice.toFixed(2)} ₺
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Current Purchase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('receipt.yourPurchase')}</Text>
          <View style={[styles.priceCard, { borderLeftColor: rankColor, borderLeftWidth: 4 }]}>
            <View style={styles.priceCardHeader}>
              <View>
                <Text style={styles.productName}>{selectedItem.name}</Text>
                <Text style={styles.storeName}>{receiptData.merchantName || t('receipt.unknownStore')}</Text>
              </View>
              <Text style={styles.currentPrice}>{selectedItem.unitPrice.toFixed(2)} ₺</Text>
            </View>

            {marketComparison && (
              <View style={[styles.rankBadge, { backgroundColor: `${rankColor}15`, borderColor: rankColor }]}>
                <Ionicons
                  name={marketComparison.comparison.rank === 'excellent' || marketComparison.comparison.rank === 'good' ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={rankColor}
                />
                <Text style={[styles.rankText, { color: rankColor }]}>{rankLabel}</Text>
              </View>
            )}

            {priceStats && priceStats.count > 1 && (
              <Text style={styles.comparisonText}>
                {((selectedItem.unitPrice - priceStats.min) / priceStats.min * 100).toFixed(1)}% {t('receipt.fromBestPrice')}
              </Text>
            )}
          </View>
        </View>

        {/* Price History Chart */}
        {priceHistory.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('receipt.yourPriceHistory')}</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={priceHistory.slice(0, 8).reverse().map((entry) => ({
                  value: entry.price,
                  label: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  labelTextStyle: { fontSize: 9, color: '#787774' }
                }))}
                width={320}
                height={180}
                spacing={40}
                color="#2C9364"
                thickness={2}
                startFillColor="rgba(44, 147, 100, 0.3)"
                endFillColor="rgba(44, 147, 100, 0.05)"
                startOpacity={0.9}
                endOpacity={0.2}
                initialSpacing={10}
                noOfSections={4}
                yAxisColor="#E9E9E7"
                xAxisColor="#E9E9E7"
                yAxisTextStyle={{ color: '#787774', fontSize: 10 }}
                yAxisLabelSuffix=" ₺"
                hideRules
                curved
                areaChart
              />
            </View>
          </View>
        )}
        
        {/* Personal Statistics */}
        {priceStats && priceStats.count > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('receipt.yourStatistics')}</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="trending-down" size={20} color="#2C9364" />
                <Text style={styles.statValue}>₺{priceStats.min.toFixed(2)}</Text>
                <Text style={styles.statLabel}>{t('receipt.bestPrice')}</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trending-up" size={20} color="#E03E3E" />
                <Text style={styles.statValue}>₺{priceStats.max.toFixed(2)}</Text>
                <Text style={styles.statLabel}>{t('receipt.worstPrice')}</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="stats-chart" size={20} color="#787774" />
                <Text style={styles.statValue}>₺{priceStats.average.toFixed(2)}</Text>
                <Text style={styles.statLabel}>{t('receipt.average')}</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="receipt" size={20} color="#787774" />
                <Text style={styles.statValue}>{priceStats.count}x</Text>
                <Text style={styles.statLabel}>{t('receipt.purchased')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Market Comparison */}
        {marketComparison && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('receipt.marketComparison')}</Text>
              <View style={styles.dataSourceBadge}>
                <Ionicons
                  name={marketComparison.comparison.isRealData ? "people" : "flask"}
                  size={12}
                  color="#787774"
                />
                <Text style={styles.dataSourceText}>
                  {marketComparison.comparison.isRealData
                    ? `${marketComparison.comparison.sampleSize || 0} ${t('receipt.pricesStore')}`
                    : t('receipt.estimated')}
                </Text>
              </View>
            </View>
            <View style={styles.marketCard}>
              <View style={styles.marketRow}>
                <Text style={styles.marketLabel}>{t('receipt.marketAverage')}</Text>
                <Text style={styles.marketValue}>₺{marketComparison.comparison.marketAverage.toFixed(2)}</Text>
              </View>
              <View style={styles.marketRow}>
                <Text style={styles.marketLabel}>{t('receipt.yourPrice')}</Text>
                <Text style={[
                  styles.marketValue,
                  { color: marketComparison.comparison.difference > 0 ? '#E03E3E' : '#2C9364' }
                ]}>
                  {marketComparison.comparison.difference > 0 ? '+' : ''}
                  {marketComparison.comparison.percentDifference.toFixed(1)}%
                </Text>
              </View>
              {marketComparison.comparison.savingsOpportunity > 0 && (
                <View style={[styles.savingsBanner, { backgroundColor: '#2C936415' }]}>
                  <Ionicons name="wallet-outline" size={18} color="#2C9364" />
                  <Text style={styles.savingsText}>
                    {PriceComparisonService.getSavingsMessage(marketComparison.comparison.savingsOpportunity, t)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Prices by Store */}
        {marketComparison && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('receipt.pricesByStore')}</Text>
            {marketComparison.allPrices.map((entry, index) => {
              const isUserStore = entry.isUserPrice;
              const isCheapest = entry.price === marketComparison.comparison.cheapestPrice;
              const isExpensive = entry.price === marketComparison.comparison.mostExpensivePrice;

              return (
                <View
                  key={index}
                  style={[
                    styles.storeRow,
                    isUserStore && styles.storeRowHighlight
                  ]}
                >
                  <View style={styles.storeLeft}>
                    <View style={[
                      styles.storeIndicator,
                      { backgroundColor: isCheapest ? '#2C9364' : isExpensive ? '#E03E3E' : '#787774' }
                    ]} />
                    <Text style={[
                      styles.storeName,
                      isUserStore && styles.storeNameHighlight
                    ]}>
                      {entry.store}
                      {isUserStore && ` (${t('receipt.you')})`}
                    </Text>
                  </View>
                  <View style={styles.storeRight}>
                    <Text style={[
                      styles.storePrice,
                      isUserStore && styles.storePriceHighlight
                    ]}>
                      ₺{entry.price.toFixed(2)}
                    </Text>
                    {isCheapest && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{t('receipt.best')}</Text>
                      </View>
                    )}
                    {isExpensive && !isCheapest && (
                      <View style={[styles.badge, { backgroundColor: '#E03E3E15', borderColor: '#E03E3E' }]}>
                        <Text style={[styles.badgeText, { color: '#E03E3E' }]}>{t('receipt.highest')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
      </View>
    </>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#787774',
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginTop: 16,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#37352F',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37352F',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#787774',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F7F6F3',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  dataSourceText: {
    fontSize: 10,
    color: '#787774',
    fontWeight: '600',
  },
  itemSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  itemChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9E9E7',
    marginRight: 8,
    minWidth: 120,
  },
  itemChipSelected: {
    borderColor: '#2C9364',
    backgroundColor: '#2C936410',
  },
  itemChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 4,
  },
  itemChipTextSelected: {
    color: '#2C9364',
  },
  itemChipPrice: {
    fontSize: 12,
    color: '#787774',
  },
  itemChipPriceSelected: {
    color: '#2C9364',
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  priceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#787774',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#37352F',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  comparisonText: {
    fontSize: 13,
    color: '#787774',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#37352F',
  },
  statLabel: {
    fontSize: 12,
    color: '#787774',
  },
  marketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    gap: 12,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  marketLabel: {
    fontSize: 15,
    color: '#787774',
  },
  marketValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C9364',
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  storeRowHighlight: {
    backgroundColor: '#2C936410',
    borderColor: '#2C9364',
    borderWidth: 2,
  },
  storeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  storeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37352F',
  },
  storeNameHighlight: {
    fontWeight: '700',
    color: '#2C9364',
  },
  storeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
  },
  storePriceHighlight: {
    fontSize: 18,
    color: '#2C9364',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2C936415',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2C9364',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C9364',
  },
});
