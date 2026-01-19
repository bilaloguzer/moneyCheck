/**
 * DatabaseDebug Component
 * Development tool for debugging database issues
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { getAppliedMigrations } from '@/database/migrations';
import { seedCategories, needsSeedCategories } from '@/database/seeds/categories';

interface MigrationInfo {
  version: number;
  name: string;
  applied_at: string;
}

interface CategoryStats {
  departments: number;
  categories: number;
  subcategories: number;
  itemGroups: number;
}

export function DatabaseDebug() {
  const { db, isReady } = useDatabaseContext();
  const [loading, setLoading] = useState(false);
  const [migrations, setMigrations] = useState<MigrationInfo[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [lastAction, setLastAction] = useState<string>('');

  useEffect(() => {
    if (db && isReady) {
      loadDatabaseInfo();
    }
  }, [db, isReady]);

  const loadDatabaseInfo = async () => {
    if (!db) return;

    setLoading(true);
    try {
      // Load migrations
      const migrationList = await getAppliedMigrations(db);
      setMigrations(migrationList);

      // Load category stats
      const deptCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM departments'
      );
      const catCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM categories'
      );
      const subcatCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM subcategories'
      );
      const itemCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM item_groups'
      );

      setStats({
        departments: deptCount?.count ?? 0,
        categories: catCount?.count ?? 0,
        subcategories: subcatCount?.count ?? 0,
        itemGroups: itemCount?.count ?? 0,
      });
    } catch (error) {
      console.error('Error loading database info:', error);
      setLastAction(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceReseed = async () => {
    if (!db) return;

    setLoading(true);
    setLastAction('Starting force reseed...');

    try {
      console.log('=== FORCE RESEED STARTED ===');
      
      // Step 1: Clear existing data
      setLastAction('Step 1/4: Clearing existing data...');
      console.log('Deleting existing categories...');
      
      await db.execAsync('DELETE FROM item_groups');
      console.log('  ✓ Deleted item_groups');
      
      await db.execAsync('DELETE FROM subcategories');
      console.log('  ✓ Deleted subcategories');
      
      await db.execAsync('DELETE FROM categories');
      console.log('  ✓ Deleted categories');
      
      await db.execAsync('DELETE FROM departments');
      console.log('  ✓ Deleted departments');

      // Step 2: Verify tables are empty
      setLastAction('Step 2/4: Verifying tables cleared...');
      const deptCheck = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM departments');
      console.log(`Departments after delete: ${deptCheck?.count ?? 0}`);
      
      if ((deptCheck?.count ?? 0) > 0) {
        throw new Error('Failed to clear departments table');
      }

      // Step 3: Test JSON loading
      setLastAction('Step 3/4: Loading category data from JSON...');
      console.log('Attempting to load category_system.json...');
      
      let categorySystem;
      try {
        categorySystem = require('../../categories/category_system.json');
        console.log('✅ JSON loaded successfully');
        console.log(`  - Departments in JSON: ${categorySystem.departments?.length || 0}`);
      } catch (jsonError) {
        console.error('❌ Failed to load JSON:', jsonError);
        throw new Error(`JSON loading failed: ${jsonError instanceof Error ? jsonError.message : 'Unknown'}`);
      }

      if (!categorySystem.departments || categorySystem.departments.length === 0) {
        throw new Error('JSON file has no departments');
      }

      // Step 4: Seed from JSON
      setLastAction('Step 4/4: Inserting category data...');
      console.log('Starting category insertion...');
      
      await seedCategories(db);
      console.log('✅ Seed function completed');

      // Step 5: Verify insertion
      setLastAction('Verifying insertion...');
      const finalDeptCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM departments');
      const finalCatCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM categories');
      const finalSubcatCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM subcategories');
      
      console.log('=== FINAL COUNTS ===');
      console.log(`  Departments: ${finalDeptCount?.count ?? 0}`);
      console.log(`  Categories: ${finalCatCount?.count ?? 0}`);
      console.log(`  Subcategories: ${finalSubcatCount?.count ?? 0}`);

      if ((finalDeptCount?.count ?? 0) === 0) {
        throw new Error('Seeding completed but no departments were inserted!');
      }

      setLastAction(`✅ Success! Inserted ${finalDeptCount?.count} departments, ${finalCatCount?.count} categories`);

      // Reload info
      await loadDatabaseInfo();
    } catch (error) {
      console.error('❌ Force reseed failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
      setLastAction(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      console.log('=== FORCE RESEED ENDED ===');
    }
  };

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Database Debug</Text>
        <Text style={styles.notReady}>Database not ready...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Debug</Text>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#37352F" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Migration Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Migrations</Text>
        {migrations.length > 0 ? (
          migrations.map((migration) => (
            <View key={migration.version} style={styles.migrationRow}>
              <View style={styles.migrationBadge}>
                <Text style={styles.migrationVersion}>v{migration.version}</Text>
              </View>
              <View style={styles.migrationInfo}>
                <Text style={styles.migrationName}>{migration.name}</Text>
                <Text style={styles.migrationDate}>
                  {new Date(migration.applied_at).toLocaleString()}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#2C9364" />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No migrations found</Text>
        )}
      </View>

      {/* Category Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Category Statistics</Text>
        {stats ? (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.departments}</Text>
              <Text style={styles.statLabel}>Departments</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.subcategories}</Text>
              <Text style={styles.statLabel}>Subcategories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.itemGroups}</Text>
              <Text style={styles.statLabel}>Item Groups</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Loading stats...</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Actions</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={loadDatabaseInfo}
          disabled={loading}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reload Info</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleForceReseed}
          disabled={loading}
        >
          <Ionicons name="sync" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Force Reseed Categories</Text>
        </TouchableOpacity>

        {lastAction && (
          <View style={styles.actionResult}>
            <Text style={styles.actionResultText}>{lastAction}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E9E9E7',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 16,
  },
  notReady: {
    fontSize: 14,
    color: '#9B9A97',
    fontStyle: 'italic',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9B9A97',
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F7F6F3',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 12,
  },
  migrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  migrationBadge: {
    backgroundColor: '#2C9364',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  migrationVersion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  migrationInfo: {
    flex: 1,
  },
  migrationName: {
    fontSize: 14,
    color: '#37352F',
    fontWeight: '500',
  },
  migrationDate: {
    fontSize: 11,
    color: '#9B9A97',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#9B9A97',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7F6F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#37352F',
  },
  statLabel: {
    fontSize: 12,
    color: '#9B9A97',
    marginTop: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2C9364',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: '#E03E3E',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionResult: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F7F6F3',
    borderRadius: 6,
  },
  actionResultText: {
    fontSize: 13,
    color: '#37352F',
  },
});
