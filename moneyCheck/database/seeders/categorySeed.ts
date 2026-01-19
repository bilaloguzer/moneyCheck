/**
 * Category System Data Seeder
 * Loads the complete 4-level category data into the database
 */

import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

/**
 * Seed the 4-level category data
 * This should be called after running migration 002
 */
export async function seedCategoryData(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Starting category data seeding...');
  
  try {
    // Read the SQL file
    const Asset = require('expo-asset').Asset;
    const sqlAsset = Asset.fromModule(require('../migrations/migration_002_data.sql'));
    await sqlAsset.downloadAsync();
    
    const sqlContent = await FileSystem.readAsStringAsync(sqlAsset.localUri!);
    
    // Execute in a transaction for performance and atomicity
    await db.execAsync('BEGIN TRANSACTION;');
    
    try {
      // Split by newlines and execute line by line
      const lines = sqlContent.split('\n');
      let currentStatement = '';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('--')) {
          continue;
        }
        
        currentStatement += line + '\n';
        
        // If line ends with semicolon, execute the statement
        if (trimmed.endsWith(';')) {
          await db.execAsync(currentStatement);
          currentStatement = '';
        }
      }
      
      await db.execAsync('COMMIT;');
      console.log('✅ Category data seeding completed successfully');
      
      // Log statistics
      const deptCount = await db.getAllAsync('SELECT COUNT(*) as count FROM departments');
      const catCount = await db.getAllAsync('SELECT COUNT(*) as count FROM categories');
      const subcatCount = await db.getAllAsync('SELECT COUNT(*) as count FROM subcategories');
      const itemCount = await db.getAllAsync('SELECT COUNT(*) as count FROM item_groups');
      
      console.log('📊 Category System Statistics:');
      console.log(`  - Departments: ${(deptCount[0] as any).count}`);
      console.log(`  - Categories: ${(catCount[0] as any).count}`);
      console.log(`  - Subcategories: ${(subcatCount[0] as any).count}`);
      console.log(`  - Item Groups: ${(itemCount[0] as any).count}`);
      
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error seeding category data:', error);
    throw error;
  }
}

/**
 * Alternative: Use JSON-based seeding (more reliable for React Native)
 */
export async function seedCategoryDataFromJSON(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Starting category data seeding from JSON...');
  
  try {
    // Import the JSON file directly
    const categorySystem = require('../../categories/category_system.json');
    
    await db.execAsync('BEGIN TRANSACTION;');
    
    try {
      // Insert departments
      for (const dept of categorySystem.departments) {
        await db.runAsync(
          'INSERT INTO departments (id, name_tr, name_en, color_code, icon) VALUES (?, ?, ?, ?, ?)',
          [dept.id, dept.name, dept.name_en, dept.color, dept.icon]
        );
        
        // Insert categories for this department
        for (const cat of dept.categories) {
          await db.runAsync(
            'INSERT INTO categories (id, department_id, name_tr, name_en, color_code) VALUES (?, ?, ?, ?, ?)',
            [cat.id, dept.id, cat.name, cat.name_en, cat.color]
          );
          
          // Insert subcategories
          for (const subcat of cat.subcategories) {
            await db.runAsync(
              'INSERT INTO subcategories (id, category_id, name_tr, name_en, color_code) VALUES (?, ?, ?, ?, ?)',
              [subcat.id, cat.id, subcat.name, subcat.name_en, subcat.color]
            );
            
            // Insert item groups
            if (subcat.item_groups && subcat.item_groups.length > 0) {
              for (const item of subcat.item_groups) {
                await db.runAsync(
                  'INSERT INTO item_groups (subcategory_id, name_tr) VALUES (?, ?)',
                  [subcat.id, item]
                );
              }
            }
          }
        }
      }
      
      await db.execAsync('COMMIT;');
      console.log('✅ Category data seeding completed successfully');
      
      // Log statistics
      const deptCount = await db.getAllAsync('SELECT COUNT(*) as count FROM departments');
      const catCount = await db.getAllAsync('SELECT COUNT(*) as count FROM categories');
      const subcatCount = await db.getAllAsync('SELECT COUNT(*) as count FROM subcategories');
      const itemCount = await db.getAllAsync('SELECT COUNT(*) as count FROM item_groups');
      
      console.log('📊 Category System Statistics:');
      console.log(`  - Departments: ${(deptCount[0] as any).count}`);
      console.log(`  - Categories: ${(catCount[0] as any).count}`);
      console.log(`  - Subcategories: ${(subcatCount[0] as any).count}`);
      console.log(`  - Item Groups: ${(itemCount[0] as any).count}`);
      
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error seeding category data:', error);
    throw error;
  }
}

/**
 * Check if category data is already seeded
 */
export async function isCategoryDataSeeded(db: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM departments');
    return (result[0] as any).count > 0;
  } catch (error) {
    return false;
  }
}
