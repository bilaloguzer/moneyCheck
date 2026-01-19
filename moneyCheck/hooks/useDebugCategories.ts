/**
 * Debug utility to check what's in the database
 * Add this to your receipt detail screen temporarily
 */

import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useEffect } from 'react';

export function useDebugCategories(receiptId: string) {
  const { db } = useDatabaseContext();

  useEffect(() => {
    if (!db || !receiptId) return;

    (async () => {
      console.log('🔍 DEBUGGING CATEGORIES FOR RECEIPT', receiptId);
      
      const items = await db.getAllAsync(
        `SELECT 
          li.id,
          li.name,
          li.category_id,
          li.department_id,
          li.subcategory_id,
          li.item_group_id,
          sub.name_tr as subcategory_name,
          d.name_tr as department_name
        FROM line_items li
        LEFT JOIN subcategories sub ON li.subcategory_id = sub.id
        LEFT JOIN departments d ON li.department_id = d.id
        WHERE li.receipt_id = ?`,
        parseInt(receiptId)
      );
      
      console.log('📊 LINE ITEMS DATA:');
      items.forEach((item: any) => {
        console.log(`  - ${item.name}:`);
        console.log(`    department_id: ${item.department_id}`);
        console.log(`    subcategory_id: ${item.subcategory_id}`);
        console.log(`    item_group_id: ${item.item_group_id}`);
        console.log(`    subcategory_name: ${item.subcategory_name}`);
        console.log(`    department_name: ${item.department_name}`);
      });
    })();
  }, [db, receiptId]);
}
