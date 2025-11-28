# Quick Start Guide - Database Integration

## 🚀 Get Started in 5 Minutes

### 1. Setup Database Provider

In your `app/_layout.tsx`:

```tsx
import { DatabaseProvider } from '../contexts/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <Stack>
        {/* Your screens */}
      </Stack>
    </DatabaseProvider>
  );
}
```

### 2. Use in Components

```tsx
import { useDatabaseQuery } from '../hooks';
import { getReceipts } from '../database/services';

function ReceiptList() {
  const { data: receipts, isLoading } = useDatabaseQuery(
    (db) => getReceipts(db, { limit: 50 }),
    []
  );

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={receipts}
      renderItem={({ item }) => (
        <Text>{item.storeName} - ${item.totalAmount}</Text>
      )}
    />
  );
}
```

### 3. Create Data

```tsx
import { useDatabaseMutation } from '../hooks';
import { createReceipt, createLineItems } from '../database/services';

function AddReceipt() {
  const { mutate } = useDatabaseMutation(
    async (db, data) => {
      const id = await createReceipt(db, data.receipt);
      await createLineItems(db, data.items);
      return id;
    }
  );

  const handleSave = async () => {
    await mutate({
      receipt: {
        storeName: 'Walmart',
        purchaseDate: new Date(),
        totalAmount: 50.0,
      },
      items: [
        { name: 'Bananas', quantity: 3, unitPrice: 1.99, totalPrice: 5.97 },
      ]
    });
  };

  return <Button title="Save" onPress={handleSave} />;
}
```

## 📚 Common Operations

### Query Receipts with Filters

```tsx
const { data } = useDatabaseQuery(
  (db) => getReceipts(db, {
    storeName: 'Walmart',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    minAmount: 20,
    maxAmount: 200,
    status: 'processed',
  }),
  []
);
```

### Get Receipt with Line Items

```tsx
const { data: receipt } = useDatabaseQuery(
  (db) => getReceiptWithItems(db, receiptId),
  [receiptId]
);
```

### Analytics

```tsx
const { data: summary } = useDatabaseQuery(
  (db) => getDateRangeSpendingSummary(db, startDate, endDate),
  [startDate, endDate]
);
```

### Import Categories

```tsx
import { bulkImportCategories } from '../database/services';
import supermarketData from './inventory.json';

// One-time setup
await bulkImportCategories(db, supermarketData.supermarket_inventory);
```

## 🧪 Testing

### Create Test Screen

`app/test-database.tsx`:

```tsx
import { runManualDatabaseTest } from '../__tests__/manual-test';

export default function TestScreen() {
  return (
    <Button
      title="Run Database Test"
      onPress={async () => {
        const result = await runManualDatabaseTest();
        console.log(result.success ? '✅ Pass' : '❌ Fail');
      }}
    />
  );
}
```

Navigate to `/test-database` and check console!

## 📖 More Resources

- **Full API:** See `DATABASE_IMPLEMENTATION.md`
- **Testing:** See `TESTING.md`
- **Examples:** See `examples/DatabaseUsageExample.tsx`

## 🎯 Key Files

- **Types:** `types/database.types.ts`
- **Services:** `database/services/*.ts`
- **Hooks:** `hooks/use*.ts`
- **Context:** `contexts/DatabaseContext.tsx`

That's it! You're ready to use the database. 🎉
