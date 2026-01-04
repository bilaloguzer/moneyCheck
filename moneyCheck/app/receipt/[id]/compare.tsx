// Price Comparison Screen - Shows price trends and comparisons
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { SupabaseReceiptService } from '@/lib/services/SupabaseReceiptService';
import { ProductMatchingService } from '@/lib/services/ProductMatchingService';
import { BarcodeScannerModal } from '@/components/scanner/BarcodeScannerModal';
import { OpenFoodFactsService } from '@/lib/services/OpenFoodFactsService';
import { LineChart } from 'react-native-gifted-charts';
import { useLocalization } from '@/contexts/LocalizationContext';

export default function PriceComparisonScreen() {
  const { t } = useLocalization();
  const { id, productName: initialProductName } = useLocalSearchParams<{
    id?: string;
    productName?: string;
  }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialProductName || '');
  const [showScanner, setShowScanner] = useState(false);
  
  const [priceData, setPriceData] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [openFoodData, setOpenFoodData] = useState<any>(null);

  useEffect(() => {
    if (searchQuery) {
      loadPriceComparison();
    }
  }, [searchQuery]);

  const loadPriceComparison = async () => {
    setLoading(true);
    try {
      // Get price comparison from Edge Function
      const { data, error } = await SupabaseReceiptService.getPriceComparison(
        searchQuery
      );

      if (data) {
        setPriceData(data);
        
        // Try to enrich with Open Food Facts
        const enrichment = await OpenFoodFactsService.enrichLineItem(
          undefined,
          searchQuery
        );
        setOpenFoodData(enrichment);
      }
    } catch (error) {
      console.error('Error loading price comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setLoading(true);
    try {
      // Get product from Open Food Facts
      const { data: product } = await OpenFoodFactsService.getProductByBarcode(barcode);
      
      if (product) {
        const standardizedName = OpenFoodFactsService.getStandardizedName(product);
        setSearchQuery(standardizedName);
        setOpenFoodData({
          standardizedName,
          brand: OpenFoodFactsService.getBrand(product),
          category: OpenFoodFactsService.getMainCategory(product),
          imageUrl: product.image_front_small_url || product.image_url,
        });
      }
    } catch (error) {
      console.error('Error processing barcode:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return `₺${price.toFixed(2)}`;
  };

  // Prepare chart data
  const chartData = priceData?.priceHistory
    ?.slice(-10) // Last 10 data points
    ?.map((item: any) => ({
      value: item.price,
      label: formatDate(item.date),
      dataPointText: formatPrice(item.price),
    })) || [];

  if (loading && !priceData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#37352F" />
          </TouchableOpacity>
          <Text style={styles.title}>Price Comparison</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#37352F" />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#37352F" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('priceComparison.title')}</Text>
          <TouchableOpacity onPress={() => setShowScanner(true)} style={styles.scanButton}>
            <Ionicons name="barcode-outline" size={24} color="#37352F" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#787774" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('priceComparison.searchPlaceholder')}
              placeholderTextColor="#787774"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={loadPriceComparison}
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#787774" />
              </TouchableOpacity>
            )}
          </View>

          {priceData ? (
            <>
              {/* Product Info */}
              <View style={styles.productCard}>
                <Text style={styles.productName}>{priceData.productName}</Text>
                {openFoodData?.brand && (
                  <Text style={styles.brand}>{openFoodData.brand}</Text>
                )}

                {/* Price Stats */}
                <View style={styles.priceStats}>
                  <View style={styles.priceStat}>
                    <Text style={styles.priceLabel}>{t('priceComparison.average')}</Text>
                    <Text style={styles.priceValue}>{formatPrice(priceData.averagePrice)}</Text>
                  </View>
                  <View style={styles.priceStat}>
                    <Text style={styles.priceLabel}>{t('priceComparison.min')}</Text>
                    <Text style={[styles.priceValue, { color: '#2C9364' }]}>
                      {formatPrice(priceData.minPrice)}
                    </Text>
                  </View>
                  <View style={styles.priceStat}>
                    <Text style={styles.priceLabel}>{t('priceComparison.max')}</Text>
                    <Text style={[styles.priceValue, { color: '#E03E3E' }]}>
                      {formatPrice(priceData.maxPrice)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Price Trend Chart */}
              {chartData.length > 0 && (
                <View style={styles.chartCard}>
                  <Text style={styles.sectionTitle}>{t('priceComparison.priceTrend')}</Text>
                  <LineChart
                    data={chartData}
                    width={300}
                    height={200}
                    spacing={40}
                    color="#2C9364"
                    thickness={3}
                    startFillColor="rgba(44, 147, 100, 0.3)"
                    endFillColor="rgba(44, 147, 100, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={5}
                    yAxisColor="#E9E9E7"
                    xAxisColor="#E9E9E7"
                    yAxisTextStyle={{ color: '#787774', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#787774', fontSize: 10 }}
                    dataPointsColor="#2C9364"
                    dataPointsRadius={5}
                    textShiftY={-10}
                    textShiftX={-5}
                    textFontSize={10}
                    textColor="#37352F"
                  />
                </View>
              )}

              {/* Recommendations */}
              {priceData.recommendations && priceData.recommendations.length > 0 && (
                <View style={styles.recommendationsCard}>
                  <Text style={styles.sectionTitle}>{t('priceComparison.insights')}</Text>
                  {priceData.recommendations.map((rec: string, index: number) => (
                    <View key={index} style={styles.recommendation}>
                      <Ionicons name="bulb-outline" size={20} color="#F5A623" />
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Price History */}
              <View style={styles.historyCard}>
                <Text style={styles.sectionTitle}>
                  {t('priceComparison.priceHistory')} ({priceData.priceHistory?.length || 0} {t('priceComparison.records')})
                </Text>
                {priceData.priceHistory?.map((item: any, index: number) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyLeft}>
                      <Ionicons name="storefront-outline" size={20} color="#787774" />
                      <View>
                        <Text style={styles.merchantName}>{item.merchant}</Text>
                        <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                      </View>
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyPrice}>{formatPrice(item.price)}</Text>
                      <Text style={styles.historyQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#E9E9E7" />
              <Text style={styles.emptyTitle}>{t('priceComparison.searchPrompt')}</Text>
              <Text style={styles.emptyText}>
                {t('priceComparison.searchDescription')}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <BarcodeScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />
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
  backButton: {
    padding: 4,
  },
  scanButton: {
    padding: 4,
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
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#37352F',
    padding: 0,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#37352F',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: '#787774',
    marginBottom: 16,
  },
  priceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9E9E7',
  },
  priceStat: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#787774',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#37352F',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 16,
  },
  recommendationsCard: {
    backgroundColor: '#FFF9E6',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5A623',
    marginBottom: 16,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#37352F',
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E720',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#37352F',
  },
  historyDate: {
    fontSize: 12,
    color: '#787774',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37352F',
  },
  historyQuantity: {
    fontSize: 12,
    color: '#787774',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37352F',
  },
  emptyText: {
    fontSize: 14,
    color: '#787774',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
