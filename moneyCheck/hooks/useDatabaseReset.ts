import { useEffect } from 'react';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { resetDatabase } from '@/database/resetDatabase';

/**
 * TEMPORARY: Force database reset on app startup
 * 
 * This will DELETE ALL DATA and re-run migrations.
 * Use this once to fix the migration issue, then REMOVE this file!
 */
export function useDatabaseReset() {
  const { db } = useDatabaseContext();

  useEffect(() => {
    if (db) {
      console.log('🔴 FORCING DATABASE RESET...');
      resetDatabase(db)
        .then(() => {
          console.log('✅ Database reset complete! App will reload.');
          console.log('⚠️ IMPORTANT: Now remove the useDatabaseReset hook from _layout.tsx!');
        })
        .catch((error) => {
          console.error('❌ Database reset failed:', error);
        });
    }
  }, [db]);
}
