/**
 * Category Seeds - 4-Level System
 * Seeds the complete Turkish market category hierarchy
 */

import * as SQLite from 'expo-sqlite';

/**
 * Seed the 4-level category data from JSON
 * This should be called after running migration 002
 */
export async function seedCategories(db: SQLite.SQLiteDatabase): Promise<void> {
  console.log('Seeding categories...');
  
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
    console.error('Error seeding categories:', error);
    throw error;
  }
}

/**
 * Check if categories need to be seeded
 */
export async function needsSeedCategories(db: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM departments'
    );
    return (result?.count ?? 0) === 0;
  } catch (error) {
    console.error('Error checking categories:', error);
    return true;
  }
}
