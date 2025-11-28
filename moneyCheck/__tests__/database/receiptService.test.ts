/**
 * Receipt Service Tests
 */

import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from '../../database/schema';
import {
  createReceipt,
  getReceiptById,
  getReceipts,
  updateReceipt,
  deleteReceipt,
  getReceiptsCount,
  getReceiptWithItems,
} from '../../database/services/receiptService';
import { createLineItem } from '../../database/services/lineItemService';
import { CreateReceiptInput } from '../../types/database.types';

describe('Receipt Service', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await SQLite.openDatabaseAsync(':memory:');
    await initializeDatabase(db);
  });

  afterAll(async () => {
    await db.closeAsync();
  });

  beforeEach(async () => {
    // Clear receipts before each test
    await db.execAsync('DELETE FROM receipts');
  });

  describe('createReceipt', () => {
    test('should create a new receipt', async () => {
      const receiptData: CreateReceiptInput = {
        storeName: 'Test Store',
        storeLocation: '123 Main St',
        purchaseDate: new Date('2025-01-15'),
        totalAmount: 50.99,
        subtotal: 45.99,
        tax: 5.0,
        paymentMethod: 'credit_card',
        status: 'pending',
      };

      const receiptId = await createReceipt(db, receiptData);

      expect(receiptId).toBeGreaterThan(0);

      const receipt = await getReceiptById(db, receiptId);
      expect(receipt).not.toBeNull();
      expect(receipt?.storeName).toBe('Test Store');
      expect(receipt?.totalAmount).toBe(50.99);
      expect(receipt?.paymentMethod).toBe('credit_card');
    });

    test('should create receipt with minimal data', async () => {
      const receiptData: CreateReceiptInput = {
        storeName: 'Minimal Store',
        purchaseDate: new Date(),
        totalAmount: 25.0,
      };

      const receiptId = await createReceipt(db, receiptData);
      const receipt = await getReceiptById(db, receiptId);

      expect(receipt).not.toBeNull();
      expect(receipt?.status).toBe('pending'); // default value
    });
  });

  describe('getReceipts', () => {
    test('should return all receipts', async () => {
      await createReceipt(db, {
        storeName: 'Store A',
        purchaseDate: new Date('2025-01-10'),
        totalAmount: 30.0,
      });

      await createReceipt(db, {
        storeName: 'Store B',
        purchaseDate: new Date('2025-01-15'),
        totalAmount: 50.0,
      });

      const receipts = await getReceipts(db);
      expect(receipts.length).toBe(2);
    });

    test('should filter receipts by store name', async () => {
      await createReceipt(db, {
        storeName: 'Walmart',
        purchaseDate: new Date(),
        totalAmount: 30.0,
      });

      await createReceipt(db, {
        storeName: 'Target',
        purchaseDate: new Date(),
        totalAmount: 50.0,
      });

      const receipts = await getReceipts(db, { storeName: 'Walmart' });
      expect(receipts.length).toBe(1);
      expect(receipts[0].storeName).toBe('Walmart');
    });

    test('should filter receipts by date range', async () => {
      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date('2025-01-01'),
        totalAmount: 30.0,
      });

      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date('2025-01-15'),
        totalAmount: 50.0,
      });

      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date('2025-01-30'),
        totalAmount: 70.0,
      });

      const receipts = await getReceipts(db, {
        startDate: new Date('2025-01-10'),
        endDate: new Date('2025-01-20'),
      });

      expect(receipts.length).toBe(1);
      expect(receipts[0].totalAmount).toBe(50.0);
    });

    test('should filter receipts by amount range', async () => {
      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date(),
        totalAmount: 20.0,
      });

      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date(),
        totalAmount: 50.0,
      });

      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date(),
        totalAmount: 100.0,
      });

      const receipts = await getReceipts(db, {
        minAmount: 40,
        maxAmount: 80,
      });

      expect(receipts.length).toBe(1);
      expect(receipts[0].totalAmount).toBe(50.0);
    });

    test('should apply limit and offset', async () => {
      for (let i = 1; i <= 5; i++) {
        await createReceipt(db, {
          storeName: `Store ${i}`,
          purchaseDate: new Date(),
          totalAmount: i * 10,
        });
      }

      const receipts = await getReceipts(db, { limit: 2, offset: 1 });
      expect(receipts.length).toBe(2);
    });
  });

  describe('updateReceipt', () => {
    test('should update receipt fields', async () => {
      const receiptId = await createReceipt(db, {
        storeName: 'Old Store',
        purchaseDate: new Date(),
        totalAmount: 50.0,
        status: 'pending',
      });

      await updateReceipt(db, receiptId, {
        storeName: 'New Store',
        status: 'verified',
      });

      const receipt = await getReceiptById(db, receiptId);
      expect(receipt?.storeName).toBe('New Store');
      expect(receipt?.status).toBe('verified');
      expect(receipt?.totalAmount).toBe(50.0); // unchanged
    });
  });

  describe('deleteReceipt', () => {
    test('should delete receipt', async () => {
      const receiptId = await createReceipt(db, {
        storeName: 'Test Store',
        purchaseDate: new Date(),
        totalAmount: 50.0,
      });

      await deleteReceipt(db, receiptId);

      const receipt = await getReceiptById(db, receiptId);
      expect(receipt).toBeNull();
    });
  });

  describe('getReceiptsCount', () => {
    test('should return total count', async () => {
      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date(),
        totalAmount: 30.0,
      });

      await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date(),
        totalAmount: 50.0,
      });

      const count = await getReceiptsCount(db);
      expect(count).toBe(2);
    });

    test('should return filtered count', async () => {
      await createReceipt(db, {
        storeName: 'Walmart',
        purchaseDate: new Date(),
        totalAmount: 30.0,
      });

      await createReceipt(db, {
        storeName: 'Target',
        purchaseDate: new Date(),
        totalAmount: 50.0,
      });

      const count = await getReceiptsCount(db, { storeName: 'Walmart' });
      expect(count).toBe(1);
    });
  });

  describe('getReceiptWithItems', () => {
    test('should return receipt with line items', async () => {
      const receiptId = await createReceipt(db, {
        storeName: 'Store',
        purchaseDate: new Date(),
        totalAmount: 30.0,
      });

      await createLineItem(db, {
        receiptId,
        name: 'Item 1',
        quantity: 2,
        unitPrice: 10.0,
        totalPrice: 20.0,
      });

      await createLineItem(db, {
        receiptId,
        name: 'Item 2',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      });

      const receipt = await getReceiptWithItems(db, receiptId);

      expect(receipt).not.toBeNull();
      expect(receipt?.lineItems).toHaveLength(2);
      expect(receipt?.lineItems?.[0].name).toBe('Item 1');
    });
  });
});
