/**
 * Category Service
 * CRUD operations for categories, departments, and subcategories
 */

import * as SQLite from 'expo-sqlite';
import {
  Category,
  Department,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../types/database.types';

// ============================================================================
// Department Operations
// ============================================================================

/**
 * Create a department
 */
export async function createDepartment(
  db: SQLite.SQLiteDatabase,
  name: string
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO departments (name) VALUES (?)',
    name
  );
  return result.lastInsertRowId;
}

/**
 * Get all departments
 */
export async function getDepartments(
  db: SQLite.SQLiteDatabase
): Promise<Department[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM departments ORDER BY name');

  const departments: Department[] = [];
  for (const row of rows) {
    const categories = await getCategoriesByDepartmentId(db, row.id);
    departments.push({
      id: row.id,
      name: row.name,
      categories,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  return departments;
}

/**
 * Get department by ID
 */
export async function getDepartmentById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Department | null> {
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM departments WHERE id = ?',
    id
  );

  if (!row) return null;

  const categories = await getCategoriesByDepartmentId(db, id);

  return {
    id: row.id,
    name: row.name,
    categories,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Update department
 */
export async function updateDepartment(
  db: SQLite.SQLiteDatabase,
  id: number,
  name: string
): Promise<void> {
  await db.runAsync('UPDATE departments SET name = ? WHERE id = ?', name, id);
}

/**
 * Delete department
 */
export async function deleteDepartment(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM departments WHERE id = ?', id);
}

// ============================================================================
// Category Operations
// ============================================================================

/**
 * Create a category
 */
export async function createCategory(
  db: SQLite.SQLiteDatabase,
  category: CreateCategoryInput
): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO categories (name, department_id) VALUES (?, ?)',
    category.name,
    category.department ?? null
  );

  const categoryId = result.lastInsertRowId;

  // Add items if provided
  if (category.items && category.items.length > 0) {
    for (const item of category.items) {
      await db.runAsync(
        'INSERT INTO category_items (category_id, item_name) VALUES (?, ?)',
        categoryId,
        item
      );
    }
  }

  // Add subcategories if provided
  if (category.subcategories && category.subcategories.length > 0) {
    for (const sub of category.subcategories) {
      const subResult = await db.runAsync(
        'INSERT INTO subcategories (category_id, type) VALUES (?, ?)',
        categoryId,
        sub.type
      );

      const subcategoryId = subResult.lastInsertRowId;

      // Add items to subcategory
      if (sub.items && sub.items.length > 0) {
        for (const item of sub.items) {
          await db.runAsync(
            'INSERT INTO category_items (subcategory_id, item_name) VALUES (?, ?)',
            subcategoryId,
            item
          );
        }
      }
    }
  }

  return categoryId;
}

/**
 * Get category by ID with full details
 */
export async function getCategoryById(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<Category | null> {
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM categories WHERE id = ?',
    id
  );

  if (!row) return null;

  return mapRowToCategory(db, row);
}

/**
 * Get categories by department ID
 */
export async function getCategoriesByDepartmentId(
  db: SQLite.SQLiteDatabase,
  departmentId: number
): Promise<Category[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM categories WHERE department_id = ? ORDER BY name',
    departmentId
  );

  const categories: Category[] = [];
  for (const row of rows) {
    categories.push(await mapRowToCategory(db, row));
  }

  return categories;
}

/**
 * Get all categories
 */
export async function getCategories(
  db: SQLite.SQLiteDatabase
): Promise<Category[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM categories ORDER BY name');

  const categories: Category[] = [];
  for (const row of rows) {
    categories.push(await mapRowToCategory(db, row));
  }

  return categories;
}

/**
 * Update category
 */
export async function updateCategory(
  db: SQLite.SQLiteDatabase,
  id: number,
  updates: UpdateCategoryInput
): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }

  if (updates.department !== undefined) {
    fields.push('department_id = ?');
    params.push(updates.department);
  }

  if (fields.length === 0) return;

  params.push(id);
  const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;

  await db.runAsync(sql, ...params);
}

/**
 * Delete category (cascades to subcategories and items)
 */
export async function deleteCategory(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM categories WHERE id = ?', id);
}

/**
 * Search categories by name
 */
export async function searchCategories(
  db: SQLite.SQLiteDatabase,
  searchTerm: string
): Promise<Category[]> {
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM categories WHERE name LIKE ? ORDER BY name',
    `%${searchTerm}%`
  );

  const categories: Category[] = [];
  for (const row of rows) {
    categories.push(await mapRowToCategory(db, row));
  }

  return categories;
}

// ============================================================================
// Bulk Import
// ============================================================================

/**
 * Bulk import categories from supermarket inventory structure
 */
export async function bulkImportCategories(
  db: SQLite.SQLiteDatabase,
  departments: { department: string; categories: any[] }[]
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const dept of departments) {
      // Create department
      const deptResult = await db.runAsync(
        'INSERT OR IGNORE INTO departments (name) VALUES (?)',
        dept.department
      );

      const deptId = deptResult.lastInsertRowId;

      // Get department ID if it already exists
      const existingDept = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM departments WHERE name = ?',
        dept.department
      );

      const departmentId = existingDept?.id ?? deptId;

      // Create categories
      for (const cat of dept.categories) {
        const catResult = await db.runAsync(
          'INSERT OR IGNORE INTO categories (name, department_id) VALUES (?, ?)',
          cat.name,
          departmentId
        );

        const catId = catResult.lastInsertRowId;

        // Get category ID if it already exists
        const existingCat = await db.getFirstAsync<{ id: number }>(
          'SELECT id FROM categories WHERE name = ? AND department_id = ?',
          cat.name,
          departmentId
        );

        const categoryId = existingCat?.id ?? catId;

        // Add items directly to category
        if (cat.items) {
          for (const item of cat.items) {
            await db.runAsync(
              'INSERT OR IGNORE INTO category_items (category_id, item_name) VALUES (?, ?)',
              categoryId,
              item
            );
          }
        }

        // Add subcategories
        if (cat.subcategories) {
          for (const sub of cat.subcategories) {
            const subResult = await db.runAsync(
              'INSERT OR IGNORE INTO subcategories (category_id, type) VALUES (?, ?)',
              categoryId,
              sub.type
            );

            const subId = subResult.lastInsertRowId;

            const existingSub = await db.getFirstAsync<{ id: number }>(
              'SELECT id FROM subcategories WHERE category_id = ? AND type = ?',
              categoryId,
              sub.type
            );

            const subcategoryId = existingSub?.id ?? subId;

            // Add items to subcategory
            if (sub.items) {
              for (const item of sub.items) {
                await db.runAsync(
                  'INSERT OR IGNORE INTO category_items (subcategory_id, item_name) VALUES (?, ?)',
                  subcategoryId,
                  item
                );
              }
            }
          }
        }
      }
    }
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get category ID by name (case-insensitive)
 */
export async function getCategoryIdByName(
  db: SQLite.SQLiteDatabase,
  categoryName: string
): Promise<number | null> {
  const row = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM categories WHERE LOWER(name) = LOWER(?)',
    categoryName
  );
  return row?.id ?? null;
}

/**
 * Map database row to Category object with full details
 */
async function mapRowToCategory(
  db: SQLite.SQLiteDatabase,
  row: any
): Promise<Category> {
  const category: Category = {
    id: row.id,
    name: row.name,
    department: row.department_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };

  // Get direct items
  const items = await db.getAllAsync<{ item_name: string }>(
    'SELECT item_name FROM category_items WHERE category_id = ?',
    row.id
  );

  if (items.length > 0) {
    category.items = items.map((i) => i.item_name);
  }

  // Get subcategories
  const subRows = await db.getAllAsync<any>(
    'SELECT * FROM subcategories WHERE category_id = ?',
    row.id
  );

  if (subRows.length > 0) {
    category.subcategories = [];
    for (const subRow of subRows) {
      const subItems = await db.getAllAsync<{ item_name: string }>(
        'SELECT item_name FROM category_items WHERE subcategory_id = ?',
        subRow.id
      );

      category.subcategories.push({
        type: subRow.type,
        items: subItems.map((i) => i.item_name),
      });
    }
  }

  return category;
}
