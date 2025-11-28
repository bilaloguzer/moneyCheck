/**
 * useDatabase Hook
 * Manages SQLite database connection and initialization
 */

import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { runMigrations } from '../database/migrations';

interface UseDatabaseResult {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
}

/**
 * Hook for managing SQLite database connection
 *
 * @example
 * ```tsx
 * function App() {
 *   const { db, isLoading, error, isReady } = useDatabase();
 *
 *   if (isLoading) return <LoadingScreen />;
 *   if (error) return <ErrorScreen error={error} />;
 *   if (!isReady || !db) return null;
 *
 *   return <MainApp db={db} />;
 * }
 * ```
 */
export function useDatabase(): UseDatabaseResult {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initializeDatabase() {
      try {
        setIsLoading(true);
        setError(null);

        // Open database
        const database = await SQLite.openDatabaseAsync('moneycheck.db');

        if (!isMounted) return;

        console.log('Database opened successfully');

        // Run migrations
        await runMigrations(database);

        if (!isMounted) return;

        console.log('Database initialized and ready');

        setDb(database);
        setIsReady(true);
      } catch (err) {
        if (!isMounted) return;

        const error = err instanceof Error ? err : new Error('Database initialization failed');
        console.error('Database initialization error:', error);
        setError(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  return { db, isLoading, error, isReady };
}

/**
 * Extended database hook with additional utilities
 */
interface UseExtendedDatabaseResult extends UseDatabaseResult {
  reset: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

/**
 * Extended hook with database utilities
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const { db, reset, checkConnection } = useExtendedDatabase();
 *
 *   const handleReset = async () => {
 *     if (confirm('Reset database?')) {
 *       await reset();
 *     }
 *   };
 *
 *   return <Button onPress={handleReset}>Reset Database</Button>;
 * }
 * ```
 */
export function useExtendedDatabase(): UseExtendedDatabaseResult {
  const baseResult = useDatabase();
  const [resetTrigger, setResetTrigger] = useState(0);

  /**
   * Reset the database (drop and recreate all tables)
   */
  const reset = async () => {
    if (!baseResult.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Import reset function
      const { resetDatabase } = await import('../database/schema');
      await resetDatabase(baseResult.db);

      // Trigger re-initialization
      setResetTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Error resetting database:', err);
      throw err;
    }
  };

  /**
   * Check if database connection is active
   */
  const checkConnection = async (): Promise<boolean> => {
    if (!baseResult.db) return false;

    try {
      await baseResult.db.getFirstAsync('SELECT 1');
      return true;
    } catch {
      return false;
    }
  };

  return {
    ...baseResult,
    reset,
    checkConnection,
  };
}
