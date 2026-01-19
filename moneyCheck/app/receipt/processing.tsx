import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { OCRService } from '@/lib/services/ocr/OCRService';
import type { OCRResult, Receipt } from '@/lib/types';
import { Button } from '@/components/common/Button';
import { CategoryDropdown } from '@/components/common/CategoryDropdown';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { ReceiptRepository } from '@/lib/database/repositories/ReceiptRepository';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalization } from '@/contexts/LocalizationContext';
import { getCategoryMatcher } from '@/lib/services/ocr/CategoryMatcher';

export default function ProcessingScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const receiptDataParam = params.receiptData as string | undefined;
  const source = params.source as string | undefined;
  const router = useRouter();
  const { db } = useDatabaseContext();
  const { t, locale } = useLocalization();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<any[]>([]);
  const [extractedTotal, setExtractedTotal] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    async function processImage() {
      try {
        let data: OCRResult;
        
        // Check if we have pre-extracted receipt data (from PDF or QR)
        if (receiptDataParam) {
          console.log('Using pre-extracted receipt data from:', source || 'unknown');
          data = JSON.parse(receiptDataParam);
          console.log('Parsed receipt data:', data);
        } else if (!imageUri) {
          // No image and no pre-extracted data
          setError('No image or data provided');
          setLoading(false);
          return;
        } else {
          // Standard image OCR flow
          const service = new OCRService();
          
          console.log('Starting automatic QR detection...');
          
          // Step 1: Automatically detect QR code in image
          const qrDetection = await service.detectAndExtractQR(imageUri);
          
          // Step 2: Process based on QR detection result
          if (qrDetection.hasQR && qrDetection.qrData) {
            console.log('✓ QR Code detected! Using hybrid mode.');
            
            // Try to parse QR data with error handling
            try {
              const QRCodeService = (await import('@/lib/services/qr')).QRCodeService;
              const qrResult = await QRCodeService.processQRCode(qrDetection.qrData);
              
              if (qrResult.success && qrResult.data) {
                console.log('QR parsed successfully → Using QR-enhanced OCR');
                // Use hybrid OCR with QR validation
                data = await service.extractTextWithQRContext(imageUri, qrResult.data);
              } else {
                console.log('QR parse failed → Falling back to standard OCR');
                // QR detection successful but parsing failed, use standard OCR
                data = await service.extractText(imageUri);
              }
            } catch (qrError) {
              console.log('QR parsing error, falling back to standard OCR:', qrError);
              // If QR parsing fails, just use standard OCR
              data = await service.extractText(imageUri);
            }
          } else {
            console.log('No QR code detected → Using standard OCR');
            // No QR detected, use standard photo OCR
            data = await service.extractText(imageUri);
          }
        }
        
        console.log('Processing complete, initializing form...');
        
        // Initialize form state
        setMerchant(data.merchant?.name || '');
        if (data.date?.value) {
            try {
                const d = new Date(data.date.value);
                if (!isNaN(d.getTime())) {
                     setDate(d.toISOString().split('T')[0]);
                }
            } catch (e) {}
        }
        
        // Normalize items for editing
        const normalizedItems = (data.items || []).map(item => ({
            name: item.cleanName || item.name || '',
            category: item.category || 'other',
            // Category hierarchy (will be set by matcher below)
            departmentId: undefined as number | undefined,
            categoryId: undefined as number | undefined,
            subcategoryId: undefined as number | undefined,
            itemGroupId: undefined as number | undefined,
            departmentName: '',
            categoryName: '',
            subcategoryName: '',
            itemGroupName: '',
            quantity: item.quantity?.toString() || '1',
            unitPrice: item.price?.toString() || '0',  // Use 'price' from OCR, not 'unitPrice'
            discount: '0',
            unit: 'pcs', // Default unit
            rawName: item.name
        }));
        
        // Auto-match items to categories using CategoryMatcher
        if (db) {
          try {
            console.log('Initializing CategoryMatcher for auto-categorization...');
            const matcher = await getCategoryMatcher(db);
            
            // Match each item to a category
            for (let i = 0; i < normalizedItems.length; i++) {
              const item = normalizedItems[i];
              const productName = item.name || item.rawName;
              
              if (productName) {
                const match = matcher.findBestMatch(productName);
                
                if (match && match.confidence >= 0.5) {
                  // Update item with matched category hierarchy
                  normalizedItems[i] = {
                    ...item,
                    departmentId: match.itemGroup.department_id,
                    categoryId: match.itemGroup.category_id,
                    subcategoryId: match.itemGroup.subcategory_id,
                    itemGroupId: match.itemGroup.id,
                    departmentName: match.itemGroup.department_name,
                    categoryName: match.itemGroup.category_name,
                    subcategoryName: match.itemGroup.subcategory_name,
                    itemGroupName: match.itemGroup.name_tr,
                    category: match.itemGroup.subcategory_name, // Update legacy field
                  };
                  
                  console.log(`✓ Matched "${productName}" -> ${match.itemGroup.department_name} / ${match.itemGroup.category_name} / ${match.itemGroup.subcategory_name} (confidence: ${(match.confidence * 100).toFixed(0)}%)`);
                } else {
                  console.log(`✗ No match for "${productName}" (${match ? 'low confidence: ' + (match.confidence * 100).toFixed(0) + '%' : 'no results'})`);
                }
              }
            }
          } catch (matchError) {
            console.error('CategoryMatcher error (non-blocking):', matchError);
            // Continue without auto-categorization if matcher fails
          }
        }
        
        setItems(normalizedItems);

        // Store extracted total for validation
        if (data.total?.value) {
            setExtractedTotal(data.total.value);
        }

      } catch (err) {
        console.error('Processing Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    processImage();
  }, [imageUri, receiptDataParam, source]);

  const handleSave = async () => {
    if (!db) {
        Alert.alert(t('common.error'), 'Database not initialized');
        return;
    }
    
    setSaving(true);
    try {
        const repository = new ReceiptRepository(db, locale);
        
        // Copy image to permanent directory
        let permanentImagePath = imageUri;
        if (imageUri) {
            try {
                const filename = imageUri.split('/').pop() || `receipt_${Date.now()}.jpg`;
                const newPath = `${FileSystem.documentDirectory}receipts/${filename}`;
                
                // Create receipts directory if it doesn't exist
                const receiptsDir = `${FileSystem.documentDirectory}receipts`;
                const dirInfo = await FileSystem.getInfoAsync(receiptsDir);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(receiptsDir, { intermediates: true });
                }
                
                // Copy file to permanent location
                await FileSystem.copyAsync({
                    from: imageUri,
                    to: newPath
                });
                permanentImagePath = newPath;
                console.log('Image saved to:', newPath);
            } catch (err) {
                console.error('Failed to save image:', err);
                // Continue with original path if copy fails
            }
        }
        
        // Calculate totals
        let calculatedTotal = 0;
        
        // DEBUG: Log items before saving
        console.log('💾 SAVING ITEMS:', items.map(item => ({
            name: item.name,
            departmentId: item.departmentId,
            categoryId: item.categoryId,
            subcategoryId: item.subcategoryId,
            itemGroupId: item.itemGroupId
        })));
        
        const finalItems = items.map(item => {
            const qty = parseFloat(item.quantity) || 1;
            const price = parseFloat(item.unitPrice) || 0;
            const discount = parseFloat(item.discount) || 0;
            const total = (qty * price) - discount;
            calculatedTotal += total;
            
            return {
                name: item.name,
                productName: item.name,
                quantity: qty,
                unitPrice: price,
                price: price,
                discount: discount,
                category: item.category,
                // Include category hierarchy
                departmentId: item.departmentId,
                categoryId: item.categoryId,
                subcategoryId: item.subcategoryId,
                itemGroupId: item.itemGroupId,
            };
        });
        
        const receiptData = {
            merchantName: merchant,
            date: new Date(date),
            total: calculatedTotal,
            imagePath: permanentImagePath,
            ocrConfidence: 0.9, // Simplified
            items: finalItems
        };
        
        await repository.create(receiptData as any); // Type cast as our Receipt type definition vs repo input might have slight drift, mostly safe
        
        
        // Upload price data in background (non-blocking)
        // Note: We don't have receipt ID here, but we can still upload with merchant name
        uploadPriceData(finalItems, merchant).catch(err => {
            console.error('Price upload failed (non-blocking):', err);
            // Don't show error to user - this is optional background task
        });
        
        // Navigate away immediately, don't show alert that can be dismissed
        Alert.alert(t('common.ok'), t('receipt.saveSuccess'));
        router.replace('/(tabs)/history');

    } catch (err) {
        console.error('Save Error:', err);
        Alert.alert(t('common.error'), t('receipt.saveError'));
        setSaving(false);
    }
  }
;

  // Background function to upload price data
  const uploadPriceData = async (processedItems: any[], storeName: string) => {
    try {
      const { SupabasePriceService } = await import('@/lib/services/price');
      
      // Create a receipt-like object for upload
      const receiptForUpload = {
        merchantName: storeName,
        items: processedItems,
      } as any;
      
      // This respects user opt-in preference internally
      await SupabasePriceService.uploadReceiptPrices(receiptForUpload);
      
      console.log('Price data uploaded successfully');
    } catch (error) {
      console.error('Error uploading price data:', error);
      // Fail silently - this is optional
    }
  };
  
  const updateItem = (index: number, field: string, value: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
  };
  
  const removeItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
  };
  
  const addItem = () => {
      setItems([...items, { 
          name: '', 
          category: 'other', 
          departmentId: undefined as number | undefined,
          categoryId: undefined as number | undefined,
          subcategoryId: undefined as number | undefined,
          itemGroupId: undefined as number | undefined,
          departmentName: '',
          categoryName: '',
          subcategoryName: '',
          itemGroupName: '',
          quantity: '1', 
          unitPrice: '0', 
          discount: '0', 
          unit: 'pcs' 
      }]);
  };

  const calculateTotal = () => {
      return items.reduce((sum, item) => {
          const qty = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.unitPrice) || 0;
          const discount = parseFloat(item.discount) || 0;
          return sum + (qty * price) - discount;
      }, 0);
  };

  const getConfidenceStatus = () => {
      const calculated = calculateTotal();
      if (!extractedTotal) return { status: 'unknown', color: '#787774', message: t('processing.totalNotDetected') };

      const diff = Math.abs(calculated - extractedTotal);
      const tolerance = 0.5; // 0.50 TL tolerance

      if (diff <= tolerance) {
          return { status: 'match', color: '#2C9364', message: t('processing.totalsMatch') };
      } else {
          return { status: 'mismatch', color: '#E03E3E', message: t('processing.totalsMismatch', { amount: extractedTotal.toFixed(2) }) };
      }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37352F" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.center}>
          <Text style={styles.error}>{t('common.error')}: {error}</Text>
          <Button title={t('receipt.goBack')} onPress={() => router.back()} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mainContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text style={styles.title}>{t('processing.editConfirm')}</Text>

              {/* Receipt Header Info */}
              <View style={styles.section}>
                <Text style={styles.label}>{t('receipt.merchant')}</Text>
                <TextInput
                    style={styles.input}
                    value={merchant}
                    onChangeText={setMerchant}
                    placeholder={t('processing.storeName')}
                />

                <Text style={styles.label}>{t('processing.dateFormat')}</Text>
                <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder={t('processing.datePlaceholder')}
                />
              </View>

              {/* Items List */}
              <Text style={styles.subtitle}>{t('receipt.items')}</Text>
              {items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                         <Text style={styles.itemIndex}>#{index + 1}</Text>
                         <TouchableOpacity onPress={() => removeItem(index)}>
                             <Ionicons name="trash-outline" size={20} color="#E03E3E" />
                         </TouchableOpacity>
                    </View>

                    <Text style={styles.labelSmall}>{t('processing.itemName')}</Text>
                    <TextInput
                        style={styles.input}
                        value={item.name}
                        onChangeText={(text) => updateItem(index, 'name', text)}
                        placeholder={t('processing.productName')}
                    />

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>{t('processing.qty')}</Text>
                            <TextInput
                                style={styles.input}
                                value={item.quantity}
                                onChangeText={(text) => updateItem(index, 'quantity', text)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>{t('processing.unitPrice')}</Text>
                            <TextInput
                                style={styles.input}
                                value={item.unitPrice}
                                onChangeText={(text) => updateItem(index, 'unitPrice', text)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>{t('processing.discount')}</Text>
                            <TextInput
                                style={styles.input}
                                value={item.discount}
                                onChangeText={(text) => updateItem(index, 'discount', text)}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>{t('processing.total')}</Text>
                            <View style={[styles.input, styles.readOnlyInput]}>
                                <Text>
                                    {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0) - (parseFloat(item.discount) || 0)).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.labelSmall}>{t('processing.category')}</Text>
                            <CategoryDropdown
                                value={{
                                    departmentId: item.departmentId,
                                    categoryId: item.categoryId,
                                    subcategoryId: item.subcategoryId,
                                }}
                                onChange={(selection) => {
                                    const newItems = [...items];
                                    newItems[index] = {
                                        ...newItems[index],
                                        departmentId: selection.departmentId,
                                        categoryId: selection.categoryId,
                                        subcategoryId: selection.subcategoryId,
                                        departmentName: selection.departmentName,
                                        categoryName: selection.categoryName,
                                        subcategoryName: selection.subcategoryName,
                                        // Update legacy category field with subcategory name
                                        category: selection.subcategoryName,
                                    };
                                    setItems(newItems);
                                }}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Unit</Text>
                            <View style={styles.unitContainer}>
                                {['pcs', 'kg', 'L', 'g'].map((unit) => (
                                    <TouchableOpacity 
                                        key={unit}
                                        style={[
                                            styles.unitButton, 
                                            (item.unit || 'pcs') === unit && styles.unitButtonActive
                                        ]}
                                        onPress={() => updateItem(index, 'unit', unit)}
                                    >
                                        <Text style={[
                                            styles.unitText,
                                            (item.unit || 'pcs') === unit && styles.unitTextActive
                                        ]}>{unit}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
              ))}

              <Button title={`+ ${t('processing.addItem')}`} onPress={addItem} variant="secondary" style={{ marginBottom: 20 }} />

              {/* Footer Total */}
              <View style={styles.totalContainer}>
                  <View>
                    <Text style={styles.totalLabel}>{t('processing.calculatedTotal')}</Text>
                    <Text style={[styles.confidenceText, { color: getConfidenceStatus().color }]}>
                        {getConfidenceStatus().message}
                    </Text>
                  </View>
                  <Text style={styles.totalValue}>{calculateTotal().toFixed(2)} ₺</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

    <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={styles.footerActionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={20} color="#E03E3E" />
            <Text style={[styles.footerActionButtonText, { color: '#E03E3E' }]}>{t('processing.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.footerActionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={20} color="#37352F" />
            <Text style={styles.footerActionButtonText}>{t('processing.retake')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.footerActionButton, styles.saveButton]}
            activeOpacity={0.7}
            disabled={saving}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={[styles.footerActionButtonText, { color: '#FFFFFF' }]}>
              {saving ? `${t('processing.save')}...` : t('processing.save')}
            </Text>
          </TouchableOpacity>
        </View>
    </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F7F6F3' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, backgroundColor: '#F7F6F3' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F6F3' },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    backgroundColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#37352F',
  },
  text: { fontSize: 18, color: '#37352F' },
  error: { color: '#E03E3E', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#37352F', marginTop: 20 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 10, marginBottom: 10, color: '#37352F' },
  section: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#E9E9E7' },
  
  itemCard: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E9E9E7' },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemIndex: { fontWeight: 'bold', color: '#787774' },
  
  label: { fontSize: 14, color: '#787774', marginBottom: 4, fontWeight: '500' },
  labelSmall: { fontSize: 12, color: '#787774', marginBottom: 2 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 4, padding: 8, fontSize: 16, marginBottom: 12, backgroundColor: '#FAFAFA' },
  readOnlyInput: { backgroundColor: '#E9E9E7', justifyContent: 'center' },
  
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },

  unitContainer: { flexDirection: 'row', gap: 4, marginTop: 4 },
  unitButton: { 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    borderRadius: 4, 
    borderWidth: 1, 
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA'
  },
  unitButtonActive: {
    backgroundColor: '#37352F',
    borderColor: '#37352F',
  },
  unitText: { fontSize: 12, color: '#37352F' },
  unitTextActive: { color: 'white' },
  
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: 15, backgroundColor: '#E9E9E7', borderRadius: 8 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#2C9364' },
  confidenceText: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  
  footer: { 
    padding: 20, 
    paddingBottom: 34, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderTopColor: '#E9E9E7',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  footerActionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
    backgroundColor: '#FFFFFF',
    gap: 4,
    flex: 1,
  },
  footerActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#37352F',
  },
  saveButton: {
    backgroundColor: '#2C9364',
    borderColor: '#2C9364',
    flex: 2,
  },
});
