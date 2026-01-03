import { useState, useEffect, useCallback } from 'react';
import { SupabaseReceiptService } from '@/lib/services/SupabaseReceiptService';

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export function useAnalyticsSupabase(range: TimeRange = 'month') {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    let startDate: Date | undefined;

    if (range === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const { data: analyticsData, error: fetchError } = await SupabaseReceiptService.getSpendingAnalytics(
      startDate,
      now
    );

    if (fetchError) {
      setError(new Error(fetchError.message || 'Failed to fetch analytics'));
      setData(null);
    } else {
      // Add percentages to category breakdown
      const total = analyticsData?.categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0) || 0;
      const categoryBreakdown = analyticsData?.categoryBreakdown.map((cat) => ({
        ...cat,
        percentage: total > 0 ? (cat.value / total) * 100 : 0,
      }));

      setData({
        ...analyticsData,
        categoryBreakdown,
        averageReceipt:
          analyticsData && analyticsData.receiptCount > 0
            ? analyticsData.totalSpent / analyticsData.receiptCount
            : 0,
      });
    }

    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}

