import { useState, useEffect, useCallback } from 'react';
import { SupabaseReceiptService } from '@/lib/services/SupabaseReceiptService';
import { Receipt } from '@/lib/types/receipt.types';

export function useReceiptListSupabase(limit = 50, offset = 0) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await SupabaseReceiptService.getReceipts(limit, offset);

    if (fetchError) {
      setError(new Error(fetchError.message || 'Failed to fetch receipts'));
      setReceipts([]);
    } else {
      setReceipts(data || []);
    }

    setLoading(false);
  }, [limit, offset]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return {
    receipts: {
      data: receipts,
      totalCount: receipts.length,
      totalAmount: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
    },
    loading,
    error,
    refetch: fetchReceipts,
  };
}

