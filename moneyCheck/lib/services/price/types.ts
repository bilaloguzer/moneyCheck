// Type definitions for price comparison services

export interface PriceHistoryEntry {
  price: number;
  store: string;
  date: Date;
  receiptId: number;
  lineItemId: number;
}

export interface PriceTrend {
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  lastPrice: number;
  previousPrice: number;
}

export interface PriceStats {
  min: number;
  max: number;
  average: number;
  median: number;
  count: number;
}

export interface MarketPriceData {
  productName: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceDistribution: StorePriceEntry[];
}

export interface StorePriceEntry {
  store: string;
  price: number;
  date: Date;
}

export interface PriceComparison {
  userPrice: number;
  userStore: string;
  marketAverage: number;
  difference: number;
  percentDifference: number;
  rank: 'excellent' | 'good' | 'average' | 'high' | 'very-high';
  savingsOpportunity: number;
  cheapestStore: string;
  cheapestPrice: number;
  mostExpensiveStore: string;
  mostExpensivePrice: number;
}

export interface ProductMatch {
  productName: string;
  normalizedName: string;
  similarity: number;
  lineItemId?: number;
}
