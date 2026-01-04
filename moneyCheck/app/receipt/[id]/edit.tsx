// Receipt edit screen - modify receipt details and line items
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SupabaseReceiptService } from '@/lib/services/SupabaseReceiptService';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface EditableLineItem {
  id?: string;
  name: string;
  cleanName: string;
  category: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  discount: string;
}

export default function ReceiptEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<EditableLineItem[]>([]);

  useEffect(() => {
    if (!id) return;
    
    const loadReceipt = async () => {
      try {
        const { data, error } = await SupabaseReceiptService.getReceiptById(id);
        if (error) throw error;
        
        setMerchant(data?.merchantName || '');
        setDate(data?.date || '');
        setItems(data?.items.map(item => ({
          id: item.id,
          name: item.name,
          cleanName: item.cleanName || item.name,
          category: item.category || 'other',
          quantity: item.quantity?.toString() || '1',
          unit: item.unit || 'pcs',
          unitPrice: item.unitPrice?.toString() || '0',
          discount: item.discount?.toString() || '0',
        })) || []);
      } catch (error) {
        console.error('Failed to load receipt:', error);
        Alert.alert('Error', 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [id]);

  const updateItem = (index: number, field: keyof EditableLineItem, value: string) => {
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
      cleanName: '',
      category: 'other',
      quantity: '1',
      unit: 'pcs',
      unitPrice: '0',
      discount: '0',
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

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      // Delete existing line items for this receipt
      const { error: deleteError } = await supabase
        .from('line_items')
        .delete()
        .eq('receipt_id', id);

      if (deleteError) throw deleteError;

      // Update receipt
      const { error: receiptError } = await supabase
        .from('receipts')
        .update({
          merchant_name: merchant,
          purchase_date: date,
          total_amount: calculateTotal(),
        })
        .eq('id', id);

      if (receiptError) throw receiptError;

      // Insert updated line items
      const lineItems = items.map(item => ({
        receipt_id: id,
        name: item.name,
        clean_name: item.cleanName || item.name,
        category: item.category,
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit,
        unit_price: parseFloat(item.unitPrice) || 0,
        line_total: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0) - (parseFloat(item.discount) || 0),
        discount: parseFloat(item.discount) || 0,
        confidence: 0.9,
      }));

      const { error: itemsError } = await supabase
        .from('line_items')
        .insert(lineItems);

      if (itemsError) throw itemsError;

      Alert.alert('Success', 'Receipt updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to save receipt:', error);
      Alert.alert('Error', 'Failed to save receipt: ' + (error as Error).message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#37352F" />
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
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#37352F" />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Receipt</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Merchant */}
              <View style={styles.section}>
                <Text style={styles.label}>Merchant</Text>
                <TextInput
                  style={styles.input}
                  value={merchant}
                  onChangeText={setMerchant}
                  placeholder="Store name"
                  placeholderTextColor="#787774"
                />
              </View>

              {/* Date */}
              <View style={styles.section}>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2025-01-04"
                  placeholderTextColor="#787774"
                />
              </View>

              {/* Line Items */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Items ({items.length})</Text>
                  <TouchableOpacity onPress={addItem} style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color="#2C9364" />
                  </TouchableOpacity>
                </View>

                {items.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemNumber}>#{index + 1}</Text>
                      <TouchableOpacity onPress={() => removeItem(index)}>
                        <Ionicons name="trash-outline" size={20} color="#E03E3E" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.labelSmall}>Item Name</Text>
                    <TextInput
                      style={styles.input}
                      value={item.name}
                      onChangeText={(val) => updateItem(index, 'name', val)}
                      placeholder="Product name"
                      placeholderTextColor="#787774"
                    />

                    <View style={styles.row}>
                      <View style={styles.col}>
                        <Text style={styles.labelSmall}>Quantity</Text>
                        <TextInput
                          style={styles.input}
                          value={item.quantity}
                          onChangeText={(val) => updateItem(index, 'quantity', val)}
                          keyboardType="decimal-pad"
                          placeholder="1"
                          placeholderTextColor="#787774"
                        />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.labelSmall}>Unit</Text>
                        <View style={styles.unitSelector}>
                          {['pcs', 'kg', 'L', 'g'].map((unitType) => (
                            <TouchableOpacity
                              key={unitType}
                              style={[styles.unitButton, item.unit === unitType && styles.unitButtonActive]}
                              onPress={() => updateItem(index, 'unit', unitType)}
                            >
                              <Text style={[styles.unitText, item.unit === unitType && styles.unitTextActive]}>
                                {unitType}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={styles.col}>
                        <Text style={styles.labelSmall}>Unit Price</Text>
                        <TextInput
                          style={styles.input}
                          value={item.unitPrice}
                          onChangeText={(val) => updateItem(index, 'unitPrice', val)}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor="#787774"
                        />
                      </View>
                      <View style={styles.col}>
                        <Text style={styles.labelSmall}>Discount</Text>
                        <TextInput
                          style={styles.input}
                          value={item.discount}
                          onChangeText={(val) => updateItem(index, 'discount', val)}
                          keyboardType="decimal-pad"
                          placeholder="0.00"
                          placeholderTextColor="#787774"
                        />
                      </View>
                    </View>

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Line Total:</Text>
                      <Text style={styles.totalValue}>
                        {((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0) - (parseFloat(item.discount) || 0)).toFixed(2)} ₺
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Grand Total */}
              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total:</Text>
                <Text style={styles.grandTotalValue}>{calculateTotal().toFixed(2)} ₺</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37352F',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
  },
  addButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 8,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F7F6F3',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#37352F',
  },
  itemCard: {
    backgroundColor: '#F7F6F3',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37352F',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#2C9364',
    borderColor: '#2C9364',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#787774',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9E9E7',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#787774',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37352F',
  },
  grandTotal: {
    backgroundColor: '#2C9364',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9E9E7',
  },
  saveButton: {
    backgroundColor: '#2C9364',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
