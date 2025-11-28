/**
 * Database Schema Tests
 * Test database initialization, migrations, and schema creation
 */

import * as SQLite from 'expo-sqlite';
import { initializeDatabase, resetDatabase } from '../../database/schema';

describe('Database Schema', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await SQLite.openDatabaseAsync(':memory:');
  });

  afterAll(async () => {
    await db.closeAsync();
  });

  test('should initialize database with all tables', async () => {
    await initializeDatabase(db);

    // Check if all tables exist
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('departments');
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('subcategories');
    expect(tableNames).toContain('category_items');
    expect(tableNames).toContain('receipts');
    expect(tableNames).toContain('line_items');
  });

  test('should create indexes', async () => {
    await initializeDatabase(db);

    const indexes = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'"
    );

    const indexNames = indexes.map((i) => i.name);

    expect(indexNames).toContain('idx_receipts_purchase_date');
    expect(indexNames).toContain('idx_receipts_store_name');
    expect(indexNames).toContain('idx_line_items_receipt_id');
    expect(indexNames).toContain('idx_line_items_category_id');
  });

  test('should create triggers for updated_at', async () => {
    await initializeDatabase(db);

    const triggers = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='trigger'"
    );

    const triggerNames = triggers.map((t) => t.name);

    expect(triggerNames).toContain('update_receipts_timestamp');
    expect(triggerNames).toContain('update_line_items_timestamp');
    expect(triggerNames).toContain('update_categories_timestamp');
  });

  test('should reset database (drop and recreate tables)', async () => {
    await initializeDatabase(db);

    // Insert test data
    await db.runAsync('INSERT INTO departments (name) VALUES (?)', 'Test Dept');

    const beforeReset = await db.getAllAsync<{ name: string }>(
      'SELECT name FROM departments'
    );
    expect(beforeReset.length).toBe(1);

    // Reset database
    await resetDatabase(db);

    const afterReset = await db.getAllAsync<{ name: string }>(
      'SELECT name FROM departments'
    );
    expect(afterReset.length).toBe(0);

    // Verify tables still exist
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='departments'"
    );
    expect(tables.length).toBe(1);
  });
});
