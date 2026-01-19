/**
 * Migration 002 - 4-Level Category System
 * This script reads the SQL from the separate file
 */

const fs = require('fs');
const path = require('path');

let migration002SQL = '';

try {
  const sqlPath = path.join(__dirname, 'migrations/migration_002_data.sql');
  migration002SQL = fs.readFileSync(sqlPath, 'utf-8');
} catch (error) {
  console.error('Error loading migration 002 SQL:', error);
}

export const MIGRATION_002_UP = `
-- Step 1: Drop old tables
DROP TABLE IF EXISTS category_items;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS departments;

-- Step 2: Create new schema with 4-level hierarchy
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  icon TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  department_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subcategories (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subcategory_id INTEGER NOT NULL,
  name_tr TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_department ON categories(department_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_item_groups_subcategory ON item_groups(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_item_groups_name ON item_groups(name_tr);

-- Step 3: Insert all data
${migration002SQL}
`;
