// SQLite database schema definitions - receipts, items, merchants, products, price_database tables

export const SCHEMA = {
  receipts: `
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      merchant_name TEXT NOT NULL,
      date TEXT NOT NULL,
      total REAL NOT NULL,
      image_path TEXT NOT NULL,
      ocr_confidence REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    );
  `,

  line_items: `
    CREATE TABLE IF NOT EXISTS line_items (
      id TEXT PRIMARY KEY,
      receipt_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      confidence REAL NOT NULL,
      category TEXT,
      FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE
    );
  `,

  merchants: `
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      category TEXT NOT NULL,
      logo_url TEXT,
      patterns TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `,

  products: `
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      barcode TEXT,
      normalized_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `,

  product_prices: `
    CREATE TABLE IF NOT EXISTS product_prices (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      merchant_id TEXT NOT NULL,
      price REAL NOT NULL,
      date TEXT NOT NULL,
      source TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    );
  `,

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);',
    'CREATE INDEX IF NOT EXISTS idx_receipts_merchant ON receipts(merchant_id);',
    'CREATE INDEX IF NOT EXISTS idx_line_items_receipt ON line_items(receipt_id);',
    'CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);',
  ],
};
