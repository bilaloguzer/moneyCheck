-- =====================================================
-- moneyCheck Initial Database Schema
-- =====================================================
-- This migration creates the core tables for receipt management
-- and price comparison functionality.

-- =====================================================
-- RECEIPTS
-- =====================================================
-- Stores receipt header information
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Receipt metadata
  merchant_name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- OCR metadata
  ocr_confidence DECIMAL(3,2),
  image_url TEXT,  -- Stored in Supabase Storage
  
  -- Location (optional, for future regional price insights)
  purchase_location_city TEXT,
  
  -- Sync metadata
  synced_from_device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Privacy flag (for price aggregation opt-out)
  is_public BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- LINE ITEMS
-- =====================================================
-- Stores individual products from receipts
CREATE TABLE line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Product information
  product_name TEXT NOT NULL,
  
  -- Pricing
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  
  -- Unit type
  unit TEXT DEFAULT 'pcs',  -- 'pcs', 'kg', 'L', 'g'
  
  -- Category (from OCR or user edit)
  category TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PRICE INSIGHTS
-- =====================================================
-- Aggregated price data for comparison
-- Updated daily via cron job or Edge Function
CREATE TABLE price_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product identification (simple text match for MVP)
  product_name TEXT NOT NULL,
  normalized_product_name TEXT NOT NULL,  -- lowercase, trimmed for matching
  
  -- Merchant
  merchant_name TEXT NOT NULL,
  
  -- Aggregated pricing
  avg_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2) NOT NULL,
  max_price DECIMAL(10,2) NOT NULL,
  sample_count INT NOT NULL,  -- Number of purchases this is based on
  
  -- Location (optional, for regional pricing)
  city TEXT,
  
  -- Freshness
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(normalized_product_name, merchant_name, city)
);

-- =====================================================
-- INDEXES (Performance)
-- =====================================================
-- Essential indexes only (no premature optimization)

-- Receipts
CREATE INDEX idx_receipts_user ON receipts(user_id);
CREATE INDEX idx_receipts_date ON receipts(purchase_date DESC);
CREATE INDEX idx_receipts_merchant ON receipts(merchant_name);

-- Line Items
CREATE INDEX idx_line_items_receipt ON line_items(receipt_id);
CREATE INDEX idx_line_items_user ON line_items(user_id);
CREATE INDEX idx_line_items_product ON line_items(product_name);

-- Price Insights
CREATE INDEX idx_price_insights_product ON price_insights(normalized_product_name);
CREATE INDEX idx_price_insights_merchant ON price_insights(merchant_name);

-- =====================================================
-- ROW LEVEL SECURITY (Privacy)
-- =====================================================
-- Users can only access their own data

-- Receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Line Items
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own line items"
  ON line_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own line items"
  ON line_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own line items"
  ON line_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own line items"
  ON line_items FOR DELETE
  USING (auth.uid() = user_id);

-- Price Insights (Read-only for all authenticated users)
ALTER TABLE price_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view price insights"
  ON price_insights FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to normalize product names for matching
CREATE OR REPLACE FUNCTION normalize_product_name(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(REGEXP_REPLACE(name, '[^a-z0-9\s]', '', 'gi')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update receipt's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on receipts
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AGGREGATION FUNCTION (For Price Insights)
-- =====================================================
-- This function calculates average prices from line items
-- Run this periodically (daily) to update price_insights table

CREATE OR REPLACE FUNCTION refresh_price_insights()
RETURNS void AS $$
BEGIN
  -- Delete old insights (we'll recalculate from scratch)
  TRUNCATE price_insights;
  
  -- Calculate new insights from last 90 days of data
  INSERT INTO price_insights (
    product_name,
    normalized_product_name,
    merchant_name,
    avg_price,
    min_price,
    max_price,
    sample_count,
    city,
    last_updated
  )
  SELECT
    li.product_name,
    normalize_product_name(li.product_name) as normalized_product_name,
    r.merchant_name,
    AVG(li.unit_price)::DECIMAL(10,2) as avg_price,
    MIN(li.unit_price)::DECIMAL(10,2) as min_price,
    MAX(li.unit_price)::DECIMAL(10,2) as max_price,
    COUNT(*)::INT as sample_count,
    r.purchase_location_city as city,
    NOW() as last_updated
  FROM line_items li
  JOIN receipts r ON li.receipt_id = r.id
  WHERE r.purchase_date >= NOW() - INTERVAL '90 days'
    AND r.is_public = TRUE  -- Respect privacy settings
  GROUP BY 
    li.product_name,
    normalize_product_name(li.product_name),
    r.merchant_name,
    r.purchase_location_city
  HAVING COUNT(*) >= 2;  -- Only include products with at least 2 purchases
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================
COMMENT ON TABLE receipts IS 'Stores receipt header information including merchant, date, and total amount';
COMMENT ON TABLE line_items IS 'Stores individual line items (products) from receipts';
COMMENT ON TABLE price_insights IS 'Aggregated price data for product comparison across merchants';
COMMENT ON FUNCTION refresh_price_insights() IS 'Recalculates price insights from the last 90 days of receipt data';

