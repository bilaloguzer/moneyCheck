// Receipt detail screen - view/edit receipt details with merchant, date, total, line items
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { ReceiptRepository } from '@/lib/database/repositories/ReceiptRepository';
import { useEffect, useState } from 'react';
import { Receipt } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { PieChart } from 'react-native-gifted-charts';
import { getCategoryDisplayName, getCategoryColor } from '@/lib/constants/categories';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { hapticSuccess, hapticError, hapticWarning } from '@/lib/utils/haptics';

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { db } = useDatabaseContext();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [categoryStats, setCategoryStats] = useState<{
    name: string;
    value: number;
    color: string;
    percentage: number;
    count: number;
  }[]>([]);

  useEffect(() => {
    if (!db || !id) return;
    
    const loadReceipt = async () => {
      try {
        const repository = new ReceiptRepository(db);
        const data = await repository.findById(parseInt(id));
        console.log('Loaded receipt:', data);
        console.log('Image path:', data?.imagePath);
        setReceipt(data);
        
        // Calculate category statistics
        if (data?.items) {
          const categoryMap = new Map<string, { total: number; count: number }>();
          let totalAmount = 0;
          
          data.items.forEach(item => {
            const category = item.category || 'other';
            const itemTotal = (item.quantity || 1) * (item.unitPrice || 0) - (item.discount || 0);
            totalAmount += itemTotal;
            
            const current = categoryMap.get(category) || { total: 0, count: 0 };
            categoryMap.set(category, {
              total: current.total + itemTotal,
              count: current.count + 1
            });
          });
          
          const stats = Array.from(categoryMap.entries()).map(([category, data]) => ({
            name: getCategoryDisplayName(category),
            value: data.total,
            color: getCategoryColor(category),
            percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
            count: data.count
          })).sort((a, b) => b.value - a.value);
          
          setCategoryStats(stats);
        }
      } catch (error) {
        console.error('Failed to load receipt:', error);
        hapticError();
        showErrorToast('Failed to load receipt details');
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [db, id]);

  const handleDelete = async () => {
    if (!db || !id) return;

    hapticWarning();
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const repository = new ReceiptRepository(db);
              await repository.delete(parseInt(id));
              hapticSuccess();
              showSuccessToast('Receipt deleted successfully');
              router.back();
            } catch (error) {
              console.error('Failed to delete receipt:', error);
              hapticError();
              showErrorToast('Failed to delete receipt');
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#37352F" />
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={64} color="#E9E9E7" />
        <Text style={styles.errorText}>Receipt not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#37352F" />
          </TouchableOpacity>
          <Text style={styles.title}>Receipt Details</Text>
          <TouchableOpacity onPress={handleDelete} disabled={deleting}>
            <Ionicons name="trash-outline" size={24} color="#E03E3E" />
          </TouchableOpacity>
        </View>

        {/* Receipt Image */}
        {receipt.imagePath ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: receipt.imagePath }} 
              style={styles.image}
              resizeMode="contain"
              onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
              onLoad={() => console.log('Image loaded successfully')}
            />
          </View>
        ) : (
          <View style={[styles.imageContainer, { justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="image-outline" size={48} color="#E9E9E7" />
            <Text style={{ color: '#787774', marginTop: 8 }}>No image available</Text>
          </View>
        )}

        {/* Merchant Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="storefront-outline" size={20} color="#787774" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Merchant</Text>
              <Text style={styles.infoValue}>{receipt.merchantName || 'Unknown'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#787774" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(receipt.date)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#787774" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Total Amount</Text>
              <Text style={[styles.infoValue, styles.totalAmount]}>
                {receipt.total?.toFixed(2)} ₺
              </Text>
            </View>
          </View>
        </View>

        {/* Category Analysis */}
        {categoryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <PieChart
                data={categoryStats.map(cat => ({
                  value: cat.value,
                  color: cat.color,
                  text: `${cat.percentage.toFixed(0)}%`,
                }))}
                donut
                showText
                textColor="#37352F"
                radius={80}
                innerRadius={45}
                textSize={12}
                fontWeight="600"
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#37352F' }}>
                      ₺{receipt.total?.toFixed(0)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#787774' }}>Total</Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.statsContainer}>
              {categoryStats.map((stat, index) => (
                <View key={index} style={styles.statRow}>
                  <View style={styles.statLeft}>
                    <View style={[styles.colorDot, { backgroundColor: stat.color }]} />
                    <Text style={styles.statName}>{stat.name}</Text>
                    <Text style={styles.statCount}>({stat.count})</Text>
                  </View>
                  <View style={styles.statRight}>
                    <Text style={styles.statValue}>₺{stat.value.toFixed(2)}</Text>
                    <Text style={styles.statPercentage}>{stat.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Line Items */}
        {receipt.items && receipt.items.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({receipt.items.length})</Text>
            {receipt.items.map((item, index) => {
              const categoryColor = getCategoryColor(item.category || 'other');
              return (
                <View 
                  key={index} 
                  style={[
                    styles.itemCard,
                    { 
                      backgroundColor: `${categoryColor}15`,
                      borderLeftWidth: 4,
                      borderLeftColor: categoryColor,
                    }
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                      <Text style={styles.itemName}>{item.name || 'Unknown Item'}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {((item.quantity || 1) * (item.unitPrice || 0) - (item.discount || 0)).toFixed(2)} ₺
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemDetailText}>
                      {item.quantity || 1} × {(item.unitPrice || 0).toFixed(2)} ₺
                    </Text>
                    {(item.discount && item.discount > 0) ? (
                      <Text style={styles.itemDiscount}>
                        -{item.discount.toFixed(2)} ₺ discount
                      </Text>
                    ) : null}
                    {item.category ? (
                      <View style={[styles.categoryBadge, { backgroundColor: categoryColor, borderColor: categoryColor }]}>
                        <Text style={[styles.categoryText, { color: '#FFFFFF' }]}>
                          {getCategoryDisplayName(item.category)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* OCR Confidence */}
        {receipt.ocrConfidence !== undefined && (
          <View style={styles.confidenceContainer}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#787774" />
            <Text style={styles.confidenceText}>
              OCR Confidence: {(receipt.ocrConfidence * 100).toFixed(0)}%
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37352F',
    flex: 1,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#787774',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#37352F',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C9364',
  },
  itemCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37352F',
    flex: 1,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37352F',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemDetailText: {
    fontSize: 13,
    color: '#787774',
  },
  itemDiscount: {
    fontSize: 12,
    color: '#E03E3E',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#F7F6F3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  categoryText: {
    fontSize: 11,
    color: '#787774',
    fontWeight: '600',
  },
  statsContainer: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E720',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#37352F',
  },
  statCount: {
    fontSize: 12,
    color: '#787774',
  },
  statRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37352F',
  },
  statPercentage: {
    fontSize: 11,
    color: '#787774',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  confidenceText: {
    fontSize: 13,
    color: '#787774',
  },
});
