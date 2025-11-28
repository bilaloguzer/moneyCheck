/**
 * Line Item Service Tests
 */

import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from '../../database/schema';
import {
  createLineItem,
  createLineItems,
  getLineItemById,
  getLineItemsByReceiptId,
  updateLineItem,
  deleteLineItem,
  getLineItemsCount,
} from '../../database/services/lineItemService';
import { createReceipt } from '../../database/services/receiptService';
import { CreateLineItemInput } from '../../types/database.types';

describe('Line Item Service', () => {
  let db: SQLite.SQLiteDatabase;
  let testReceiptId: number;

  beforeAll(async () => {
    db = await SQLite.openDatabaseAsync(':memory:');
    await initializeDatabase(db);
  });

  afterAll(async () => {
    await db.closeAsync();
  });

  beforeEach(async () => {
    await db.execAsync('DELETE FROM receipts');
    await db.execAsync('DELETE FROM line_items');

    // Create a test receipt
    testReceiptId = await createReceipt(db, {
      storeName: 'Test Store',
      purchaseDate: new Date(),
      totalAmount: 100.0,
    });
  });

  describe('createLineItem', () => {
    test('should create a new line item', async () => {
      const itemData: CreateLineItemInput = {
        receiptId: testReceiptId,
        name: 'Bananas',
        quantity: 3,
        unitPrice: 1.5,
        totalPrice: 4.5,
        departmentName: 'Fresh Produce',
      };

      const itemId = await createLineItem(db, itemData);
      expect(itemId).toBeGreaterThan(0);

      const item = await getLineItemById(db, itemId);
      expect(item).not.toBeNull();
      expect(item?.name).toBe('Bananas');
      expect(item?.quantity).toBe(3);
      expect(item?.totalPrice).toBe(4.5);
    });

    test('should create line item with minimal data', async () => {
      const itemData: CreateLineItemInput = {
        receiptId: testReceiptId,
        name: 'Apple',
        quantity: 1,
        unitPrice: 2.0,
        totalPrice: 2.0,
      };

      const itemId = await createLineItem(db, itemData);
      const item = await getLineItemById(db, itemId);

      expect(item).not.toBeNull();
      expect(item?.discount).toBe(0);
      expect(item?.taxAmount).toBe(0);
    });
  });

  describe('createLineItems', () => {
    test('should create multiple line items in transaction', async () => {
      const items: CreateLineItemInput[] = [
        {
          receiptId: testReceiptId,
          name: 'Item 1',
          quantity: 1,
          unitPrice: 10.0,
          totalPrice: 10.0,
        },
        {
          receiptId: testReceiptId,
          name: 'Item 2',
          quantity: 2,
          unitPrice: 15.0,
          totalPrice: 30.0,
        },
        {
          receiptId: testReceiptId,
          name: 'Item 3',
          quantity: 1,
          unitPrice: 5.0,
          totalPrice: 5.0,
        },
      ];

      const ids = await createLineItems(db, items);

      expect(ids).toHaveLength(3);
      expect(ids.every((id) => id > 0)).toBe(true);

      const lineItems = await getLineItemsByReceiptId(db, testReceiptId);
      expect(lineItems).toHaveLength(3);
    });
  });

  describe('getLineItemsByReceiptId', () => {
    test('should return all line items for a receipt', async () => {
      await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Item 1',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      });

      await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Item 2',
        quantity: 2,
        unitPrice: 20.0,
        totalPrice: 40.0,
      });

      const items = await getLineItemsByReceiptId(db, testReceiptId);

      expect(items).toHaveLength(2);
      expect(items[0].name).toBe('Item 1');
      expect(items[1].name).toBe('Item 2');
    });

    test('should return empty array if no items', async () => {
      const items = await getLineItemsByReceiptId(db, testReceiptId);
      expect(items).toHaveLength(0);
    });
  });

  describe('updateLineItem', () => {
    test('should update line item fields', async () => {
      const itemId = await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Old Name',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      });

      await updateLineItem(db, itemId, {
        name: 'New Name',
        quantity: 3,
        totalPrice: 30.0,
      });

      const item = await getLineItemById(db, itemId);
      expect(item?.name).toBe('New Name');
      expect(item?.quantity).toBe(3);
      expect(item?.totalPrice).toBe(30.0);
      expect(item?.unitPrice).toBe(10.0); // unchanged
    });
  });

  describe('deleteLineItem', () => {
    test('should delete line item', async () => {
      const itemId = await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Test Item',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      });

      await deleteLineItem(db, itemId);

      const item = await getLineItemById(db, itemId);
      expect(item).toBeNull();
    });
  });

  describe('getLineItemsCount', () => {
    test('should return total count', async () => {
      await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Item 1',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      });

      await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Item 2',
        quantity: 1,
        unitPrice: 20.0,
        totalPrice: 20.0,
      });

      const count = await getLineItemsCount(db, { receiptId: testReceiptId });
      expect(count).toBe(2);
    });
  });

  describe('cascading deletes', () => {
    test('should delete line items when receipt is deleted', async () => {
      const itemId = await createLineItem(db, {
        receiptId: testReceiptId,
        name: 'Test Item',
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
      });

      // Delete the receipt
      await db.runAsync('DELETE FROM receipts WHERE id = ?', testReceiptId);

      // Line item should be deleted
      const item = await getLineItemById(db, itemId);
      expect(item).toBeNull();
    });
  });
});
