/**
 * Receipt Service
 * CRUD operations for receipts
 */

import * as SQLite from 'expo-sqlite';
import {
  Receipt,
  CreateReceiptInput,
  UpdateReceiptInput,
  ReceiptQueryFilters,
  ReceiptWithItems,
} from '../../types/database.types';

/**
 * Create a new receipt
 */
export async function createReceipt(
  db: SQLite.SQLiteDatabase,
  receipt: CreateReceiptInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO receipts (
      store_name, store_location, purchase_date, total_amount,
      subtotal, tax, discount, payment_method, status,
      image_uri, ocr_data, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    receipt.storeName,
    receipt.storeLocation ?? null,
    receipt.purchaseDate.toISOString(),
    receipt.totalAmount,
    receipt.subtotal ?? null,
    receipt.tax ?? null,
    receipt.discount ?? null,
    receipt.paymentMethod ?? null,
    receipt.status ?? 'pending',
    receipt.imageUri ?? null,
    receipt.ocrData ?? null,
    receipt.notes ?? null
  );

  console.log('ReceiptService.createReceipt result:', result);
  return result.lastInsertRowId;
}

/**
 * Get receipt by ID
 */
export async function getReceiptById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Receipt | null> {
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM receipts WHERE id = ?',
    id
  );

  return row ? mapRowToReceipt(row) : null;
}

/**
 * Get receipt with line items
 */
export async function getReceiptWithItems(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<ReceiptWithItems | null> {
  const receipt = await getReceiptById(db, id);
  if (!receipt) return null;

  const items = await db.getAllAsync<any>(
    `SELECT li.*, c.name as category_name, c.department_id
     FROM line_items li
     LEFT JOIN categories c ON li.category_id = c.id
     WHERE li.receipt_id = ?
     ORDER BY li.id`,
    id
  );

  return {
    ...receipt,
    lineItems: items.map(mapRowToLineItem),
  };
}

/**
 * Get all receipts with optional filters
 */
export async function getReceipts(
  db: SQLite.SQLiteDatabase,
  filters?: ReceiptQueryFilters
): Promise<Receipt[]> {
  let sql = 'SELECT * FROM receipts WHERE 1=1';
  const params: any[] = [];

  if (filters?.storeName) {
    sql += ' AND store_name LIKE ?';
    params.push(`%${filters.storeName}%`);
  }

  if (filters?.startDate) {
    sql += ' AND purchase_date >= ?';
    params.push(filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    sql += ' AND purchase_date <= ?';
    params.push(filters.endDate.toISOString());
  }

  if (filters?.minAmount !== undefined) {
    sql += ' AND total_amount >= ?';
    params.push(filters.minAmount);
  }

  if (filters?.maxAmount !== undefined) {
    sql += ' AND total_amount <= ?';
    params.push(filters.maxAmount);
  }

  if (filters?.paymentMethod) {
    sql += ' AND payment_method = ?';
    params.push(filters.paymentMethod);
  }

  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  sql += ' ORDER BY purchase_date DESC';

  if (filters?.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters?.offset) {
    sql += ' OFFSET ?';
    params.push(filters.offset);
  }

  const rows = await db.getAllAsync<any>(sql, ...params);
  return rows.map(mapRowToReceipt);
}

/**
 * Update receipt
 */
export async function updateReceipt(
  db: SQLite.SQLiteDatabase,
  id: number,
  updates: UpdateReceiptInput
): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.storeName !== undefined) {
    fields.push('store_name = ?');
    params.push(updates.storeName);
  }

  if (updates.storeLocation !== undefined) {
    fields.push('store_location = ?');
    params.push(updates.storeLocation);
  }

  if (updates.purchaseDate !== undefined) {
    fields.push('purchase_date = ?');
    params.push(updates.purchaseDate.toISOString());
  }

  if (updates.totalAmount !== undefined) {
    fields.push('total_amount = ?');
    params.push(updates.totalAmount);
  }

  if (updates.subtotal !== undefined) {
    fields.push('subtotal = ?');
    params.push(updates.subtotal);
  }

  if (updates.tax !== undefined) {
    fields.push('tax = ?');
    params.push(updates.tax);
  }

  if (updates.discount !== undefined) {
    fields.push('discount = ?');
    params.push(updates.discount);
  }

  if (updates.paymentMethod !== undefined) {
    fields.push('payment_method = ?');
    params.push(updates.paymentMethod);
  }

  if (updates.status !== undefined) {
    fields.push('status = ?');
    params.push(updates.status);
  }

  if (updates.imageUri !== undefined) {
    fields.push('image_uri = ?');
    params.push(updates.imageUri);
  }

  if (updates.ocrData !== undefined) {
    fields.push('ocr_data = ?');
    params.push(updates.ocrData);
  }

  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes);
  }

  if (fields.length === 0) return;

  params.push(id);
  const sql = `UPDATE receipts SET ${fields.join(', ')} WHERE id = ?`;

  await db.runAsync(sql, ...params);
}

/**
 * Delete receipt (and cascades to line items)
 */
export async function deleteReceipt(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM receipts WHERE id = ?', id);
}

/**
 * Get receipts count with filters
 */
export async function getReceiptsCount(
  db: SQLite.SQLiteDatabase,
  filters?: ReceiptQueryFilters
): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM receipts WHERE 1=1';
  const params: any[] = [];

  if (filters?.storeName) {
    sql += ' AND store_name LIKE ?';
    params.push(`%${filters.storeName}%`);
  }

  if (filters?.startDate) {
    sql += ' AND purchase_date >= ?';
    params.push(filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    sql += ' AND purchase_date <= ?';
    params.push(filters.endDate.toISOString());
  }

  if (filters?.paymentMethod) {
    sql += ' AND payment_method = ?';
    params.push(filters.paymentMethod);
  }

  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
  return result?.count ?? 0;
}

/**
 * Helper: Map database row to Receipt object
 */
function mapRowToReceipt(row: any): Receipt {
  return {
    id: row.id,
    storeName: row.store_name,
    storeLocation: row.store_location,
    purchaseDate: new Date(row.purchase_date),
    totalAmount: row.total_amount,
    subtotal: row.subtotal,
    tax: row.tax,
    discount: row.discount,
    paymentMethod: row.payment_method,
    status: row.status,
    imageUri: row.image_uri,
    ocrData: row.ocr_data,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Helper: Map database row to LineItem object
 */
function mapRowToLineItem(row: any): any {
  return {
    id: row.id,
    receiptId: row.receipt_id,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalPrice: row.total_price,
    categoryId: row.category_id,
    departmentName: row.department_name,
    subcategoryType: row.subcategory_type,
    discount: row.discount,
    taxAmount: row.tax_amount,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
