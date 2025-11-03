// Initial database migration - creates core tables
import { SCHEMA } from '../schema';
import type { Migration } from '@/lib/types';

export const migration_001: Migration = {
  version: 1,
  name: 'initial_schema',

  up: async (db: any) => {
    await db.execAsync(SCHEMA.receipts);
    await db.execAsync(SCHEMA.line_items);
    await db.execAsync(SCHEMA.merchants);
    await db.execAsync(SCHEMA.products);
    await db.execAsync(SCHEMA.product_prices);

    for (const index of SCHEMA.indexes) {
      await db.execAsync(index);
    }
  },

  down: async (db: any) => {
    await db.execAsync('DROP TABLE IF EXISTS product_prices;');
    await db.execAsync('DROP TABLE IF EXISTS products;');
    await db.execAsync('DROP TABLE IF EXISTS line_items;');
    await db.execAsync('DROP TABLE IF EXISTS receipts;');
    await db.execAsync('DROP TABLE IF EXISTS merchants;');
  },
};
