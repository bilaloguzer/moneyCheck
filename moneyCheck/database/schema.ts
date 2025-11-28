/**
 * SQLite Database Schema
 * Creates tables for receipts, line items, categories, and departments
 */

import * as SQLite from 'expo-sqlite';

/**
 * SQL statements for creating database tables
 */
export const createTablesSQL = `
  -- Departments table
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Categories table
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    UNIQUE(name, department_id)
  );

  -- Subcategories table
  CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(category_id, type)
  );

  -- Category items table (for flat item lists)
  CREATE TABLE IF NOT EXISTS category_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    subcategory_id INTEGER,
    item_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
    CHECK ((category_id IS NOT NULL AND subcategory_id IS NULL) OR
           (category_id IS NULL AND subcategory_id IS NOT NULL))
  );

  -- Receipts table
  CREATE TABLE IF NOT EXISTS receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_name TEXT NOT NULL,
    store_location TEXT,
    purchase_date DATETIME NOT NULL,
    total_amount REAL NOT NULL,
    subtotal REAL,
    tax REAL,
    discount REAL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'credit_card', 'debit_card', 'mobile_payment', 'gift_card', 'other')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processed', 'verified', 'archived')),
    image_uri TEXT,
    ocr_data TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Line items table
  CREATE TABLE IF NOT EXISTS line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    category_id INTEGER,
    department_name TEXT,
    subcategory_type TEXT,
    discount REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  -- Indexes for performance
  CREATE INDEX IF NOT EXISTS idx_receipts_purchase_date ON receipts(purchase_date);
  CREATE INDEX IF NOT EXISTS idx_receipts_store_name ON receipts(store_name);
  CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
  CREATE INDEX IF NOT EXISTS idx_line_items_receipt_id ON line_items(receipt_id);
  CREATE INDEX IF NOT EXISTS idx_line_items_category_id ON line_items(category_id);
  CREATE INDEX IF NOT EXISTS idx_categories_department_id ON categories(department_id);
`;

/**
 * Triggers for automatic updated_at timestamps
 */
export const createTriggersSQL = `
  -- Trigger for departments updated_at
  CREATE TRIGGER IF NOT EXISTS update_departments_timestamp
  AFTER UPDATE ON departments
  BEGIN
    UPDATE departments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  -- Trigger for categories updated_at
  CREATE TRIGGER IF NOT EXISTS update_categories_timestamp
  AFTER UPDATE ON categories
  BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  -- Trigger for subcategories updated_at
  CREATE TRIGGER IF NOT EXISTS update_subcategories_timestamp
  AFTER UPDATE ON subcategories
  BEGIN
    UPDATE subcategories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  -- Trigger for receipts updated_at
  CREATE TRIGGER IF NOT EXISTS update_receipts_timestamp
  AFTER UPDATE ON receipts
  BEGIN
    UPDATE receipts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  -- Trigger for line_items updated_at
  CREATE TRIGGER IF NOT EXISTS update_line_items_timestamp
  AFTER UPDATE ON line_items
  BEGIN
    UPDATE line_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;

/**
 * Initialize the database with schema
 */
export async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Create tables
    await db.execAsync(createTablesSQL);

    // Create triggers
    await db.execAsync(createTriggersSQL);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

/**
 * Drop all tables (use with caution!)
 */
export async function dropAllTables(db: SQLite.SQLiteDatabase): Promise<void> {
  const dropSQL = `
    DROP TABLE IF EXISTS line_items;
    DROP TABLE IF EXISTS receipts;
    DROP TABLE IF EXISTS category_items;
    DROP TABLE IF EXISTS subcategories;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS departments;
  `;

  try {
    await db.execAsync(dropSQL);
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}

/**
 * Reset database (drop and recreate all tables)
 */
export async function resetDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await dropAllTables(db);
  await initializeDatabase(db);
}
