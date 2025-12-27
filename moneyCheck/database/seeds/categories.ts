/**
 * Category Seeds
 * Initial category data for the application
 */

import * as SQLite from 'expo-sqlite';
import * as CategoryService from '../services/categoryService';

/**
 * Default category mappings based on OCR categories
 * These map to the categories used by the OCR service
 */
export const DEFAULT_CATEGORIES = [
  { name: 'groceries', displayName: 'Gıda' },
  { name: 'household', displayName: 'Ev Eşyaları' },
  { name: 'beverages', displayName: 'İçecekler' },
  { name: 'snacks', displayName: 'Atıştırmalıklar' },
  { name: 'personal_care', displayName: 'Kişisel Bakım' },
  { name: 'cleaning', displayName: 'Temizlik' },
  { name: 'other', displayName: 'Diğer' },
];

/**
 * Seed categories into the database
 * This function is idempotent - it can be run multiple times safely
 */
export async function seedCategories(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    console.log('Seeding categories...');
    
    for (const category of DEFAULT_CATEGORIES) {
      // Check if category already exists
      const existing = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM categories WHERE name = ?',
        category.name
      );
      
      if (!existing) {
        await CategoryService.createCategory(db, {
          name: category.name,
          items: [] // Empty items array, will be populated as items are categorized
        });
        console.log(`✅ Created category: ${category.name} (${category.displayName})`);
      } else {
        console.log(`⏭️  Category already exists: ${category.name}`);
      }
    }
    
    console.log('Categories seeded successfully');
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
      'SELECT COUNT(*) as count FROM categories'
    );
    return (result?.count ?? 0) === 0;
  } catch (error) {
    console.error('Error checking categories:', error);
    return true;
  }
}
