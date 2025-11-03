// Type definitions for products and price database

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode?: string;
  normalizedName: string; // For fuzzy matching
  createdAt: Date;
}

export interface ProductPrice {
  id: string;
  productId: string;
  merchantId: string;
  price: number;
  date: Date;
  source: 'manual' | 'scraped' | 'user_reported';
}

export interface PriceComparison {
  productName: string;
  userPaidPrice: number;
  merchantId: string;
  cheapestPrice: number;
  cheapestMerchantId: string;
  savings: number;
  savingsPercentage: number;
}
