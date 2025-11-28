/**
 * Database Context
 * Provides database instance throughout the app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { useDatabase } from '../hooks/useDatabase';

interface DatabaseContextValue {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
}

/**
 * Database Provider Component
 * Wraps the app and provides database instance
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DatabaseProvider
 *       loadingComponent={<SplashScreen />}
 *       errorComponent={(error) => <ErrorScreen error={error} />}
 *     >
 *       <MainApp />
 *     </DatabaseProvider>
 *   );
 * }
 * ```
 */
export function DatabaseProvider({
  children,
  loadingComponent,
  errorComponent,
}: DatabaseProviderProps) {
  const { db, isLoading, error, isReady } = useDatabase();

  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent(error)}</>;
    }
    return (
      <div style={{ padding: 20 }}>
        <h2>Database Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Hook to access database from context
 *
 * @example
 * ```tsx
 * function ReceiptList() {
 *   const { db } = useDatabaseContext();
 *
 *   useEffect(() => {
 *     if (db) {
 *       loadReceipts(db);
 *     }
 *   }, [db]);
 * }
 * ```
 */
export function useDatabaseContext(): DatabaseContextValue {
  const context = useContext(DatabaseContext);

  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }

  return context;
}

/**
 * Hook that ensures database is ready before returning
 * Throws if database is not available
 *
 * @example
 * ```tsx
 * function ReceiptForm() {
 *   const db = useRequiredDatabase();
 *
 *   // db is guaranteed to be non-null here
 *   const handleSave = async () => {
 *     await createReceipt(db, receiptData);
 *   };
 * }
 * ```
 */
export function useRequiredDatabase(): SQLite.SQLiteDatabase {
  const { db, isReady } = useDatabaseContext();

  if (!isReady || !db) {
    throw new Error('Database is not ready');
  }

  return db;
}
