// Hook for fetching and filtering receipt lists with pagination
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Receipt, ReceiptFilter, PaginatedResult } from '@/lib/types';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { ReceiptRepository } from '@/lib/database/repositories/ReceiptRepository';

export function useReceiptList(filter?: ReceiptFilter, page = 1, limit = 20) {
  const { db } = useDatabaseContext();
  const { locale } = useLocalization();
  const [receipts, setReceipts] = useState<PaginatedResult<Receipt> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize repository
  const repository = useMemo(() => {
    if (!db) return null;
    return new ReceiptRepository(db, locale);
  }, [db, locale]);

  const fetchReceipts = useCallback(async () => {
    if (!repository) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await repository.findAll(filter, page, limit);
      setReceipts(result);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch receipts'));
    } finally {
      setLoading(false);
    }
  }, [repository, JSON.stringify(filter), page, limit]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  return { 
    receipts, 
    loading, 
    error, 
    refetch: fetchReceipts 
  };
}
