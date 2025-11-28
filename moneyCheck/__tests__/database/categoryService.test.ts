/**
 * Category Service Tests
 */

import * as SQLite from 'expo-sqlite';
import { initializeDatabase } from '../../database/schema';
import {
  createDepartment,
  getDepartments,
  createCategory,
  getCategoryById,
  getCategories,
  searchCategories,
  bulkImportCategories,
} from '../../database/services/categoryService';

describe('Category Service', () => {
  let db: SQLite.SQLiteDatabase;

  beforeAll(async () => {
    db = await SQLite.openDatabaseAsync(':memory:');
    await initializeDatabase(db);
  });

  afterAll(async () => {
    await db.closeAsync();
  });

  beforeEach(async () => {
    await db.execAsync('DELETE FROM departments');
    await db.execAsync('DELETE FROM categories');
    await db.execAsync('DELETE FROM subcategories');
    await db.execAsync('DELETE FROM category_items');
  });

  describe('Department Operations', () => {
    test('should create a department', async () => {
      const deptId = await createDepartment(db, 'Fresh Produce');
      expect(deptId).toBeGreaterThan(0);

      const departments = await getDepartments(db);
      expect(departments).toHaveLength(1);
      expect(departments[0].name).toBe('Fresh Produce');
    });

    test('should get all departments with categories', async () => {
      const deptId = await createDepartment(db, 'Test Department');

      await createCategory(db, {
        name: 'Test Category',
        department: deptId,
        items: ['Item 1', 'Item 2'],
      });

      const departments = await getDepartments(db);
      expect(departments).toHaveLength(1);
      expect(departments[0].categories).toHaveLength(1);
      expect(departments[0].categories[0].items).toEqual(['Item 1', 'Item 2']);
    });
  });

  describe('Category Operations', () => {
    test('should create category with direct items', async () => {
      const deptId = await createDepartment(db, 'Fresh Produce');

      const categoryId = await createCategory(db, {
        name: 'Fresh Herbs',
        department: deptId,
        items: ['Basil', 'Parsley', 'Cilantro'],
      });

      const category = await getCategoryById(db, categoryId);
      expect(category).not.toBeNull();
      expect(category?.name).toBe('Fresh Herbs');
      expect(category?.items).toEqual(['Basil', 'Parsley', 'Cilantro']);
    });

    test('should create category with subcategories', async () => {
      const deptId = await createDepartment(db, 'Fresh Produce');

      const categoryId = await createCategory(db, {
        name: 'Fresh Fruit',
        department: deptId,
        subcategories: [
          {
            type: 'Citrus',
            items: ['Lemons', 'Limes', 'Oranges'],
          },
          {
            type: 'Berries',
            items: ['Strawberries', 'Blueberries'],
          },
        ],
      });

      const category = await getCategoryById(db, categoryId);
      expect(category).not.toBeNull();
      expect(category?.subcategories).toHaveLength(2);
      expect(category?.subcategories?.[0].type).toBe('Citrus');
      expect(category?.subcategories?.[0].items).toEqual(['Lemons', 'Limes', 'Oranges']);
      expect(category?.subcategories?.[1].type).toBe('Berries');
    });

    test('should get all categories', async () => {
      const deptId = await createDepartment(db, 'Test Dept');

      await createCategory(db, {
        name: 'Category 1',
        department: deptId,
        items: ['Item A'],
      });

      await createCategory(db, {
        name: 'Category 2',
        department: deptId,
        items: ['Item B'],
      });

      const categories = await getCategories(db);
      expect(categories).toHaveLength(2);
    });

    test('should search categories by name', async () => {
      const deptId = await createDepartment(db, 'Test Dept');

      await createCategory(db, {
        name: 'Fresh Fruit',
        department: deptId,
      });

      await createCategory(db, {
        name: 'Fresh Vegetables',
        department: deptId,
      });

      await createCategory(db, {
        name: 'Frozen Foods',
        department: deptId,
      });

      const results = await searchCategories(db, 'Fresh');
      expect(results).toHaveLength(2);
      expect(results.every((c) => c.name.includes('Fresh'))).toBe(true);
    });
  });

  describe('Bulk Import', () => {
    test('should bulk import categories from supermarket structure', async () => {
      const testData = [
        {
          department: 'Fresh Produce',
          categories: [
            {
              name: 'Fresh Fruit',
              subcategories: [
                {
                  type: 'Citrus',
                  items: ['Lemons', 'Limes', 'Oranges'],
                },
                {
                  type: 'Berries',
                  items: ['Strawberries', 'Blueberries'],
                },
              ],
            },
            {
              name: 'Fresh Herbs',
              items: ['Basil', 'Parsley', 'Cilantro'],
            },
          ],
        },
        {
          department: 'Dairy',
          categories: [
            {
              name: 'Milk',
              items: ['Whole', '2%', 'Skim'],
            },
          ],
        },
      ];

      await bulkImportCategories(db, testData);

      // Verify departments
      const departments = await getDepartments(db);
      expect(departments).toHaveLength(2);

      // Verify Fresh Produce department
      const produceDept = departments.find((d) => d.name === 'Fresh Produce');
      expect(produceDept).toBeDefined();
      expect(produceDept?.categories).toHaveLength(2);

      // Verify Fresh Fruit category with subcategories
      const fruitCategory = produceDept?.categories.find((c) => c.name === 'Fresh Fruit');
      expect(fruitCategory?.subcategories).toHaveLength(2);
      expect(fruitCategory?.subcategories?.[0].items).toEqual(['Lemons', 'Limes', 'Oranges']);

      // Verify Fresh Herbs category with direct items
      const herbsCategory = produceDept?.categories.find((c) => c.name === 'Fresh Herbs');
      expect(herbsCategory?.items).toEqual(['Basil', 'Parsley', 'Cilantro']);

      // Verify Dairy department
      const dairyDept = departments.find((d) => d.name === 'Dairy');
      expect(dairyDept).toBeDefined();
      expect(dairyDept?.categories).toHaveLength(1);
      expect(dairyDept?.categories[0].items).toEqual(['Whole', '2%', 'Skim']);
    });

    test('should handle duplicate imports gracefully', async () => {
      const testData = [
        {
          department: 'Test Dept',
          categories: [
            {
              name: 'Test Category',
              items: ['Item 1'],
            },
          ],
        },
      ];

      // Import twice
      await bulkImportCategories(db, testData);
      await bulkImportCategories(db, testData);

      const departments = await getDepartments(db);
      expect(departments).toHaveLength(1); // Should not duplicate
    });
  });
});
