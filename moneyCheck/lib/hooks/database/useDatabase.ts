// Hook for database initialization and connection management
import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/services/DatabaseService';

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const db = DatabaseService.getInstance();
        await db.initialize({ name: 'smartspend.db', version: 1 });
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
      }
    };

    initDB();
  }, []);

  return { isInitialized, error };
}
