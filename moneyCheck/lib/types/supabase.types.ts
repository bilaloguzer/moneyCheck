// Supabase type definitions for price data tables

export interface PriceDataRow {
  id: string;
  product_hash: string;
  product_name_normalized: string;
  price: number;
  store_name: string;
  region: string | null;
  created_at: string;
}

export interface UserPreferencesRow {
  user_id: string;
  share_price_data: boolean;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      price_data: {
        Row: PriceDataRow;
        Insert: Omit<PriceDataRow, 'id' | 'created_at'>;
        Update: Partial<Omit<PriceDataRow, 'id' | 'created_at'>>;
      };
      user_preferences: {
        Row: UserPreferencesRow;
        Insert: Omit<UserPreferencesRow, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferencesRow, 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
