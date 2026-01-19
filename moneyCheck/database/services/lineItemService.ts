/**
 * Line Item Service
 * CRUD operations for line items
 */

import * as SQLite from 'expo-sqlite';
import {
  LineItem,
  CreateLineItemInput,
  UpdateLineItemInput,
  LineItemQueryFilters,
} from '../../types/database.types';

/**
 * Create a new line item
 */
export async function createLineItem(
  db: SQLite.SQLiteDatabase,
  lineItem: CreateLineItemInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO line_items (
      receipt_id, name, quantity, unit_price, total_price,
      category_id, department_name, subcategory_type,
      department_id, subcategory_id, item_group_id, category_confidence,
      discount, tax_amount, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    lineItem.receiptId, // Required field
    lineItem.name,
    lineItem.quantity,
    lineItem.unitPrice,
    lineItem.totalPrice,
    lineItem.categoryId ?? null,
    lineItem.departmentName ?? null,
    lineItem.subcategoryType ?? null,
    lineItem.departmentId ?? null,  // <-- NEW: Should be populated
    lineItem.subcategoryId ?? null,  // <-- NEW: Should be populated  
    lineItem.itemGroupId ?? null,    // <-- NEW: Should be populated
    lineItem.categoryConfidence ?? null,
    lineItem.discount ?? 0,
    lineItem.taxAmount ?? 0,
    lineItem.notes ?? null
  );
  
  console.log('🗂️ INSERT RESULT:', {
    lastInsertRowId: result.lastInsertRowId,
    departmentId: lineItem.departmentId,
    subcategoryId: lineItem.subcategoryId,
    itemGroupId: lineItem.itemGroupId
  });


  return result.lastInsertRowId;
}

/**
 * Create multiple line items in a transaction
 */
export async function createLineItems(
  db: SQLite.SQLiteDatabase,
  lineItems: CreateLineItemInput[]
): Promise<number[]> {
  const ids: number[] = [];

  await db.withTransactionAsync(async () => {
    for (const item of lineItems) {
      const id = await createLineItem(db, item);
      ids.push(id);
    }
  });

  return ids;
}

/**
 * Get line item by ID
 */
export async function getLineItemById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<LineItem | null> {
  const row = await db.getFirstAsync<any>(
    `SELECT li.*, 
            c.name_tr as category_name,
            d.name_tr as department_name_full, d.color_code as department_color,
            cat.name_tr as category_name_full, cat.color_code as category_color,
            sub.name_tr as subcategory_name, sub.color_code as subcategory_color,
            ig.name_tr as item_group_name
     FROM line_items li
     LEFT JOIN categories c ON li.category_id = c.id
     LEFT JOIN departments d ON li.department_id = d.id
     LEFT JOIN categories cat ON li.category_id = cat.id
     LEFT JOIN subcategories sub ON li.subcategory_id = sub.id
     LEFT JOIN item_groups ig ON li.item_group_id = ig.id
     WHERE li.id = ?`,
    id
  );

  return row ? mapRowToLineItem(row) : null;
}

/**
 * Get all line items for a receipt
 */
export async function getLineItemsByReceiptId(
  db: SQLite.SQLiteDatabase,
  receiptId: number
): Promise<LineItem[]> {
  const rows = await db.getAllAsync<any>(
    `SELECT li.*,
            d.name_tr as department_name_full, d.color_code as department_color,
            c.name_tr as category_name_full, c.color_code as category_color,
            sub.name_tr as subcategory_name, sub.color_code as subcategory_color,
            ig.name_tr as item_group_name
     FROM line_items li
     LEFT JOIN departments d ON li.department_id = d.id
     LEFT JOIN categories c ON li.category_id = c.id
     LEFT JOIN subcategories sub ON li.subcategory_id = sub.id
     LEFT JOIN item_groups ig ON li.item_group_id = ig.id
     WHERE li.receipt_id = ?
     ORDER BY li.id`,
    receiptId
  );

  console.log('📖 RAW DATABASE ROWS:', rows.map((r: any) => ({
    name: r.name,
    department_id: r.department_id,
    category_id: r.category_id,
    subcategory_id: r.subcategory_id,
    item_group_id: r.item_group_id,
    department_color: r.department_color,
    category_color: r.category_color,
    subcategory_color: r.subcategory_color,
  })));

  return rows.map(mapRowToLineItem);
}

/**
 * Get line items with filters
 */
export async function getLineItems(
  db: SQLite.SQLiteDatabase,
  filters?: LineItemQueryFilters
): Promise<LineItem[]> {
  let sql = `
    SELECT li.*, c.name_tr as category_name
    FROM line_items li
    LEFT JOIN categories c ON li.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.receiptId !== undefined) {
    sql += ' AND li.receipt_id = ?';
    params.push(filters.receiptId);
  }

  if (filters?.categoryId !== undefined) {
    sql += ' AND li.category_id = ?';
    params.push(filters.categoryId);
  }

  if (filters?.departmentName) {
    sql += ' AND li.department_name = ?';
    params.push(filters.departmentName);
  }

  if (filters?.minPrice !== undefined) {
    sql += ' AND li.total_price >= ?';
    params.push(filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    sql += ' AND li.total_price <= ?';
    params.push(filters.maxPrice);
  }

  sql += ' ORDER BY li.id';

  if (filters?.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters?.offset) {
    sql += ' OFFSET ?';
    params.push(filters.offset);
  }

  const rows = await db.getAllAsync<any>(sql, ...params);
  return rows.map(mapRowToLineItem);
}

/**
 * Update line item
 */
export async function updateLineItem(
  db: SQLite.SQLiteDatabase,
  id: number,
  updates: UpdateLineItemInput
): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }

  if (updates.quantity !== undefined) {
    fields.push('quantity = ?');
    params.push(updates.quantity);
  }

  if (updates.unitPrice !== undefined) {
    fields.push('unit_price = ?');
    params.push(updates.unitPrice);
  }

  if (updates.totalPrice !== undefined) {
    fields.push('total_price = ?');
    params.push(updates.totalPrice);
  }

  if (updates.categoryId !== undefined) {
    fields.push('category_id = ?');
    params.push(updates.categoryId);
  }

  if (updates.departmentName !== undefined) {
    fields.push('department_name = ?');
    params.push(updates.departmentName);
  }

  if (updates.subcategoryType !== undefined) {
    fields.push('subcategory_type = ?');
    params.push(updates.subcategoryType);
  }

  if (updates.discount !== undefined) {
    fields.push('discount = ?');
    params.push(updates.discount);
  }

  if (updates.taxAmount !== undefined) {
    fields.push('tax_amount = ?');
    params.push(updates.taxAmount);
  }

  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes);
  }

  if (fields.length === 0) return;

  params.push(id);
  const sql = `UPDATE line_items SET ${fields.join(', ')} WHERE id = ?`;

  await db.runAsync(sql, ...params);
}

/**
 * Delete line item
 */
export async function deleteLineItem(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM line_items WHERE id = ?', id);
}

/**
 * Delete all line items for a receipt
 */
export async function deleteLineItemsByReceiptId(
  db: SQLite.SQLiteDatabase,
  receiptId: number
): Promise<void> {
  await db.runAsync('DELETE FROM line_items WHERE receipt_id = ?', receiptId);
}

/**
 * Get total count of line items
 */
export async function getLineItemsCount(
  db: SQLite.SQLiteDatabase,
  filters?: LineItemQueryFilters
): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM line_items WHERE 1=1';
  const params: any[] = [];

  if (filters?.receiptId !== undefined) {
    sql += ' AND receipt_id = ?';
    params.push(filters.receiptId);
  }

  if (filters?.categoryId !== undefined) {
    sql += ' AND category_id = ?';
    params.push(filters.categoryId);
  }

  if (filters?.departmentName) {
    sql += ' AND department_name = ?';
    params.push(filters.departmentName);
  }

  const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
  return result?.count ?? 0;
}

/**
 * Helper: Map database row to LineItem object
 */
function mapRowToLineItem(row: any): LineItem {
  return {
    id: row.id,
    receiptId: row.receipt_id,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalPrice: row.total_price,
    categoryId: row.category_id,
    // NEW: Category hierarchy from 4-level system
    departmentId: row.department_id,
    subcategoryId: row.subcategory_id,
    itemGroupId: row.item_group_id,
    categoryConfidence: row.category_confidence,
    // Include category object with name if available
    category: row.category_name_full ? {
      id: row.category_id,
      name: row.category_name_full
    } : undefined,
    departmentName: row.department_name,
    subcategoryType: row.subcategory_type,
    // NEW: Include color codes from 4-level system
    departmentColor: row.department_color,
    categoryColor: row.category_color,
    subcategoryColor: row.subcategory_color,
    subcategoryName: row.subcategory_name,
    categoryNameFull: row.category_name_full,
    departmentNameFull: row.department_name_full,
    itemGroupName: row.item_group_name,
    discount: row.discount,
    taxAmount: row.tax_amount,
    notes: row.notes,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  } as LineItem;
}
