/**
 * useDatabaseQuery Hook
 * Generic hook for database queries with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for database queries
 *
 * @param queryFn - Function that performs the database query
 * @param deps - Dependencies array for when to re-run the query
 *
 * @example
 * ```tsx
 * function ReceiptList() {
 *   const { data: receipts, isLoading, error, refetch } = useDatabaseQuery(
 *     async (db) => {
 *       return await getReceipts(db, { limit: 50 });
 *     },
 *     []
 *   );
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *   if (!receipts) return null;
 *
 *   return <FlatList data={receipts} ... />;
 * }
 * ```
 */
export function useDatabaseQuery<T>(
  queryFn: (db: any) => Promise<T>,
  deps: any[] = []
): QueryState<T> {
  const { db, isReady } = useDatabaseContext();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!isReady || !db) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await queryFn(db);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      console.error('Database query error:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [db, isReady, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Hook for database mutations (create, update, delete)
 *
 * @example
 * ```tsx
 * function ReceiptForm() {
 *   const { mutate: saveReceipt, isLoading, error } = useDatabaseMutation(
 *     async (db, receiptData) => {
 *       return await createReceipt(db, receiptData);
 *     }
 *   );
 *
 *   const handleSubmit = async () => {
 *     const id = await saveReceipt(formData);
 *     navigation.navigate('Receipt', { id });
 *   };
 *
 *   return <Form onSubmit={handleSubmit} loading={isLoading} />;
 * }
 * ```
 */
export function useDatabaseMutation<TInput, TOutput>(
  mutationFn: (db: any, input: TInput) => Promise<TOutput>
): {
  mutate: (input: TInput) => Promise<TOutput>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
} {
  const { db, isReady } = useDatabaseContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (input: TInput): Promise<TOutput> => {
    if (!isReady || !db) {
      throw new Error('Database not ready');
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await mutationFn(db, input);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      console.error('Database mutation error:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  return { mutate, isLoading, error, reset };
}

/**
 * Hook for paginated queries
 *
 * @example
 * ```tsx
 * function ReceiptList() {
 *   const {
 *     data: receipts,
 *     isLoading,
 *     hasMore,
 *     loadMore,
 *   } = usePaginatedQuery(
 *     async (db, offset, limit) => {
 *       return await getReceipts(db, { offset, limit });
 *     },
 *     20 // page size
 *   );
 *
 *   return (
 *     <FlatList
 *       data={receipts}
 *       onEndReached={loadMore}
 *       ListFooterComponent={isLoading ? <Spinner /> : null}
 *     />
 *   );
 * }
 * ```
 */
export function usePaginatedQuery<T>(
  queryFn: (db: any, offset: number, limit: number) => Promise<T[]>,
  pageSize: number = 20
): {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
} {
  const { db, isReady } = useDatabaseContext();
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = async (currentOffset: number, append: boolean = false) => {
    if (!isReady || !db || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const results = await queryFn(db, currentOffset, pageSize);

      setData((prev) => (append ? [...prev, ...results] : results));
      setHasMore(results.length === pageSize);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query failed');
      console.error('Paginated query error:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    const newOffset = offset + pageSize;
    setOffset(newOffset);
    await fetchPage(newOffset, true);
  };

  const refetch = async () => {
    setOffset(0);
    setHasMore(true);
    await fetchPage(0, false);
  };

  useEffect(() => {
    if (isReady && db) {
      fetchPage(0, false);
    }
  }, [isReady, db]);

  return { data, isLoading, error, hasMore, loadMore, refetch };
}
