/**
 * Database Usage Examples
 * Copy these patterns into your actual components
 */

import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useRequiredDatabase } from '../contexts/DatabaseContext';
import { useDatabaseQuery, useDatabaseMutation } from '../hooks';
import {
  getReceipts,
  createReceipt,
  getReceiptWithItems,
  createLineItems,
} from '../database/services';
import { CreateReceiptInput, CreateLineItemInput } from '../types/database.types';

// ============================================================================
// Example 1: Display List of Receipts
// ============================================================================

export function ReceiptListExample() {
  const { data: receipts, isLoading, error, refetch } = useDatabaseQuery(
    async (db) => {
      return await getReceipts(db, {
        limit: 50,
        // Add filters as needed:
        // startDate: new Date('2025-01-01'),
        // storeName: 'Walmart',
      });
    },
    [] // Dependencies - refetch when these change
  );

  if (isLoading) {
    return <Text>Loading receipts...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Button title="Refresh" onPress={refetch} />
      <FlatList
        data={receipts || []}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <View style={styles.receiptCard}>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <Text>Date: {item.purchaseDate.toLocaleDateString()}</Text>
            <Text style={styles.amount}>${item.totalAmount.toFixed(2)}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ============================================================================
// Example 2: Create a Receipt with Line Items
// ============================================================================

export function CreateReceiptExample() {
  const db = useRequiredDatabase();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateReceipt = async () => {
    try {
      setIsSubmitting(true);

      // Step 1: Create the receipt
      const receiptData: CreateReceiptInput = {
        storeName: 'Whole Foods',
        storeLocation: '123 Main St',
        purchaseDate: new Date(),
        totalAmount: 45.97,
        subtotal: 41.97,
        tax: 4.0,
        paymentMethod: 'credit_card',
        status: 'processed',
      };

      const receiptId = await createReceipt(db, receiptData);

      // Step 2: Add line items
      const lineItems: CreateLineItemInput[] = [
        {
          receiptId,
          name: 'Organic Bananas',
          quantity: 3,
          unitPrice: 1.99,
          totalPrice: 5.97,
          departmentName: 'Fresh Produce',
        },
        {
          receiptId,
          name: 'Whole Milk',
          quantity: 2,
          unitPrice: 4.99,
          totalPrice: 9.98,
          departmentName: 'Dairy',
        },
        {
          receiptId,
          name: 'Chicken Breast',
          quantity: 1.5,
          unitPrice: 8.99,
          totalPrice: 13.49,
          departmentName: 'Meat & Poultry',
        },
      ];

      await createLineItems(db, lineItems);

      Alert.alert('Success', `Receipt created with ID: ${receiptId}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Create Sample Receipt"
        onPress={handleCreateReceipt}
        disabled={isSubmitting}
      />
    </View>
  );
}

// ============================================================================
// Example 3: Display Receipt Details with Line Items
// ============================================================================

export function ReceiptDetailsExample({ receiptId }: { receiptId: number }) {
  const { data: receipt, isLoading } = useDatabaseQuery(
    async (db) => {
      return await getReceiptWithItems(db, receiptId);
    },
    [receiptId]
  );

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!receipt) {
    return <Text>Receipt not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{receipt.storeName}</Text>
      <Text>{receipt.storeLocation}</Text>
      <Text>Date: {receipt.purchaseDate.toLocaleDateString()}</Text>
      <Text>Payment: {receipt.paymentMethod}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Line Items</Text>
      {receipt.lineItems?.map((item) => (
        <View key={item.id} style={styles.lineItem}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text>
            {item.quantity} × ${item.unitPrice.toFixed(2)}
          </Text>
          <Text style={styles.itemTotal}>${item.totalPrice.toFixed(2)}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.totals}>
        {receipt.subtotal && (
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>${receipt.subtotal.toFixed(2)}</Text>
          </View>
        )}
        {receipt.tax && (
          <View style={styles.totalRow}>
            <Text>Tax:</Text>
            <Text>${receipt.tax.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.boldText}>Total:</Text>
          <Text style={styles.boldText}>${receipt.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Example 4: Using Mutation Hook
// ============================================================================

export function MutationExample() {
  const { mutate: saveReceipt, isLoading, error } = useDatabaseMutation(
    async (db, data: CreateReceiptInput) => {
      return await createReceipt(db, data);
    }
  );

  const handleSubmit = async () => {
    try {
      const receiptId = await saveReceipt({
        storeName: 'Target',
        purchaseDate: new Date(),
        totalAmount: 99.99,
      });

      Alert.alert('Success', `Receipt ID: ${receiptId}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Save Receipt" onPress={handleSubmit} disabled={isLoading} />
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

// ============================================================================
// Example 5: Filter Receipts
// ============================================================================

export function FilteredReceiptsExample() {
  const [storeName, setStoreName] = useState('Walmart');
  const [startDate] = useState(new Date('2025-01-01'));
  const [endDate] = useState(new Date('2025-12-31'));

  const { data: receipts, isLoading } = useDatabaseQuery(
    async (db) => {
      return await getReceipts(db, {
        storeName,
        startDate,
        endDate,
        minAmount: 20,
        maxAmount: 200,
        status: 'processed',
        limit: 100,
      });
    },
    [storeName, startDate, endDate]
  );

  return (
    <View style={styles.container}>
      <Text>Receipts from {storeName}</Text>
      <Text>Found: {receipts?.length || 0}</Text>
      <FlatList
        data={receipts || []}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <View style={styles.receiptCard}>
            <Text>{item.storeName}</Text>
            <Text>${item.totalAmount.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  receiptCard: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    flex: 1,
    fontWeight: '500',
  },
  itemTotal: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
  totals: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
});
