import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OCRService } from '@/lib/services/ocr/OCRService';
import type { OCRResult, Receipt } from '@/lib/types';
import { Button } from '@/components/common/Button';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { ReceiptRepository } from '@/lib/database/repositories/ReceiptRepository';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';

export default function ProcessingScreen() {
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  const router = useRouter();
  const { db } = useDatabaseContext();
  
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
      if (!imageUri) return;
      
      try {
        const service = new OCRService();
        console.log('Starting OCR processing for:', imageUri);
        const data = await service.extractText(imageUri);
        console.log('OCR Result:', data);
        
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
            quantity: item.quantity?.toString() || '1',
            unitPrice: item.unitPrice?.toString() || item.price?.toString() || '0',
            discount: '0',
            unit: 'pcs', // Default unit
            rawName: item.name
        }));
        setItems(normalizedItems);

        // Store extracted total for validation
        if (data.total?.value) {
            setExtractedTotal(data.total.value);
        }

      } catch (err) {
        console.error('OCR Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    processImage();
  }, [imageUri]);

  const handleSave = async () => {
    if (!db) {
        Alert.alert('Error', 'Database not initialized');
        return;
    }
    
    setSaving(true);
    try {
        const repository = new ReceiptRepository(db);
        
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
                category: item.category
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
        
        Alert.alert('Success', 'Receipt saved successfully!', [
            { text: 'OK', onPress: () => router.push('/(tabs)') }
        ]);
        
    } catch (err) {
        console.error('Save Error:', err);
        Alert.alert('Error', 'Failed to save receipt.');
    } finally {
        setSaving(false);
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
      setItems([...items, { name: '', category: 'other', quantity: '1', unitPrice: '0', discount: '0', unit: 'pcs' }]);
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
      if (!extractedTotal) return { status: 'unknown', color: '#787774', message: 'Total not detected' };
      
      const diff = Math.abs(calculated - extractedTotal);
      const tolerance = 0.5; // 0.50 TL tolerance

      if (diff <= tolerance) {
          return { status: 'match', color: '#2C9364', message: 'Totals match perfectly' };
      } else {
          return { status: 'mismatch', color: '#E03E3E', message: `Mismatch! Receipt says ${extractedTotal.toFixed(2)}` };
      }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Processing Receipt with GPT-4o...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
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
              <Text style={styles.title}>Edit & Confirm</Text>
              
              {/* Receipt Header Info */}
              <View style={styles.section}>
                <Text style={styles.label}>Merchant</Text>
                <TextInput 
                    style={styles.input} 
                    value={merchant} 
                    onChangeText={setMerchant} 
                    placeholder="Store Name" 
                />
                
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput 
                    style={styles.input} 
                    value={date} 
                    onChangeText={setDate} 
                    placeholder="2024-01-01" 
                />
              </View>

              {/* Items List */}
              <Text style={styles.subtitle}>Items</Text>
              {items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                         <Text style={styles.itemIndex}>#{index + 1}</Text>
                         <TouchableOpacity onPress={() => removeItem(index)}>
                             <Ionicons name="trash-outline" size={20} color="#E03E3E" />
                         </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.labelSmall}>Item Name</Text>
                    <TextInput 
                        style={styles.input} 
                        value={item.name} 
                        onChangeText={(text) => updateItem(index, 'name', text)} 
                        placeholder="Product Name"
                    />
                    
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Qty</Text>
                            <TextInput 
                                style={styles.input} 
                                value={item.quantity} 
                                onChangeText={(text) => updateItem(index, 'quantity', text)} 
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Unit Price</Text>
                            <TextInput 
                                style={styles.input} 
                                value={item.unitPrice} 
                                onChangeText={(text) => updateItem(index, 'unitPrice', text)} 
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Discount</Text>
                            <TextInput 
                                style={styles.input} 
                                value={item.discount} 
                                onChangeText={(text) => updateItem(index, 'discount', text)} 
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Total</Text>
                            <View style={[styles.input, styles.readOnlyInput]}>
                                <Text>
                                    {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0) - (parseFloat(item.discount) || 0)).toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.labelSmall}>Category</Text>
                            <TextInput 
                                style={styles.input} 
                                value={item.category} 
                                onChangeText={(text) => updateItem(index, 'category', text)} 
                                placeholder="groceries, snacks, etc."
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
              
              <Button title="+ Add Item" onPress={addItem} variant="secondary" style={{ marginBottom: 20 }} />

              {/* Footer Total */}
              <View style={styles.totalContainer}>
                  <View>
                    <Text style={styles.totalLabel}>Calculated Total:</Text>
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
        <Button 
            title={saving ? "Saving..." : "Save Receipt"} 
            onPress={handleSave} 
            disabled={saving} 
        />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F7F6F3' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, backgroundColor: '#F7F6F3' },
  text: { fontSize: 18, color: '#37352F' },
  error: { color: '#E03E3E', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#37352F' },
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
    borderTopColor: '#E9E9E7' 
  }
});
