/**
 * Database Migrations
 * Handles versioned schema updates
 */

import * as SQLite from 'expo-sqlite';

/**
 * Migration definition
 */
interface Migration {
  version: number;
  name: string;
  up: string;
  down?: string;
}

/**
 * All migrations in order
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
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

      -- Category items table
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

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_receipts_purchase_date ON receipts(purchase_date);
      CREATE INDEX IF NOT EXISTS idx_receipts_store_name ON receipts(store_name);
      CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
      CREATE INDEX IF NOT EXISTS idx_line_items_receipt_id ON line_items(receipt_id);
      CREATE INDEX IF NOT EXISTS idx_line_items_category_id ON line_items(category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_department_id ON categories(department_id);

      -- Triggers
      CREATE TRIGGER IF NOT EXISTS update_departments_timestamp
      AFTER UPDATE ON departments
      BEGIN
        UPDATE departments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_categories_timestamp
      AFTER UPDATE ON categories
      BEGIN
        UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_subcategories_timestamp
      AFTER UPDATE ON subcategories
      BEGIN
        UPDATE subcategories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_receipts_timestamp
      AFTER UPDATE ON receipts
      BEGIN
        UPDATE receipts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;

      CREATE TRIGGER IF NOT EXISTS update_line_items_timestamp
      AFTER UPDATE ON line_items
      BEGIN
        UPDATE line_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `,
    down: `
      DROP TABLE IF EXISTS line_items;
      DROP TABLE IF EXISTS receipts;
      DROP TABLE IF EXISTS category_items;
      DROP TABLE IF EXISTS subcategories;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS departments;
      DROP TRIGGER IF EXISTS update_departments_timestamp;
      DROP TRIGGER IF EXISTS update_categories_timestamp;
      DROP TRIGGER IF EXISTS update_subcategories_timestamp;
      DROP TRIGGER IF EXISTS update_receipts_timestamp;
      DROP TRIGGER IF EXISTS update_line_items_timestamp;
    `,
  },
  {
    version: 2,
    name: '4_level_category_system',
    up: `
      -- Migration 002: 4-Level Turkish Market Category System
      -- IMPORTANT: This will drop existing category tables
      
      -- Drop old tables
      DROP TABLE IF EXISTS category_items;
      DROP TABLE IF EXISTS subcategories;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS departments;
      
      -- Create new 4-level schema
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY,
        name_tr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        color_code TEXT NOT NULL,
        icon TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY,
        department_id INTEGER NOT NULL,
        name_tr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        color_code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
      );
      
      CREATE TABLE subcategories (
        id INTEGER PRIMARY KEY,
        category_id INTEGER NOT NULL,
        name_tr TEXT NOT NULL,
        name_en TEXT NOT NULL,
        color_code TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
      
      CREATE TABLE item_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subcategory_id INTEGER NOT NULL,
        name_tr TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
      );
      
      -- Indexes
      CREATE INDEX idx_categories_department ON categories(department_id);
      CREATE INDEX idx_subcategories_category ON subcategories(category_id);
      CREATE INDEX idx_item_groups_subcategory ON item_groups(subcategory_id);
      CREATE INDEX idx_item_groups_name ON item_groups(name_tr);
      
      -- Add new columns to line_items table for 4-level category system
      -- Use separate ALTER TABLE statements for compatibility
      ALTER TABLE line_items ADD COLUMN department_id INTEGER;
      ALTER TABLE line_items ADD COLUMN subcategory_id INTEGER;
      ALTER TABLE line_items ADD COLUMN item_group_id INTEGER;
      ALTER TABLE line_items ADD COLUMN category_confidence REAL;
      
      -- Add indexes for the new columns
      CREATE INDEX IF NOT EXISTS idx_line_items_department_id ON line_items(department_id);
      CREATE INDEX IF NOT EXISTS idx_line_items_subcategory_id ON line_items(subcategory_id);
      CREATE INDEX IF NOT EXISTS idx_line_items_item_group_id ON line_items(item_group_id);
      
      -- NOTE: Data insertion is handled separately in database initialization
      -- to avoid making the migration too large
    `,
    down: `
      -- Rollback to old schema
      DROP TABLE IF EXISTS item_groups;
      DROP TABLE IF EXISTS subcategories;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS departments;
      
      -- Recreate old schema
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        UNIQUE(name, department_id)
      );

      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(category_id, type)
      );

      CREATE TABLE IF NOT EXISTS category_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        subcategory_id INTEGER,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE,
        UNIQUE(category_id, subcategory_id, name)
      );
    `,
  },
];

/**
 * Create migrations table to track applied migrations
 */
async function createMigrationsTable(db: SQLite.SQLiteDatabase): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL UNIQUE,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await db.execAsync(sql);
}

/**
 * Get current database version
 */
async function getCurrentVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations'
    );
    return result?.version ?? 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Record migration as applied
 */
async function recordMigration(
  db: SQLite.SQLiteDatabase,
  migration: Migration
): Promise<void> {
  await db.runAsync(
    'INSERT INTO migrations (version, name) VALUES (?, ?)',
    migration.version,
    migration.name
  );
}

/**
 * Run all pending migrations
 */
export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Create migrations tracking table
    await createMigrationsTable(db);

    // Get current version
    const currentVersion = await getCurrentVersion(db);
    console.log(`Current database version: ${currentVersion}`);

    // Filter and sort pending migrations
    const pendingMigrations = migrations
      .filter((m) => m.version > currentVersion)
      .sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      console.log('Database is up to date');
      return;
    }

    console.log(`Running ${pendingMigrations.length} pending migration(s)...`);

    // Run each migration
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);

      try {
        await db.execAsync(migration.up);
        await recordMigration(db, migration);
        console.log(`Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`Error applying migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

/**
 * Rollback to a specific version
 */
export async function rollbackToVersion(
  db: SQLite.SQLiteDatabase,
  targetVersion: number
): Promise<void> {
  const currentVersion = await getCurrentVersion(db);

  if (targetVersion >= currentVersion) {
    console.log('Target version is current or newer, no rollback needed');
    return;
  }

  // Get migrations to rollback (in reverse order)
  const migrationsToRollback = migrations
    .filter((m) => m.version > targetVersion && m.version <= currentVersion)
    .sort((a, b) => b.version - a.version);

  console.log(`Rolling back ${migrationsToRollback.length} migration(s)...`);

  for (const migration of migrationsToRollback) {
    if (!migration.down) {
      throw new Error(`Migration ${migration.version} does not have a rollback script`);
    }

    console.log(`Rolling back migration ${migration.version}: ${migration.name}`);

    try {
      await db.execAsync(migration.down);
      await db.runAsync('DELETE FROM migrations WHERE version = ?', migration.version);
      console.log(`Migration ${migration.version} rolled back successfully`);
    } catch (error) {
      console.error(`Error rolling back migration ${migration.version}:`, error);
      throw error;
    }
  }

  console.log(`Rollback to version ${targetVersion} completed`);
}

/**
 * Get list of applied migrations
 */
export async function getAppliedMigrations(
  db: SQLite.SQLiteDatabase
): Promise<{ version: number; name: string; applied_at: string }[]> {
  try {
    await createMigrationsTable(db);
    const result = await db.getAllAsync<{ version: number; name: string; applied_at: string }>(
      'SELECT version, name, applied_at FROM migrations ORDER BY version'
    );
    return result;
  } catch (error) {
    console.error('Error fetching applied migrations:', error);
    return [];
  }
}
