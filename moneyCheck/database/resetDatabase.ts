/**
 * Database Reset Utility
 * Use this to reset the database and re-run all migrations
 * 
 * WARNING: This will DELETE ALL your receipts and data!
 */

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

/**
 * Drop all tables and reset database to fresh state
 */
export async function resetDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🔴 RESETTING DATABASE - ALL DATA WILL BE LOST!');
  
  try {
    // Drop all tables
    await db.execAsync(`
      DROP TABLE IF EXISTS migrations;
      DROP TABLE IF EXISTS line_items;
      DROP TABLE IF EXISTS receipts;
      DROP TABLE IF EXISTS item_groups;
      DROP TABLE IF EXISTS subcategories;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS departments;
      DROP TABLE IF EXISTS category_items;
    `);
    
    console.log('✓ All tables dropped');
    
    // Re-run migrations
    console.log('Running migrations...');
    await runMigrations(db);
    
    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

/**
 * Check current migration version
 */
export async function checkMigrationVersion(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM migrations'
    );
    return result?.version ?? 0;
  } catch (error) {
    return 0;
  }
}
