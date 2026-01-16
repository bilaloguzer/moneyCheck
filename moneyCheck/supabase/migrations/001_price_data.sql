-- Price Data Table for Cross-User Comparison
-- Stores anonymized price data from all users

CREATE TABLE IF NOT EXISTS price_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_hash TEXT NOT NULL,
  product_name_normalized TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  store_name TEXT NOT NULL,
  region TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_price_data_product_hash ON price_data(product_hash);
CREATE INDEX IF NOT EXISTS idx_price_data_store_name ON price_data(store_name);
CREATE INDEX IF NOT EXISTS idx_price_data_created_at ON price_data(created_at);

-- Enable Row Level Security
ALTER TABLE price_data ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (for price comparison)
DROP POLICY IF EXISTS "Public read access" ON price_data;
CREATE POLICY "Public read access" ON price_data
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert
DROP POLICY IF EXISTS "Authenticated users can insert" ON price_data;
CREATE POLICY "Authenticated users can insert" ON price_data
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  share_price_data BOOLEAN DEFAULT false,
  region TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage own preferences
DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to clean old price data (optional, for data retention)
CREATE OR REPLACE FUNCTION clean_old_price_data()
RETURNS void AS $$
BEGIN
  DELETE FROM price_data
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
