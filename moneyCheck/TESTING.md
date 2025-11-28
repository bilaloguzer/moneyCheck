# Database Testing Guide

This document explains how to test the MoneyCheck database implementation.

## ⚠️ Important: Testing Approach

### Jest Tests (Limited - Mock SQLite)
The Jest unit tests in `__tests__/database/` use a **mock SQLite implementation** because:
- Jest runs in Node.js environment (not React Native)
- `expo-sqlite` requires native modules unavailable in Jest
- Full database testing requires a real device/simulator

**Mock tests verify:**
- ✅ TypeScript types compile correctly
- ✅ Function signatures are correct
- ✅ Basic code structure works
- ✅ No syntax errors

### ⭐ Manual Testing (RECOMMENDED - Real SQLite)
For **REAL database testing**, use `manual-test.ts` which runs in your actual React Native app with real SQLite.

---

## Running Tests

### Option 1: Jest Mock Tests

```bash
cd moneyCheck
npm install
npm test
```

**Note:** These verify code structure only, not actual database operations.

### Option 2: ⭐ Manual Test in App (RECOMMENDED)

This runs against real SQLite database in your React Native app.

#### Step 1: Create a Test Screen

Create `app/test-database.tsx`:

```tsx
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { runManualDatabaseTest } from '../__tests__/manual-test';

export default function TestDatabaseScreen() {
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleTest = async () => {
    setIsRunning(true);
    setOutput('Running tests...\n');

    try {
      const result = await runManualDatabaseTest();

      if (result.success) {
        setOutput('✅ All tests passed!\n\nCheck console for details.');
        Alert.alert('Success', 'All database tests passed!');
      } else {
        setOutput(`❌ Tests failed:\n${result.error}`);
        Alert.alert('Error', result.error?.message || 'Tests failed');
      }
    } catch (error: any) {
      setOutput(`❌ Error:\n${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Database Test
      </Text>

      <Button
        title={isRunning ? "Running..." : "Run Database Test"}
        onPress={handleTest}
        disabled={isRunning}
      />

      {output && (
        <Text style={{
          marginTop: 20,
          fontFamily: 'monospace',
          fontSize: 12,
          backgroundColor: '#f5f5f5',
          padding: 10,
          borderRadius: 5,
        }}>
          {output}
        </Text>
      )}

      <Text style={{ marginTop: 20, color: '#666' }}>
        💡 Check your Metro console for detailed test output
      </Text>
    </ScrollView>
  );
}
```

#### Step 2: Add to Navigation

Add link in your app (e.g., in settings or dev menu):

```tsx
import { Link } from 'expo-router';

<Link href="/test-database">Test Database</Link>
```

#### Step 3: Run Tests

1. Start your app: `npm start`
2. Navigate to the test screen
3. Tap "Run Database Test"
4. Check Metro console for detailed output

---

## What Gets Tested

### ✅ TypeScript Types
- Receipt, LineItem, Category interfaces
- Query filters and input types
- Database operation types

### ✅ Database Schema
- Table creation (departments, categories, receipts, line_items)
- Indexes for performance
- Triggers for automatic timestamps
- Foreign key constraints

### ✅ CRUD Operations

**Receipts:**
- Create receipt with all fields
- Get receipt by ID
- Query receipts with filters (date, store, amount, status)
- Update receipt fields
- Delete receipt
- Get receipt with line items

**Line Items:**
- Create single/multiple line items
- Get line items by receipt
- Update line item
- Delete line item
- Cascading deletes when receipt is deleted

**Categories:**
- Create departments
- Create categories with direct items
- Create categories with subcategories
- Search categories
- Bulk import from supermarket inventory JSON

### ✅ Analytics
- Total spending
- Category spending summary
- Store spending
- Monthly spending
- Top spending items
- Spending by day of week

### ✅ Hooks
- useDatabase - Connection management
- useDatabaseQuery - Query with loading/error states
- useDatabaseMutation - Create/update/delete operations
- usePaginatedQuery - Infinite scroll support

---

## Example Test Output

When you run the manual test, you'll see:

```
🧪 Starting manual database test...

📦 Step 1: Opening database...
✅ Database opened successfully

🏗️  Step 2: Initializing schema...
✅ Schema initialized

🧾 Step 3: Creating test receipt...
✅ Receipt created with ID: 1

📝 Step 4: Adding line items...
✅ Line items added

🏷️  Step 5: Creating categories...
✅ Categories created

🔍 Step 6: Retrieving receipt with items...
Receipt: { id: 1, store: 'Whole Foods', total: 87.45, itemCount: 3 }
Line Items:
  - Organic Bananas: $5.97
  - Whole Milk: $4.99
  - Chicken Breast: $22.48

📋 Step 7: Querying all receipts...
✅ Found 1 receipt(s)

📊 Step 8: Testing analytics...
Total Spending: { totalSpent: 87.45, receiptCount: 1, averageReceipt: 87.45 }

📦 Step 9: Testing bulk import...
✅ Departments after import: 2

🎉 All tests completed successfully!

📈 Summary:
   Receipts: 1
   Line Items: 3
   Departments: 2
   Total Spent: $87.45
```

---

## Troubleshooting

### "Database not initialized" error
Make sure you're using the DatabaseProvider at the root of your app:

```tsx
<DatabaseProvider>
  <YourApp />
</DatabaseProvider>
```

### Tests failing with SQLite errors
Ensure expo-sqlite is properly installed:

```bash
npx expo install expo-sqlite
```

### Import errors
Make sure your babel.config.js includes module resolver if using path aliases.

### Test screen not showing up
Make sure the test file is in the `app/` directory and you've restarted Metro bundler.

---

## Quick Verification Checklist

After running tests, verify:

- [ ] Database opens successfully
- [ ] Tables created (6 tables)
- [ ] Can create receipts
- [ ] Can create line items
- [ ] Can query receipts
- [ ] Can update receipts
- [ ] Can delete receipts
- [ ] Categories can be imported
- [ ] Analytics queries work
- [ ] No errors in console

---

## Production Testing

Before deploying:

1. ✅ Run manual test on iOS simulator
2. ✅ Run manual test on Android emulator
3. ✅ Test on physical device
4. ✅ Verify data persists after app restart
5. ✅ Test with large datasets (100+ receipts)
6. ✅ Verify migrations work on app updates

---

## Next Steps

After tests pass:
1. Integrate database into your app screens
2. Add real receipt data from OCR
3. Build analytics dashboard
4. Implement category auto-assignment
5. Add data export/backup features

**Status: All database features implemented and ready for integration!** ✅
