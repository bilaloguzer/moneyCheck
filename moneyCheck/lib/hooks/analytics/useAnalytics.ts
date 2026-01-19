// Hook for fetching spending analytics and statistics
import { useState, useEffect, useCallback } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import * as AnalyticsService from '@/database/services/analyticsService';
import { getCategoryDisplayName, getCategoryColor } from '@/lib/constants/categories';

export interface AnalyticsData {
  totalSpent: number;
  receiptCount: number;
  averageReceipt: number;
  categoryBreakdown: {
    name: string;
    value: number;
    color?: string;
    itemCount: number;
    percentage?: number;
  }[];
  dailySpending: {
    date: string;
    value: number;
    label: string;
  }[];
  topItems: {
    name: string;
    category: string;
    totalSpent: number;
    count: number;
  }[];
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export function useAnalytics(range: TimeRange) {
  const { db } = useDatabaseContext();
  const { locale } = useLocalization();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!db) return;

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      let startDate: Date | undefined;
      let endDate = now;

      switch (range) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        case 'all':
          startDate = undefined;
          break;
      }

      // Parallelize queries
      let dailyData;
      
      // Choose the appropriate spending data based on range
      if (range === 'year') {
        // For year view, get monthly spending
        dailyData = await AnalyticsService.getMonthlySpendingInRange(db, startDate, endDate);
      } else if (range === 'all') {
        // For all view, get year-month spending
        dailyData = await AnalyticsService.getYearMonthSpending(db, startDate, endDate);
      } else {
        // For week and month views, get daily spending
        dailyData = await AnalyticsService.getDailySpending(db, startDate, endDate);
      }
      
      const [
        categoryData,
        topItemsData
      ] = await Promise.all([
        AnalyticsService.getCategorySpendingSummary(db, startDate, endDate, locale),
        AnalyticsService.getTopSpendingItems(db, 5, startDate, endDate, locale)
      ]);

      // Calculate totals from daily data (or we could use getTotalSpending with date range if added)
      const totalSpent = Array.isArray(dailyData) 
        ? dailyData.reduce((sum, day) => sum + (day.totalSpent || 0), 0) 
        : 0;
      const receiptCount = Array.isArray(dailyData) 
        ? dailyData.reduce((sum, day) => sum + (day.receiptCount || 0), 0) 
        : 0;
      const averageReceipt = receiptCount > 0 ? totalSpent / receiptCount : 0;

      // Transform for UI
      // Calculate total for percentages
      const categoryTotal = categoryData.reduce((sum, cat) => sum + cat.totalSpent, 0);
      
      const categoryBreakdown = categoryData.map((cat) => ({
        name: getCategoryDisplayName(cat.categoryName),
        value: cat.totalSpent,
        itemCount: cat.itemCount,
        // Use color from database, fallback to getCategoryColor for items without color
        color: (cat as any).colorCode || getCategoryColor(cat.categoryName),
        percentage: categoryTotal > 0 ? (cat.totalSpent / categoryTotal) * 100 : 0
      }));

      // Transform daily/monthly/year-month data based on range
      let dailySpending;
      if (range === 'year') {
        // Monthly data for year view
        dailySpending = (dailyData as any[]).map(d => {
          const [year, month] = d.month.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = parseInt(month) - 1;
          return {
            date: d.month,
            value: d.totalSpent,
            label: monthNames[monthIndex]
          };
        });
      } else if (range === 'all') {
        // Year-month data for all view
        dailySpending = (dailyData as any[]).map(d => {
          const [year, month] = d.yearMonth.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = parseInt(month) - 1;
          return {
            date: d.yearMonth,
            value: d.totalSpent,
            label: `${monthNames[monthIndex]} ${year}`
          };
        });
      } else {
        // Daily data for week and month views
        dailySpending = (dailyData as any[]).map(d => ({
          date: d.date,
          value: d.totalSpent,
          label: range === 'week' ? new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) 
               : new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
      }

      const topItems = topItemsData.map(item => ({
        name: item.name,
        category: item.category,
        totalSpent: item.totalSpent,
        count: item.purchaseCount
      }));

      setData({
        totalSpent,
        receiptCount,
        averageReceipt,
        categoryBreakdown,
        dailySpending,
        topItems
      });

    } catch (err) {
      console.error('Analytics Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
    } finally {
      setLoading(false);
    }
  }, [db, range, locale]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
