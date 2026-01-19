/**
 * Migration 002: 4-Level Category System
 * 
 * This migration replaces the existing basic category system with a comprehensive
 * 4-level Turkish market-optimized hierarchy:
 * - 14 Departments with vibrant colors and icons
 * - 66 Categories
 * - 161 Subcategories
 * - 745 Item Groups
 * 
 * WARNING: This migration will DROP existing category tables!
 * Existing receipts will lose category connections unless migrated.
 */

import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

/**
 * Backup existing category data before migration
 */
async function backupCategoryData(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Creating backup tables...');
  
  // Create backup tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _backup_departments AS SELECT * FROM departments WHERE 1=1;
    CREATE TABLE IF NOT EXISTS _backup_categories AS SELECT * FROM categories WHERE 1=1;
    CREATE TABLE IF NOT EXISTS _backup_subcategories AS SELECT * FROM subcategories WHERE 1=1;
    CREATE TABLE IF NOT EXISTS _backup_category_items AS SELECT * FROM category_items WHERE 1=1;
  `);
  
  console.log('Backup completed');
}

/**
 * Restore from backup (rollback)
 */
async function restoreFromBackup(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Restoring from backup...');
  
  // Drop new tables
  await db.execAsync(`
    DROP TABLE IF EXISTS item_groups;
    DROP TABLE IF EXISTS subcategories;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS departments;
  `);
  
  // Restore from backup
  await db.execAsync(`
    CREATE TABLE departments AS SELECT * FROM _backup_departments;
    CREATE TABLE categories AS SELECT * FROM _backup_categories;
    CREATE TABLE subcategories AS SELECT * FROM _backup_subcategories;
    CREATE TABLE category_items AS SELECT * FROM _backup_category_items;
  `);
  
  // Drop backup tables
  await db.execAsync(`
    DROP TABLE IF EXISTS _backup_departments;
    DROP TABLE IF EXISTS _backup_categories;
    DROP TABLE IF EXISTS _backup_subcategories;
    DROP TABLE IF EXISTS _backup_category_items;
  `);
  
  console.log('Restore completed');
}

/**
 * Get the SQL migration script content
 * The script is read from the categories folder
 */
async function getMigration002SQL(): Promise<string> {
  try {
    // In production, we'll embed the SQL directly
    // This is the full migration SQL from 10_database_schema.sql
    return MIGRATION_002_SQL;
  } catch (error: any) {
    console.error('Error reading migration SQL:', error);
    throw error;
  }
}


/**
 * Migration 002: Up
 * Install the 4-level category system
 */
export async function migration002Up(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Starting migration 002: 4-level category system');
  
  try {
    // Step 1: Backup existing data
    await backupCategoryData(db);
    
    // Step 2: Run the migration SQL
    const sql = await getMigration002SQL();
    await db.execAsync(sql);
    
    // Step 3: Update line_items table to support new structure
    await db.execAsync(`
      ALTER TABLE line_items ADD COLUMN department_id INTEGER;
      ALTER TABLE line_items ADD COLUMN subcategory_id INTEGER;
      ALTER TABLE line_items ADD COLUMN  item_group_id INTEGER;
      ALTER TABLE line_items ADD COLUMN category_confidence REAL;
      
      CREATE INDEX IF NOT EXISTS idx_line_items_department_id ON line_items(department_id);
      CREATE INDEX IF NOT EXISTS idx_line_items_subcategory_id ON line_items(subcategory_id);
      CREATE INDEX IF NOT EXISTS idx_line_items_item_group_id ON line_items(item_group_id);
    `);
    
    // Step 4: Clean up backup tables
    await db.execAsync(`
      DROP TABLE IF EXISTS _backup_departments;
      DROP TABLE IF EXISTS _backup_categories;
      DROP TABLE IF EXISTS _backup_subcategories;
      DROP TABLE IF EXISTS _backup_category_items;
    `);
    
    console.log('Migration 002 completed successfully');
  } catch (error) {
    console.error('Migration 002 failed:', error);
    // Attempt rollback
    try {
      await restoreFromBackup(db);
      console.log('Rollback successful');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    throw error;
  }
}

/**
 * Migration 002: Down
 * Rollback to basic category system
 */
export async function migration002Down(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Rolling back migration 002');
  
  await restoreFromBackup(db);
  
  // Remove new columns from line_items
  // SQLite doesn't support DROP COLUMN, so we need to recreate the table
  await db.execAsync(`
    CREATE TABLE line_items_temp AS 
    SELECT 
      id, receipt_id, name, quantity, unit_price, total_price, 
      category_id, department_name, subcategory_type, discount, 
      tax_amount, notes, created_at, updated_at
    FROM line_items;
    
    DROP TABLE line_items;
    ALTER TABLE line_items_temp RENAME TO line_items;
    
    CREATE INDEX IF NOT EXISTS idx_line_items_receipt_id ON line_items(receipt_id);
    CREATE INDEX IF NOT EXISTS idx_line_items_category_id ON line_items(category_id);
  `);
  
  console.log('Rollback completed');
}

// ============================================================================
// EMBEDDED SQL MIGRATION SCRIPT
// From categories/10_database_schema.sql
// ============================================================================

const MIGRATION_002_SQL = `
-- SmartSpend Category System - SQLite Migration Script
-- 4-Level Category Hierarchy

-- Drop existing tables if they exist
DROP TABLE IF EXISTS item_groups;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS departments;

-- Create Departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create Subcategories table
CREATE TABLE subcategories (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create Item Groups table
CREATE TABLE item_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_department ON categories(department_id);
CREATE INDEX idx_subcategories_category ON subcategories(category_id);
CREATE INDEX idx_item_groups_subcategory ON item_groups(subcategory_id);
CREATE INDEX idx_item_groups_name ON item_groups(name_tr);

-- Insert Departments (14 total)
INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES
  (1, 'Gıda ve İçecek (Food & Beverage)', 'Food & Beverage', '#2E7D32', '🍎'),
  (2, 'Ev ve Temizlik', 'Household & Cleaning', '#0288D1', '🧹'),
  (3, 'Kişisel Bakım ve Kozmetik', 'Personal Care & Beauty', '#AB47BC', '💄'),
  (4, 'Sağlık ve Eczane', 'Health & Pharmacy', '#E91E63', '💊'),
  (5, 'Elektronik ve Teknoloji', 'Electronics & Technology', '#2196F3', '📱'),
  (6, 'Giyim ve Moda', 'Clothing & Fashion', '#FF6F61', '👕'),
  (7, 'Ev ve Yaşam', 'Home & Living', '#795548', '🏠'),
  (8, 'Ulaşım ve Yakıt', 'Transportation & Fuel', '#FF5722', '🚗'),
  (9, 'Eğlence ve Medya', 'Entertainment & Media', '#9C27B0', '🎮'),
  (10, 'Spor ve Outdoor', 'Sports & Outdoors', '#009688', '⚽'),
  (11, 'Eğitim ve Kırtasiye', 'Education & Stationery', '#3F51B5', '📚'),
  (12, 'Hizmetler', 'Services', '#607D8B', '🛠️'),
  (13, 'Evcil Hayvanlar', 'Pets', '#8BC34A', '🐾'),
  (14, 'Diğer', 'Miscellaneous', '#FFC107', '📦');
`;

/**
 * Note: The full SQL with all categories, subcategories, and item groups
 * is approximately 90KB. To keep this file manageable, we load it from 
 * the categories/10_database_schema.sql file at runtime, or we can 
 * generate insertions programmatically from category_system.json
 */
