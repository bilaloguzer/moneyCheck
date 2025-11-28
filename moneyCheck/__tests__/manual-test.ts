/**
 * Manual Database Test Script
 * Run this to manually test the database implementation
 *
 * Usage:
 * 1. Run this in your React Native app (add to a test screen)
 * 2. Check console for results
 */

import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from '../database/schema';
import {
  createReceipt,
  getReceiptById,
  getReceipts,
  getReceiptWithItems,
} from '../database/services/receiptService';
import { createLineItem } from '../database/services/lineItemService';
import {
  createDepartment,
  createCategory,
  getDepartments,
  bulkImportCategories,
} from '../database/services/categoryService';
import {
  getCategorySpendingSummary,
  getSpendingByStore,
  getTotalSpending,
} from '../database/services/analyticsService';

export async function runManualDatabaseTest() {
  console.log('🧪 Starting manual database test...\n');

  try {
    // Step 1: Initialize database
    console.log('📦 Step 1: Opening database...');
    const db = await SQLite.openDatabaseAsync('test-moneycheck.db');
    console.log('✅ Database opened successfully\n');

    // Step 2: Initialize schema
    console.log('🏗️  Step 2: Initializing schema...');
    await initializeDatabase(db);
    console.log('✅ Schema initialized\n');

    // Step 3: Create test receipt
    console.log('🧾 Step 3: Creating test receipt...');
    const receiptId = await createReceipt(db, {
      storeName: 'Whole Foods',
      storeLocation: '123 Main St',
      purchaseDate: new Date('2025-01-15'),
      totalAmount: 87.45,
      subtotal: 79.50,
      tax: 7.95,
      paymentMethod: 'credit_card',
      status: 'processed',
    });
    console.log(`✅ Receipt created with ID: ${receiptId}\n`);

    // Step 4: Add line items
    console.log('📝 Step 4: Adding line items...');
    await createLineItem(db, {
      receiptId,
      name: 'Organic Bananas',
      quantity: 3,
      unitPrice: 1.99,
      totalPrice: 5.97,
      departmentName: 'Fresh Produce',
    });

    await createLineItem(db, {
      receiptId,
      name: 'Whole Milk',
      quantity: 1,
      unitPrice: 4.99,
      totalPrice: 4.99,
      departmentName: 'Dairy',
    });

    await createLineItem(db, {
      receiptId,
      name: 'Chicken Breast',
      quantity: 2.5,
      unitPrice: 8.99,
      totalPrice: 22.48,
      departmentName: 'Meat & Poultry',
    });
    console.log('✅ Line items added\n');

    // Step 5: Create categories
    console.log('🏷️  Step 5: Creating categories...');
    const deptId = await createDepartment(db, 'Fresh Produce');
    await createCategory(db, {
      name: 'Fresh Fruit',
      department: deptId,
      subcategories: [
        {
          type: 'Tropical',
          items: ['Bananas', 'Pineapples', 'Mangoes'],
        },
        {
          type: 'Berries',
          items: ['Strawberries', 'Blueberries'],
        },
      ],
    });
    console.log('✅ Categories created\n');

    // Step 6: Retrieve receipt with items
    console.log('🔍 Step 6: Retrieving receipt with items...');
    const receipt = await getReceiptWithItems(db, receiptId);
    console.log('Receipt:', {
      id: receipt?.id,
      store: receipt?.storeName,
      total: receipt?.totalAmount,
      itemCount: receipt?.lineItems?.length,
    });
    console.log('Line Items:');
    receipt?.lineItems?.forEach((item) => {
      console.log(`  - ${item.name}: $${item.totalPrice}`);
    });
    console.log();

    // Step 7: Query all receipts
    console.log('📋 Step 7: Querying all receipts...');
    const allReceipts = await getReceipts(db);
    console.log(`✅ Found ${allReceipts.length} receipt(s)\n`);

    // Step 8: Test analytics
    console.log('📊 Step 8: Testing analytics...');
    const totalSpending = await getTotalSpending(db);
    console.log('Total Spending:', totalSpending);

    const categorySpending = await getCategorySpendingSummary(db);
    console.log('Category Spending:', categorySpending);

    const storeSpending = await getSpendingByStore(db);
    console.log('Store Spending:', storeSpending);
    console.log();

    // Step 9: Test bulk import
    console.log('📦 Step 9: Testing bulk import...');
    const sampleData = [
      {
        department: 'Beverages',
        categories: [
          {
            name: 'Water',
            items: ['Still', 'Sparkling', 'Flavored'],
          },
          {
            name: 'Soft Drinks',
            items: ['Colas', 'Lemon-Lime', 'Root Beer'],
          },
        ],
      },
    ];
    await bulkImportCategories(db, sampleData);
    const departments = await getDepartments(db);
    console.log(`✅ Departments after import: ${departments.length}`);
    departments.forEach((dept) => {
      console.log(`  - ${dept.name}: ${dept.categories.length} categories`);
    });
    console.log();

    // Final summary
    console.log('🎉 All tests completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   Receipts: ${allReceipts.length}`);
    console.log(`   Line Items: ${receipt?.lineItems?.length || 0}`);
    console.log(`   Departments: ${departments.length}`);
    console.log(`   Total Spent: $${totalSpending.totalSpent.toFixed(2)}`);

    return {
      success: true,
      db,
      receiptId,
      receipt,
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error,
    };
  }
}

// Example usage in a React component:
/*
import { runManualDatabaseTest } from './__tests__/manual-test';

function TestScreen() {
  const handleTest = async () => {
    const result = await runManualDatabaseTest();
    if (result.success) {
      Alert.alert('Success', 'All database tests passed!');
    } else {
      Alert.alert('Error', result.error.message);
    }
  };

  return (
    <Button title="Run Database Test" onPress={handleTest} />
  );
}
*/
