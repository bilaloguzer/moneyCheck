// Hook for fetching a single receipt detail
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Receipt } from '@/lib/types';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { ReceiptRepository } from '@/lib/database/repositories/ReceiptRepository';

export function useReceipt(id: string) {
  const { db } = useDatabaseContext();
  const { locale } = useLocalization();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const repository = useMemo(() => {
    if (!db) return null;
    return new ReceiptRepository(db, locale);
  }, [db, locale]);

  const fetchReceipt = useCallback(async () => {
    if (!repository || !id) return;

    try {
      setLoading(true);
      setError(null);
      const result = await repository.findById(id);
      setReceipt(result);
    } catch (err) {
      console.error(`Error fetching receipt ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch receipt'));
    } finally {
      setLoading(false);
    }
  }, [repository, id]);

  const updateReceipt = useCallback(async (updates: Partial<Receipt>) => {
    if (!repository || !id) return;
    try {
        setLoading(true);
        const updated = await repository.update(id, updates);
        setReceipt(updated);
        return updated;
    } catch (err) {
        console.error(`Error updating receipt ${id}:`, err);
        throw err;
    } finally {
        setLoading(false);
    }
  }, [repository, id]);

  const deleteReceipt = useCallback(async () => {
      if (!repository || !id) return;
      try {
          setLoading(true);
          await repository.delete(id);
          setReceipt(null);
      } catch (err) {
          console.error(`Error deleting receipt ${id}:`, err);
          throw err;
      } finally {
          setLoading(false);
      }
  }, [repository, id]);

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  return { 
    receipt, 
    loading, 
    error, 
    refetch: fetchReceipt,
    updateReceipt,
    deleteReceipt
  };
}
