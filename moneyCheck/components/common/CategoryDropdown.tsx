/**
 * CategoryDropdown Component
 * Multi-level dropdown selector for the 4-level category system
 * Supports Turkish/English based on LocalizationContext
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabaseContext } from '@/contexts/DatabaseContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { getDepartmentColor, getDepartmentIcon } from '@/lib/constants/colors';
import type { Department, Category, Subcategory } from '@/types/database.types';

interface CategoryDropdownProps {
  value?: {
    departmentId?: number;
    categoryId?: number;
    subcategoryId?: number;
  };
  onChange: (selection: {
    departmentId: number;
    categoryId: number;
    subcategoryId: number;
    departmentName: string;
    categoryName: string;
    subcategoryName: string;
  }) => void;
  style?: any;
}

export function CategoryDropdown({ value, onChange, style }: CategoryDropdownProps) {
  const { db } = useDatabaseContext();
  const { locale } = useLocalization();
  const isTurkish = locale === 'tr';

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  // Selection state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  
  // UI state
  const [step, setStep] = useState<'department' | 'category' | 'subcategory'>('department');
  const [schemaAvailable, setSchemaAvailable] = useState<boolean>(true);
  const [fallbackValue, setFallbackValue] = useState<string>('');

  // Check if new schema is available
  useEffect(() => {
    checkSchemaAvailability();
  }, [db]);

  const checkSchemaAvailability = async () => {
    if (!db) return;
    
    try {
      // Try to query the new schema
      await db.getAllAsync('SELECT name_tr FROM departments LIMIT 1');
      setSchemaAvailable(true);
    } catch (error) {
      console.log('New category schema not available yet, using fallback');
      setSchemaAvailable(false);
    }
  };

  // Load departments on mount
  useEffect(() => {
    if (schemaAvailable) {
      loadDepartments();
    }
  }, [db, schemaAvailable]);

  // Load initial selection if value is provided
  useEffect(() => {
    if (value && departments.length > 0) {
      const dept = departments.find(d => d.id === value.departmentId);
      if (dept) {
        setSelectedDepartment(dept);
        if (value.categoryId) {
          loadCategoriesForDepartment(value.departmentId!);
        }
      }
    }
  }, [value, departments]);

  const loadDepartments = async () => {
    if (!db) {
      console.log('⚠️ loadDepartments: db is null');
      return;
    }
    
    console.log('🔄 Loading departments from database...');
    try {
      const result = await db.getAllAsync<Department>(`
        SELECT id, name_tr, name_en, color_code, icon
        FROM departments
        ORDER BY id
      `);
      console.log(`✅ Query successful. Found ${result.length} departments`);
      
      if (result.length > 0) {
        console.log('First department:', result[0]);
      } else {
        console.warn('⚠️ No departments found in database!');
      }
      
      setDepartments(result);
    } catch (error) {
      console.error('❌ Error loading departments:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  const loadCategoriesForDepartment = async (departmentId: number) => {
    if (!db) return;
    
    setLoading(true);
    try {
      const result = await db.getAllAsync<Category>(`
        SELECT id, department_id as departmentId, name_tr, name_en, color_code
        FROM categories
        WHERE department_id = ?
        ORDER BY id
      `, [departmentId]);
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategoriesForCategory = async (categoryId: number) => {
    if (!db) return;
    
    setLoading(true);
    try {
      const result = await db.getAllAsync<Subcategory>(`
        SELECT id, category_id as categoryId, name_tr, name_en, color_code
        FROM subcategories
        WHERE category_id = ?
        ORDER BY id
      `, [categoryId]);
      setSubcategories(result);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = (dept: Department) => {
    setSelectedDepartment(dept);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    loadCategoriesForDepartment(dept.id!);
    setStep('category');
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    loadSubcategoriesForCategory(cat.id!);
    setStep('subcategory');
  };

  const handleSubcategorySelect = (subcat: Subcategory) => {
    setSelectedSubcategory(subcat);
    
    // Call onChange with full selection
    onChange({
      departmentId: selectedDepartment!.id!,
      categoryId: selectedCategory!.id!,
      subcategoryId: subcat.id!,
      departmentName: isTurkish ? selectedDepartment!.name_tr : selectedDepartment!.name_en,
      categoryName: isTurkish ? selectedCategory!.name_tr : selectedCategory!.name_en,
      subcategoryName: isTurkish ? subcat.name_tr : subcat.name_en,
    });
    
    setModalVisible(false);
  };

  const getDisplayText = () => {
    if (selectedSubcategory && selectedCategory && selectedDepartment) {
      const deptName = isTurkish ? selectedDepartment.name_tr : selectedDepartment.name_en;
      const catName = isTurkish ? selectedCategory.name_tr : selectedCategory.name_en;
      const subcatName = isTurkish ? selectedSubcategory.name_tr : selectedSubcategory.name_en;
      return `${deptName} > ${catName} > ${subcatName}`;
    }
    return isTurkish ? 'Kategori Seçin' : 'Select Category';
  };

  const resetSelection = () => {
    console.log('🔄 Resetting selection, going back to department step');
    setStep('department');
    setCategories([]);
    setSubcategories([]);
  };

  return (
    <View style={[styles.container, style]}>
      {!schemaAvailable ? (
        // Fallback: Simple text input when new schema not migrated
        <View>
          <TextInput
            style={styles.fallbackInput}
            value={fallbackValue}
            onChangeText={setFallbackValue}
            placeholder={isTurkish ? 'Kategori (eski sistem)' : 'Category (legacy)'}
            placeholderTextColor="#9B9A97"
          />
          <Text style={styles.fallbackHint}>
            {isTurkish 
              ? 'Yeni kategori sistemi henüz kurulmadı' 
              : 'New category system not yet installed'}
          </Text>
        </View>
      ) : (
        // New schema UI
        <>
          <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => {
          resetSelection();
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {selectedDepartment && (
            <Text style={styles.dropdownIcon}>
              {getDepartmentIcon(selectedDepartment.id!)}
            </Text>
          )}
          <Text
            style={[
              styles.dropdownText,
              !selectedSubcategory && styles.dropdownPlaceholder,
            ]}
            numberOfLines={1}
          >
            {getDisplayText()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#787774" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTurkish ? 'Kategori Seçin' : 'Select Category'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#37352F" />
              </TouchableOpacity>
            </View>

            {/* Breadcrumb */}
            <View style={styles.breadcrumb}>
              <TouchableOpacity
                onPress={() => setStep('department')}
                disabled={step === 'department'}
              >
                <Text
                  style={[
                    styles.breadcrumbText,
                    step === 'department' && styles.breadcrumbActive,
                  ]}
                >
                  {selectedDepartment
                    ? isTurkish
                      ? selectedDepartment.name_tr
                      : selectedDepartment.name_en
                    : isTurkish
                    ? 'Departman'
                    : 'Department'}
                </Text>
              </TouchableOpacity>

              {selectedDepartment && (
                <>
                  <Ionicons name="chevron-forward" size={16} color="#9B9A97" />
                  <TouchableOpacity
                    onPress={() => setStep('category')}
                    disabled={step === 'category'}
                  >
                    <Text
                      style={[
                        styles.breadcrumbText,
                        step === 'category' && styles.breadcrumbActive,
                      ]}
                    >
                      {selectedCategory
                        ? isTurkish
                          ? selectedCategory.name_tr
                          : selectedCategory.name_en
                        : isTurkish
                        ? 'Kategori'
                        : 'Category'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {selectedCategory && (
                <>
                  <Ionicons name="chevron-forward" size={16} color="#9B9A97" />
                  <Text
                    style={[
                      styles.breadcrumbText,
                      step === 'subcategory' && styles.breadcrumbActive,
                    ]}
                  >
                    {selectedSubcategory
                      ? isTurkish
                        ? selectedSubcategory.name_tr
                        : selectedSubcategory.name_en
                      : isTurkish
                      ? 'Alt Kategori'
                      : 'Subcategory'}
                  </Text>
                </>
              )}
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#37352F" />
                </View>
              ) : (
                <>
                  {/* Empty state */}
                  {step === 'department' && departments.length === 0 && (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateIcon}>📦</Text>
                      <Text style={styles.emptyStateTitle}>
                        {isTurkish ? 'Kategori Bulunamadı' : 'No Categories Found'}
                      </Text>
                      <Text style={styles.emptyStateMessage}>
                        {isTurkish
                          ? 'Veritabanı henüz yüklenmedi. Uygulamayı yeniden başlatmayı deneyin.'
                          : 'Database not loaded yet. Try restarting the app.'}
                      </Text>
                      <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={() => {
                          console.log('📥 Reload button pressed, calling loadDepartments()');
                          loadDepartments();
                        }}
                      >
                        <Ionicons name="refresh" size={18} color="#FFFFFF" />
                        <Text style={styles.reloadButtonText}>
                          {isTurkish ? 'Yeniden Yükle' : 'Reload'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Departments */}
                  {(() => {
                    console.log(`🎨 Rendering modal: step=${step}, departments.length=${departments.length}, loading=${loading}`);
                    return null;
                  })()}
                  {step === 'department' &&
                    departments.map((dept) => (
                      <TouchableOpacity
                        key={dept.id}
                        style={[
                          styles.optionButton,
                          { borderLeftColor: getDepartmentColor(dept.id!) },
                        ]}
                        onPress={() => handleDepartmentSelect(dept)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionIcon}>
                          {getDepartmentIcon(dept.id!)}
                        </Text>
                        <Text style={styles.optionText}>
                          {isTurkish ? dept.name_tr : dept.name_en}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9B9A97"
                        />
                      </TouchableOpacity>
                    ))}

                  {/* Categories */}
                  {step === 'category' &&
                    categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.optionButton,
                          { borderLeftColor: cat.color_code },
                        ]}
                        onPress={() => handleCategorySelect(cat)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>
                          {isTurkish ? cat.name_tr : cat.name_en}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#9B9A97"
                        />
                      </TouchableOpacity>
                    ))}

                  {/* Subcategories */}
                  {step === 'subcategory' &&
                    subcategories.map((subcat) => (
                      <TouchableOpacity
                        key={subcat.id}
                        style={[
                          styles.optionButton,
                          { borderLeftColor: subcat.color_code },
                        ]}
                        onPress={() => handleSubcategorySelect(subcat)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionText}>
                          {isTurkish ? subcat.name_tr : subcat.name_en}
                        </Text>
                        <Ionicons name="checkmark" size={20} color="#2C9364" />
                      </TouchableOpacity>
                    ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#FAFAFA',
    minHeight: 42,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 20,
  },
  dropdownText: {
    fontSize: 14,
    color: '#37352F',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9B9A97',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#37352F',
  },
  closeButton: {
    padding: 4,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7F6F3',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E7',
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#9B9A97',
    fontWeight: '500',
  },
  breadcrumbActive: {
    color: '#37352F',
  },
  modalContent: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F3',
    backgroundColor: '#FFFFFF',
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#37352F',
    fontWeight: '500',
  },
  fallbackInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    color: '#37352F',
  },
  fallbackHint: {
    fontSize: 11,
    color: '#9B9A97',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#37352F',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#9B9A97',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C9364',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
