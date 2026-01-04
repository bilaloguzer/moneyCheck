# Price Comparison & Product Matching Features

## Overview

This document describes the newly implemented price comparison and product matching features in moneyCheck. These features help users track product prices across different merchants and time periods.

## Features Implemented

### 1. ✅ Barcode Scanner
- **Package**: `expo-barcode-scanner`
- **Component**: `BarcodeScannerModal.tsx`
- **Features**:
  - Scan product barcodes for accurate identification
  - Visual scanning frame with corner indicators
  - Permission handling
  - Auto-close after successful scan
  - Haptic feedback on scan

**Usage**:
```tsx
import { BarcodeScannerModal } from '@/components/scanner/BarcodeScannerModal';

<BarcodeScannerModal
  visible={showScanner}
  onClose={() => setShowScanner(false)}
  onScan={(barcode, type) => {
    console.log('Scanned:', barcode, type);
  }}
/>
```

### 2. ✅ Open Food Facts Integration
- **Service**: `OpenFoodFactsService.ts`
- **API**: https://world.openfoodfacts.org/api/v2/
- **Features**:
  - Get product info by barcode
  - Search products by name
  - Standardized product names (Turkish + English)
  - Product categorization
  - Brand extraction
  - Product images

**Key Methods**:
```typescript
// Get product by barcode
const { data, error } = await OpenFoodFactsService.getProductByBarcode('8690504001234');

// Search products
const { data, error } = await OpenFoodFactsService.searchProducts('Coca Cola');

// Enrich line item with product data
const enrichment = await OpenFoodFactsService.enrichLineItem(barcode, productName);
```

**Benefits**:
- ✅ FREE API (no pricing data, but great for product info)
- ✅ Standardized product names
- ✅ Better categorization
- ✅ Turkish products included
- ✅ Product images

### 3. ✅ Fuzzy Product Matching
- **Service**: `ProductMatchingService.ts`
- **Package**: `fuzzysort`
- **Features**:
  - Match similar product names despite variations
  - Normalize product names (handle units, Turkish chars, etc.)
  - Group similar products together
  - Extract brands from product names
  - Calculate similarity scores

**Examples**:
```typescript
// These all match as the same product:
"Coca Cola 1L" ≈ "Koka Kola 1 Litre" ≈ "COCA COLA 1.0L"

// Find similar products
const matches = ProductMatchingService.findSimilarProducts(
  'Coca Cola',
  allProducts,
  0.7 // 70% similarity threshold
);

// Check if two names refer to same product
const isSame = ProductMatchingService.areSameProduct(
  'Milka Chocolate 100g',
  'MILKA ÇIKOLATA 100 GR'
); // true

// Group similar products
const groups = ProductMatchingService.groupSimilarProducts(products, 0.8);
```

**Normalization Rules**:
- Lowercase conversion
- Turkish character support (ğüşıöçĞÜŞİÖÇ)
- Unit standardization (lt→l, litre→l, gram→g, adet→pcs)
- Special character removal
- Extra space removal

### 4. ✅ Price Trend Analysis
- **Screen**: `app/receipt/[id]/compare.tsx`
- **Edge Function**: `supabase/functions/price-comparison/index.ts`
- **Features**:
  - Price history visualization (line chart)
  - Average, min, max price calculation
  - Price trend insights
  - Cheapest merchant identification
  - Price change percentage
  - Historical data from user's receipts

**Insights Generated**:
- "Price increased by 15% (from ₺20.00 to ₺23.00)"
- "Price decreased by 8% (from ₺30.00 to ₺27.60)"
- "Average price: ₺25.50"
- "Cheapest at Migros (avg: ₺22.00, 5 purchases)"
- "Price varies by 25% across merchants (₺20.00 - ₺30.00)"

### 5. ✅ Price Comparison UI
- **Screen**: `app/receipt/[id]/compare.tsx`
- **Features**:
  - Search products by name
  - Scan barcode to find product
  - View price statistics (avg, min, max)
  - Interactive price trend chart
  - Price history with merchant and date
  - AI-generated recommendations
  - Integration with Open Food Facts for product enrichment

**Navigation**:
- From receipt detail: Tap "Compare Prices" button on any item
- Direct access: `/receipt/[id]/compare?productName=Product+Name`

## Architecture

### Data Flow

```
User scans receipt
    ↓
OCR extracts items with names
    ↓
Items saved to Supabase (line_items table)
    ↓
User taps "Compare Prices" on item
    ↓
Price Comparison Screen
    ↓
Edge Function queries line_items for similar products
    ↓
Calculate statistics & generate insights
    ↓
Display results with chart & recommendations
```

### Database Schema

```sql
-- line_items table (already exists)
CREATE TABLE line_items (
  id UUID PRIMARY KEY,
  receipt_id UUID REFERENCES receipts(id),
  name TEXT,
  clean_name TEXT, -- Normalized name for matching
  category TEXT,
  quantity NUMERIC,
  unit TEXT,
  unit_price NUMERIC,
  line_total NUMERIC,
  discount NUMERIC,
  barcode TEXT, -- Optional: for barcode scanning
  confidence NUMERIC
);

-- Index for faster product searches
CREATE INDEX idx_line_items_clean_name ON line_items(clean_name);
CREATE INDEX idx_line_items_barcode ON line_items(barcode);
```

### Edge Function

**Endpoint**: `price-comparison`

**Request**:
```json
{
  "productName": "Coca Cola 1L",
  "merchantId": "optional-merchant-id"
}
```

**Response**:
```json
{
  "productName": "Coca Cola 1L",
  "averagePrice": 25.50,
  "minPrice": 20.00,
  "maxPrice": 30.00,
  "priceHistory": [
    {
      "merchant": "Migros",
      "price": 22.00,
      "date": "2024-01-15",
      "quantity": 1,
      "unit": "pcs"
    }
  ],
  "recommendations": [
    "Price increased by 15%...",
    "Average price: ₺25.50",
    "Cheapest at Migros..."
  ],
  "cheapestMerchant": {
    "name": "Migros",
    "price": 22.00
  }
}
```

## Usage Examples

### Example 1: Compare Prices from Receipt Detail

```tsx
// In receipt detail screen, each item has a "Compare Prices" button
<TouchableOpacity
  onPress={() => router.push(`/receipt/${id}/compare?productName=${item.cleanName}`)}
>
  <Text>Compare Prices</Text>
</TouchableOpacity>
```

### Example 2: Scan Barcode and Compare

```tsx
const handleBarcodeScan = async (barcode: string) => {
  // Get product from Open Food Facts
  const { data: product } = await OpenFoodFactsService.getProductByBarcode(barcode);
  
  if (product) {
    const standardizedName = OpenFoodFactsService.getStandardizedName(product);
    // Now compare prices for this standardized name
    const { data: priceData } = await SupabaseReceiptService.getPriceComparison(standardizedName);
  }
};
```

### Example 3: Find Similar Products

```tsx
const allProducts = [
  { id: '1', name: 'Coca Cola 1L', price: 25 },
  { id: '2', name: 'Koka Kola 1 Litre', price: 23 },
  { id: '3', name: 'Pepsi 1L', price: 22 },
];

const matches = ProductMatchingService.findSimilarProducts(
  'Coca Cola',
  allProducts,
  0.7
);

// matches = [
//   { productId: '1', productName: 'Coca Cola 1L', score: 1.0, price: 25 },
//   { productId: '2', productName: 'Koka Kola 1 Litre', score: 0.85, price: 23 }
// ]
```

## Localization

All UI strings are localized in English and Turkish:

**English** (`en.json`):
```json
{
  "priceComparison": {
    "title": "Price Comparison",
    "searchPlaceholder": "Search product...",
    "scanBarcode": "Scan Barcode",
    "average": "Average",
    "min": "Min",
    "max": "Max",
    "priceTrend": "Price Trend",
    "insights": "Insights",
    "priceHistory": "Price History",
    "comparePrices": "Compare Prices"
  }
}
```

**Turkish** (`tr.json`):
```json
{
  "priceComparison": {
    "title": "Fiyat Karşılaştırma",
    "searchPlaceholder": "Ürün ara...",
    "scanBarcode": "Barkod Tara",
    "average": "Ortalama",
    "min": "Min",
    "max": "Maks",
    "priceTrend": "Fiyat Trendi",
    "insights": "İçgörüler",
    "priceHistory": "Fiyat Geçmişi",
    "comparePrices": "Fiyatları Karşılaştır"
  }
}
```

## Performance Considerations

1. **Fuzzy Matching**: Uses `fuzzysort` which is optimized for speed
2. **Database Queries**: Indexed on `clean_name` and `barcode` for fast lookups
3. **Edge Function**: Limits results to 50 items to prevent slow queries
4. **Caching**: Consider implementing client-side caching for frequently accessed products

## Future Enhancements

### Potential Improvements:
1. **Barcode Database**: Store barcodes in `line_items` table during OCR
2. **Product Linking**: Link products across receipts using barcode + fuzzy matching
3. **Price Alerts**: Notify users when prices drop below threshold
4. **Merchant Comparison**: Compare prices across specific merchants
5. **Product Recommendations**: Suggest cheaper alternatives
6. **Price Prediction**: ML model to predict future prices
7. **Shared Database**: Aggregate anonymous price data across all users (privacy-aware)

## Testing

### Manual Testing Steps:

1. **Barcode Scanner**:
   - Open price comparison screen
   - Tap barcode icon
   - Scan a product barcode
   - Verify product info is loaded

2. **Price Comparison**:
   - Scan multiple receipts with same product
   - Navigate to receipt detail
   - Tap "Compare Prices" on an item
   - Verify price history and insights

3. **Fuzzy Matching**:
   - Create receipts with similar product names (e.g., "Coca Cola 1L", "COCA COLA 1 LT")
   - Compare prices for one variant
   - Verify all variants are included in results

4. **Open Food Facts**:
   - Scan a barcode
   - Verify product name, brand, and image are fetched
   - Test with Turkish products

## Troubleshooting

### Common Issues:

1. **Barcode scanner not working**:
   - Check camera permissions
   - Ensure `expo-barcode-scanner` is installed
   - Test on physical device (doesn't work in simulator)

2. **No price history found**:
   - Ensure user has multiple receipts with the same product
   - Check `clean_name` is properly normalized
   - Verify Edge Function is deployed

3. **Open Food Facts not returning results**:
   - Check internet connection
   - Verify barcode is valid (13 digits for EAN-13)
   - Try searching by name instead

4. **Fuzzy matching too strict/loose**:
   - Adjust threshold parameter (0.5-0.9)
   - Check normalization rules in `ProductMatchingService`

## Dependencies

```json
{
  "expo-barcode-scanner": "^13.0.1",
  "fuzzysort": "^3.0.2",
  "react-native-gifted-charts": "^1.4.41"
}
```

## API Credits

- **Open Food Facts**: Free, open-source product database
  - No API key required
  - No rate limits
  - Community-maintained
  - https://world.openfoodfacts.org/

---

**Last Updated**: January 4, 2026
**Status**: ✅ All features implemented and ready for testing

