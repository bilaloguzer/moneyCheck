# SmartSpend Category System - Implementation Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Database Integration](#database-integration)
3. [React Native Integration](#react-native-integration)
4. [OCR Category Matching](#ocr-category-matching)
5. [UI/UX Guidelines](#uiux-guidelines)
6. [Testing Checklist](#testing-checklist)

---

## 🚀 Quick Start

### Step 1: Import the Database Schema

```bash
# Using Expo SQLite
npx expo install expo-sqlite
```

```javascript
// database.js
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

export async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync('smartspend.db');
  
  // Read and execute the SQL migration script
  const sqlScript = await FileSystem.readAsStringAsync(
    `${FileSystem.documentDirectory}10_database_schema.sql`
  );
  
  await db.execAsync(sqlScript);
  return db;
}
```

### Step 2: Load Categories

```javascript
// categoryService.js
export async function loadCategories(db) {
  const departments = await db.getAllAsync(
    'SELECT * FROM departments ORDER BY id'
  );
  
  const categories = await db.getAllAsync(
    'SELECT * FROM categories ORDER BY department_id, id'
  );
  
  return { departments, categories };
}
```

---

## 🗄️ Database Integration

### Schema Overview

Your SQLite database will have 4 tables:

```
departments (14 records)
  ├── categories (66 records)
      ├── subcategories (161 records)
          └── item_groups (745 records)
```

### Key Relationships

```javascript
// Get department with all its categories
async function getDepartmentHierarchy(departmentId) {
  return await db.getAllAsync(`
    SELECT 
      d.id as dept_id, d.name_tr as dept_name, d.color_code as dept_color,
      c.id as cat_id, c.name_tr as cat_name, c.color_code as cat_color,
      s.id as subcat_id, s.name_tr as subcat_name, s.color_code as subcat_color
    FROM departments d
    LEFT JOIN categories c ON c.department_id = d.id
    LEFT JOIN subcategories s ON s.category_id = c.id
    WHERE d.id = ?
    ORDER BY c.id, s.id
  `, [departmentId]);
}
```

### Best Practices

1. **Create indexes** on foreign keys (already done in migration script)
2. **Cache frequently accessed data** in AsyncStorage
3. **Lazy load** item groups only when needed
4. **Use transactions** for bulk operations

---

## 📱 React Native Integration

### Color System

```javascript
// constants/colors.js
export const DEPARTMENT_COLORS = {
  FOOD_BEVERAGE: '#2E7D32',
  HOUSEHOLD_CLEANING: '#0288D1',
  PERSONAL_CARE: '#AB47BC',
  HEALTH_PHARMACY: '#E91E63',
  ELECTRONICS: '#2196F3',
  CLOTHING_FASHION: '#FF6F61',
  HOME_LIVING: '#795548',
  TRANSPORTATION: '#FF5722',
  ENTERTAINMENT: '#9C27B0',
  SPORTS: '#009688',
  EDUCATION: '#3F51B5',
  SERVICES: '#607D8B',
  PETS: '#8BC34A',
  MISCELLANEOUS: '#FFC107'
};

export function getDepartmentColor(departmentId) {
  const colorMap = {
    1: DEPARTMENT_COLORS.FOOD_BEVERAGE,
    2: DEPARTMENT_COLORS.HOUSEHOLD_CLEANING,
    3: DEPARTMENT_COLORS.PERSONAL_CARE,
    // ... add all 14 departments
  };
  return colorMap[departmentId] || '#9E9E9E';
}
```

### Category Component Example

```jsx
// components/CategoryCard.jsx
import { View, Text, StyleSheet } from 'react-native';
import { getDepartmentColor } from '../constants/colors';

export function CategoryCard({ category, department }) {
  return (
    <View style={[
      styles.card,
      { borderLeftColor: getDepartmentColor(department.id) }
    ]}>
      <Text style={styles.icon}>{department.icon}</Text>
      <View>
        <Text style={styles.categoryName}>{category.name_tr}</Text>
        <Text style={styles.departmentName}>{department.name_tr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  departmentName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
```

### Analytics Visualization

```jsx
// components/SpendingChart.jsx
import { PieChart } from 'react-native-chart-kit';
import { getDepartmentColor } from '../constants/colors';

export function SpendingChart({ spendingByDepartment }) {
  const data = spendingByDepartment.map(item => ({
    name: item.department_name,
    amount: item.total_amount,
    color: getDepartmentColor(item.department_id),
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  return (
    <PieChart
      data={data}
      width={screenWidth}
      height={220}
      chartConfig={chartConfig}
      accessor="amount"
      backgroundColor="transparent"
      paddingLeft="15"
      absolute
    />
  );
}
```

---

## 🔍 OCR Category Matching

### Fuzzy Matching Strategy

```javascript
// services/categoryMatcher.js
import Fuse from 'fuse.js';

export class CategoryMatcher {
  constructor(itemGroups) {
    // Create Fuse.js index for fuzzy matching
    this.fuse = new Fuse(itemGroups, {
      keys: ['name_tr'],
      threshold: 0.3, // Adjust for Turkish OCR accuracy
      includeScore: true,
    });
  }

  findBestMatch(ocrText) {
    // Clean OCR text
    const cleanText = ocrText
      .toLowerCase()
      .replace(/[^a-zçğıöşü0-9\s]/gi, '')
      .trim();

    // Search for matches
    const results = this.fuse.search(cleanText);
    
    if (results.length > 0) {
      const bestMatch = results[0];
      return {
        itemGroup: bestMatch.item,
        confidence: 1 - bestMatch.score,
        subcategoryId: bestMatch.item.subcategory_id,
      };
    }

    return null;
  }

  // Match multiple items from receipt
  async matchReceiptItems(ocrItems, db) {
    const matches = [];
    
    for (const item of ocrItems) {
      const match = this.findBestMatch(item.text);
      
      if (match && match.confidence > 0.7) {
        // Get full category hierarchy
        const hierarchy = await db.getFirstAsync(`
          SELECT 
            s.id as subcategory_id,
            s.name_tr as subcategory_name,
            c.id as category_id,
            c.name_tr as category_name,
            d.id as department_id,
            d.name_tr as department_name,
            d.color_code
          FROM subcategories s
          JOIN categories c ON s.category_id = c.id
          JOIN departments d ON c.department_id = d.id
          WHERE s.id = ?
        `, [match.subcategoryId]);
        
        matches.push({
          originalText: item.text,
          matchedItem: match.itemGroup.name_tr,
          confidence: match.confidence,
          ...hierarchy,
        });
      }
    }
    
    return matches;
  }
}
```

### OCR Preprocessing for Turkish

```javascript
// services/turkishOCR.js
export function normalizeTurkishText(text) {
  // Handle common OCR errors with Turkish characters
  const replacements = {
    'ı': ['i', '1', 'l'],
    'i': ['ı', '1', 'l'],
    'ğ': ['g'],
    'ş': ['s'],
    'ç': ['c'],
    'ö': ['o'],
    'ü': ['u'],
  };

  let normalized = text.toLowerCase();
  
  // Try multiple variations for fuzzy matching
  return normalized;
}
```

---

## 🎨 UI/UX Guidelines

### Color Usage Principles

1. **Department Identification**: Use department colors consistently
2. **Visual Hierarchy**: Darker shades for main elements, lighter for backgrounds
3. **Accessibility**: Ensure 4.5:1 contrast ratio for text on colored backgrounds
4. **Colorblind Mode**: Provide high-contrast alternative palette

### Example: Spending Summary Card

```jsx
<View style={{
  backgroundColor: `${getDepartmentColor(department.id)}10`, // 10% opacity
  borderLeftWidth: 3,
  borderLeftColor: getDepartmentColor(department.id),
  padding: 16,
}}>
  <Text style={{ color: getDepartmentColor(department.id), fontWeight: 'bold' }}>
    {department.name_tr}
  </Text>
  <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
    ₺{totalAmount.toFixed(2)}
  </Text>
</View>
```

### Category Selection UI

```jsx
// CategoryPicker.jsx
export function CategoryPicker({ onSelect }) {
  const [departments, setDepartments] = useState([]);
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {departments.map(dept => (
        <TouchableOpacity
          key={dept.id}
          onPress={() => onSelect(dept)}
          style={[
            styles.chip,
            { backgroundColor: getDepartmentColor(dept.id) }
          ]}
        >
          <Text style={styles.chipText}>
            {dept.icon} {dept.name_tr}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

---

## ✅ Testing Checklist

### Database Integration
- [ ] All 14 departments imported correctly
- [ ] All 66 categories have valid department relationships
- [ ] All 161 subcategories have valid category relationships
- [ ] All 745 item groups have valid subcategory relationships
- [ ] Color codes are valid hex format
- [ ] Turkish characters display correctly

### OCR Matching
- [ ] Test with real Migros receipts
- [ ] Test with real BİM receipts
- [ ] Test with real A101 receipts
- [ ] Test with e-fatura PDFs
- [ ] Measure accuracy: Target 85%+ for Turkish items
- [ ] Handle common OCR errors (ı/i confusion, ş/s)

### UI/UX
- [ ] Category colors render correctly
- [ ] Department icons display on all devices
- [ ] Charts use consistent color scheme
- [ ] Colorblind accessibility tested
- [ ] Turkish font rendering tested (İ, Ş, Ğ, etc.)

### Performance
- [ ] Category lookup < 50ms
- [ ] Receipt categorization < 2s for 20 items
- [ ] Analytics chart rendering < 500ms
- [ ] Database queries use indexes
- [ ] Item groups lazy-loaded

### Edge Cases
- [ ] Unknown items handled gracefully
- [ ] Multiple category matches resolved
- [ ] Low confidence matches flagged for user review
- [ ] Empty receipts handled
- [ ] Very long receipts (100+ items) tested

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Turkish characters not displaying correctly
```javascript
// Solution: Ensure UTF-8 encoding
import * as SQLite from 'expo-sqlite';
const db = await SQLite.openDatabaseAsync('smartspend.db', {
  enableChangeListener: true,
  useNewConnection: true,
});
await db.execAsync('PRAGMA encoding = "UTF-8"');
```

**Issue**: Category matching too slow
```javascript
// Solution: Create in-memory cache
const categoryCache = new Map();
export async function getCategoryFast(id) {
  if (!categoryCache.has(id)) {
    const category = await db.getFirstAsync(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    categoryCache.set(id, category);
  }
  return categoryCache.get(id);
}
```

**Issue**: OCR accuracy low for Turkish receipts
```javascript
// Solution: Implement post-processing
function improveOCRAccuracy(text) {
  // Common Turkish receipt patterns
  const patterns = [
    [/DOMATES/gi, 'Domates'],
    [/EKMEK/gi, 'Ekmek'],
    [/PEYNIR/gi, 'Peynir'],
    // Add more patterns from real receipts
  ];
  
  let improved = text;
  patterns.forEach(([pattern, replacement]) => {
    improved = improved.replace(pattern, replacement);
  });
  
  return improved;
}
```

---

## 📚 Additional Resources

- **Turkish OCR Libraries**: Consider using Google ML Kit with Turkish language pack
- **Fuzzy Matching**: Fuse.js documentation at https://fusejs.io
- **Color Accessibility**: Use WebAIM Contrast Checker
- **Database Optimization**: SQLite performance tips at https://sqlite.org/optoverview.html

---

## 🎯 Next Steps

1. Implement database initialization in your app startup
2. Add category picker to receipt manual entry
3. Integrate OCR matching pipeline
4. Design analytics dashboard with color-coded charts
5. Test with real Turkish receipts
6. Collect user feedback on category accuracy
7. Iterate on item groups based on common receipt items

Good luck with your implementation! 🚀
