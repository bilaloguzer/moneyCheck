/**
 * Mock implementation of expo-sqlite using better-sqlite3
 * This allows real database testing in Jest
 */

import Database from 'better-sqlite3';

interface RunResult {
  lastInsertRowId: number;
  changes: number;
}

class MockSQLiteDatabase {
  private db: Database.Database;

  constructor(dbName: string) {
    // Use in-memory database for testing
    this.db = new Database(':memory:');
  }

  async execAsync(sql: string): Promise<void> {
    try {
      this.db.exec(sql);
    } catch (error) {
      console.error('execAsync error:', error);
      throw error;
    }
  }

  async runAsync(sql: string, ...params: any[]): Promise<RunResult> {
    try {
      const stmt = this.db.prepare(sql);
      const info = stmt.run(...params);
      
      // DEBUG LOG
      console.log('Mock runAsync:', sql);
      console.log('Info:', info);
      console.log('lastInsertRowId type:', typeof info.lastInsertRowId);
      console.log('lastInsertRowId value:', info.lastInsertRowId);

      return {
        lastInsertRowId: Number(info.lastInsertRowId),
        changes: info.changes,
      };
    } catch (error) {
      console.error('runAsync error:', sql, params, error);
      throw error;
    }
  }

  async getFirstAsync<T>(sql: string, ...params: any[]): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...params) as T | undefined;
      return result ?? null;
    } catch (error) {
      console.error('getFirstAsync error:', sql, params, error);
      throw error;
    }
  }

  async getAllAsync<T>(sql: string, ...params: any[]): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      const results = stmt.all(...params) as T[];
      return results;
    } catch (error) {
      console.error('getAllAsync error:', sql, params, error);
      throw error;
    }
  }

  async withTransactionAsync<T>(task: () => Promise<T>): Promise<T> {
    try {
      this.db.prepare('BEGIN').run();
      const result = await task();
      this.db.prepare('COMMIT').run();
      return result;
    } catch (error) {
      this.db.prepare('ROLLBACK').run();
      throw error;
    }
  }

  async closeAsync(): Promise<void> {
    this.db.close();
  }
}

export async function openDatabaseAsync(dbName: string): Promise<MockSQLiteDatabase> {
  return new MockSQLiteDatabase(dbName);
}

export default {
  openDatabaseAsync,
};
