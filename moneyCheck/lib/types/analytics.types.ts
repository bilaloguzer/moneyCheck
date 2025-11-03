// Type definitions for analytics data structures

export interface SpendingSummary {
  totalSpent: number;
  receiptCount: number;
  averageReceiptAmount: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  receiptCount: number;
}

export interface MerchantRanking {
  merchantId: string;
  merchantName: string;
  totalSpent: number;
  visitCount: number;
  averageSpent: number;
}

export interface SpendingTrend {
  date: Date;
  amount: number;
  receiptCount: number;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AnalyticsFilter {
  period: TimePeriod;
  startDate?: Date;
  endDate?: Date;
  merchantIds?: string[];
  categories?: string[];
}
