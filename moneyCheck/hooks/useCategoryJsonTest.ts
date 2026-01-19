/**
 * Simple test to verify category JSON loads correctly
 * Run this in a component to test if the JSON file is accessible
 */

import { useEffect } from 'react';

export function useCategoryJsonTest() {
  useEffect(() => {
    console.log('=== Testing Category JSON Loading ===');
    
    try {
      const categorySystem = require('../categories/category_system.json');
      console.log('✅ JSON file loaded successfully');
      console.log('Structure:', {
        hasDepartments: !!categorySystem.departments,
        departmentCount: categorySystem.departments?.length || 0,
        firstDept: categorySystem.departments?.[0]?.name || 'N/A',
      });
      
      if (categorySystem.departments && categorySystem.departments.length > 0) {
        const dept = categorySystem.departments[0];
        console.log('First department:', {
          id: dept.id,
          name: dept.name,
          name_en: dept.name_en,
          color: dept.color,
          icon: dept.icon,
          categoryCount: dept.categories?.length || 0,
        });
      }
    } catch (error) {
      console.error('❌ Error loading category JSON:', error);
    }
  }, []);
}
