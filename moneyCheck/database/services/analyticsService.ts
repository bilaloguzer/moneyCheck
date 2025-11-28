/**
 * Analytics Service
 * Query operations for spending analytics and summaries
 */

import * as SQLite from 'expo-sqlite';
import {
  CategorySpendingSummary,
  DateRangeSpendingSummary,
} from '../../types/database.types';

/**
 * Get spending summary by category for a date range
 */
export async function getCategorySpendingSummary(
  db: SQLite.SQLiteDatabase,
  startDate?: Date,
  endDate?: Date
): Promise<CategorySpendingSummary[]> {
  let sql = `
    SELECT
      c.id as category_id,
      c.name as category_name,
      d.name as department_name,
      SUM(li.total_price) as total_spent,
      COUNT(li.id) as item_count,
      AVG(li.total_price) as average_price
    FROM line_items li
    LEFT JOIN categories c ON li.category_id = c.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN receipts r ON li.receipt_id = r.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (startDate) {
    sql += ' AND r.purchase_date >= ?';
    params.push(startDate.toISOString());
  }

  if (endDate) {
    sql += ' AND r.purchase_date <= ?';
    params.push(endDate.toISOString());
  }

  sql += ' GROUP BY c.id, c.name, d.name ORDER BY total_spent DESC';

  const rows = await db.getAllAsync<any>(sql, ...params);

  return rows.map((row) => ({
    categoryId: row.category_id,
    categoryName: row.category_name ?? 'Uncategorized',
    departmentName: row.department_name,
    totalSpent: row.total_spent,
    itemCount: row.item_count,
    averagePrice: row.average_price,
  }));
}

/**
 * Get spending summary for a date range
 */
export async function getDateRangeSpendingSummary(
  db: SQLite.SQLiteDatabase,
  startDate: Date,
  endDate: Date
): Promise<DateRangeSpendingSummary> {
  // Get overall totals
  const totalRow = await db.getFirstAsync<any>(
    `SELECT
      SUM(total_amount) as total_spent,
      COUNT(id) as receipt_count,
      AVG(total_amount) as average_receipt_amount
    FROM receipts
    WHERE purchase_date >= ? AND purchase_date <= ?`,
    startDate.toISOString(),
    endDate.toISOString()
  );

  // Get category breakdowns
  const categorySummaries = await getCategorySpendingSummary(db, startDate, endDate);

  return {
    startDate,
    endDate,
    totalSpent: totalRow?.total_spent ?? 0,
    receiptCount: totalRow?.receipt_count ?? 0,
    averageReceiptAmount: totalRow?.average_receipt_amount ?? 0,
    categorySummaries,
  };
}

/**
 * Get spending by store
 */
export async function getSpendingByStore(
  db: SQLite.SQLiteDatabase,
  startDate?: Date,
  endDate?: Date
): Promise<{ storeName: string; totalSpent: number; visitCount: number }[]> {
  let sql = `
    SELECT
      store_name,
      SUM(total_amount) as total_spent,
      COUNT(id) as visit_count
    FROM receipts
    WHERE 1=1
  `;

  const params: any[] = [];

  if (startDate) {
    sql += ' AND purchase_date >= ?';
    params.push(startDate.toISOString());
  }

  if (endDate) {
    sql += ' AND purchase_date <= ?';
    params.push(endDate.toISOString());
  }

  sql += ' GROUP BY store_name ORDER BY total_spent DESC';

  const rows = await db.getAllAsync<any>(sql, ...params);

  return rows.map((row) => ({
    storeName: row.store_name,
    totalSpent: row.total_spent,
    visitCount: row.visit_count,
  }));
}

/**
 * Get monthly spending totals
 */
export async function getMonthlySpending(
  db: SQLite.SQLiteDatabase,
  year: number
): Promise<{ month: number; totalSpent: number; receiptCount: number }[]> {
  const sql = `
    SELECT
      CAST(strftime('%m', purchase_date) AS INTEGER) as month,
      SUM(total_amount) as total_spent,
      COUNT(id) as receipt_count
    FROM receipts
    WHERE strftime('%Y', purchase_date) = ?
    GROUP BY month
    ORDER BY month
  `;

  const rows = await db.getAllAsync<any>(sql, year.toString());

  return rows.map((row) => ({
    month: row.month,
    totalSpent: row.total_spent,
    receiptCount: row.receipt_count,
  }));
}

/**
 * Get top spending items
 */
export async function getTopSpendingItems(
  db: SQLite.SQLiteDatabase,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<{
  name: string;
  totalSpent: number;
  purchaseCount: number;
  averagePrice: number;
}[]> {
  let sql = `
    SELECT
      li.name,
      SUM(li.total_price) as total_spent,
      COUNT(li.id) as purchase_count,
      AVG(li.total_price) as average_price
    FROM line_items li
    LEFT JOIN receipts r ON li.receipt_id = r.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (startDate) {
    sql += ' AND r.purchase_date >= ?';
    params.push(startDate.toISOString());
  }

  if (endDate) {
    sql += ' AND r.purchase_date <= ?';
    params.push(endDate.toISOString());
  }

  sql += ' GROUP BY li.name ORDER BY total_spent DESC LIMIT ?';
  params.push(limit);

  const rows = await db.getAllAsync<any>(sql, ...params);

  return rows.map((row) => ({
    name: row.name,
    totalSpent: row.total_spent,
    purchaseCount: row.purchase_count,
    averagePrice: row.average_price,
  }));
}

/**
 * Get spending trends (day of week)
 */
export async function getSpendingByDayOfWeek(
  db: SQLite.SQLiteDatabase,
  startDate?: Date,
  endDate?: Date
): Promise<{ dayOfWeek: number; totalSpent: number; receiptCount: number }[]> {
  let sql = `
    SELECT
      CAST(strftime('%w', purchase_date) AS INTEGER) as day_of_week,
      SUM(total_amount) as total_spent,
      COUNT(id) as receipt_count
    FROM receipts
    WHERE 1=1
  `;

  const params: any[] = [];

  if (startDate) {
    sql += ' AND purchase_date >= ?';
    params.push(startDate.toISOString());
  }

  if (endDate) {
    sql += ' AND purchase_date <= ?';
    params.push(endDate.toISOString());
  }

  sql += ' GROUP BY day_of_week ORDER BY day_of_week';

  const rows = await db.getAllAsync<any>(sql, ...params);

  return rows.map((row) => ({
    dayOfWeek: row.day_of_week,
    totalSpent: row.total_spent,
    receiptCount: row.receipt_count,
  }));
}

/**
 * Get total spending for all time
 */
export async function getTotalSpending(
  db: SQLite.SQLiteDatabase
): Promise<{ totalSpent: number; receiptCount: number; averageReceipt: number }> {
  const row = await db.getFirstAsync<any>(
    `SELECT
      SUM(total_amount) as total_spent,
      COUNT(id) as receipt_count,
      AVG(total_amount) as average_receipt
    FROM receipts`
  );

  return {
    totalSpent: row?.total_spent ?? 0,
    receiptCount: row?.receipt_count ?? 0,
    averageReceipt: row?.average_receipt ?? 0,
  };
}
