# Task Assignments - 15 Week Sprint

## Overview

- **Total Duration**: 15 weeks
- **Team Size**: 2 developers working full-time in parallel
- **Target**: Fully functional MVP for 20-50 beta testers

---

## Week 1-2: Foundation & Setup

### Developer 1 (Frontend) - Navigation & UI Foundation

**Branch**: `feature/frontend/foundation`

**Tasks**:
- [ ] Set up basic navigation structure
- [ ] Implement tab bar with icons
- [ ] Create placeholder screens for all routes
- [ ] Build reusable UI components:
  - [ ] `Button` component with variants
  - [ ] `Card` component
  - [ ] `Input` component with validation
  - [ ] `LoadingSpinner` component
  - [ ] `EmptyState` component
- [ ] Configure theme and design tokens
- [ ] Test navigation flow between all screens

**Deliverable**: All screens are navigable with basic UI components

---

### Developer 2 (Backend) - Database & Infrastructure

**Branch**: `feature/backend/database-foundation`

**Tasks**:
- [ ] Implement `DatabaseService.ts`
- [ ] Create database schema (receipts, line_items, merchants, products, product_prices)
- [ ] Write initial migration script
- [ ] Create seed data for Turkish merchants (Migros, Carrefour, A101, BİM, Şok)
- [ ] Implement repositories:
  - [ ] `ReceiptRepository`
  - [ ] `MerchantRepository`
  - [ ] `ProductRepository`
- [ ] Write database initialization in `useDatabase` hook
- [ ] Test database CRUD operations

**Deliverable**: Database is initialized on app start with seed data

---

## Week 3-4: Receipt Capture

### Developer 1 (Frontend) - Camera UI & Image Flow

**Branch**: `feature/frontend/camera-ui`

**Tasks**:
- [ ] Implement `ReceiptCaptureScreen` with expo-camera
- [ ] Add camera permissions handling
- [ ] Build camera controls (capture, flash, gallery)
- [ ] Implement `EdgeOverlay` component for visual feedback
- [ ] Create `ImagePreviewScreen` with crop/rotate options
- [ ] Build `ProcessingScreen` with progress indicator
- [ ] Add image selection from gallery
- [ ] Test camera on real device

**Deliverable**: Users can capture or select receipt images

---

### Developer 2 (Backend) - OCR & Text Processing

**Branch**: `feature/backend/ocr-service`

**Tasks**:
- [ ] Implement `OCRService` with Google ML Kit
- [ ] Configure ML Kit for Turkish language
- [ ] Build `TextParser` to extract:
  - [ ] Merchant name with pattern matching
  - [ ] Receipt date (handle Turkish formats)
  - [ ] Total amount
  - [ ] Line items (product, quantity, price)
- [ ] Implement `TurkishTextNormalizer` for character fixes
- [ ] Create `MerchantMatcher` with fuzzy matching
- [ ] Build `useReceiptCapture` hook to orchestrate the flow
- [ ] Test with 10+ real Turkish receipts

**Deliverable**: OCR extracts receipt data with >80% accuracy

---

## Week 5-6: Receipt Management

### Developer 1 (Frontend) - Receipt Screens

**Branch**: `feature/frontend/receipt-management`

**Tasks**:
- [ ] Build `ReceiptCard` component
- [ ] Implement `ReceiptList` component with pagination
- [ ] Create `ReceiptDetailScreen` layout
- [ ] Build `LineItemRow` component (editable)
- [ ] Add `ConfidenceIndicator` for OCR confidence scores
- [ ] Implement `ManualCorrectionScreen`
- [ ] Add receipt image zoom viewer
- [ ] Build delete receipt confirmation dialog
- [ ] Test receipt list with 100+ receipts

**Deliverable**: Users can view, edit, and delete receipts

---

### Developer 2 (Backend) - Receipt Data Management

**Branch**: `feature/backend/receipt-crud`

**Tasks**:
- [ ] Implement complete receipt CRUD in `ReceiptRepository`
- [ ] Build `ImageStorage` service for receipt images
- [ ] Create `useReceipt` hook
- [ ] Implement `useReceiptList` hook with filtering
- [ ] Add receipt search by merchant/date/amount
- [ ] Build data validation utilities
- [ ] Implement receipt update logic
- [ ] Add batch delete functionality
- [ ] Test with edge cases (empty receipts, duplicates)

**Deliverable**: Full receipt management system working

---

## Week 7-8: Price Database & Comparison

### Developer 1 (Frontend) - Price Comparison UI

**Branch**: `feature/frontend/price-comparison`

**Tasks**:
- [ ] Create `PriceComparisonScreen` layout
- [ ] Build price comparison cards showing:
  - [ ] User paid price vs. best price
  - [ ] Savings amount and percentage
  - [ ] Alternative merchant suggestions
- [ ] Add "Where to buy cheaper" section
- [ ] Implement savings badge on `ReceiptCard`
- [ ] Create visual indicators for good/bad deals
- [ ] Test UI with various price scenarios

**Deliverable**: Users can see price comparisons for their purchases

---

### Developer 2 (Backend) - Price Intelligence

**Branch**: `feature/backend/price-service`

**Tasks**:
- [ ] Create manual price database (100 common products)
- [ ] Seed products with prices across 5 merchants
- [ ] Implement `ProductMatcher` with fuzzy matching
- [ ] Build `PriceComparisonService`
- [ ] Create algorithm to match receipt items to products
- [ ] Calculate savings opportunities
- [ ] Implement caching for price lookups
- [ ] Test matching accuracy with real receipts

**Deliverable**: Price comparison working for 100 products

---

## Week 9-10: Analytics & Insights

### Developer 1 (Frontend) - Analytics UI

**Branch**: `feature/frontend/analytics`

**Tasks**:
- [ ] Build `AnalyticsScreen` dashboard
- [ ] Implement `SpendingChart` component (line/bar charts)
- [ ] Create `CategoryPieChart` for spending breakdown
- [ ] Build `StatCard` for quick metrics
- [ ] Implement `MerchantRanking` list
- [ ] Add date range selector (`DateRangePicker`)
- [ ] Create `SpendingBreakdownScreen` with detailed view
- [ ] Add filter chips for categories
- [ ] Test with various time periods

**Deliverable**: Visual analytics dashboard showing spending patterns

---

### Developer 2 (Backend) - Analytics Engine

**Branch**: `feature/backend/analytics-service`

**Tasks**:
- [ ] Implement `AnalyticsService`:
  - [ ] Calculate total spending by period
  - [ ] Aggregate by category
  - [ ] Rank merchants by spending
  - [ ] Compute average receipt amount
- [ ] Build `CategoryService` for auto-categorization
- [ ] Create `useAnalytics` hook
- [ ] Implement `useSpendingTrends` hook
- [ ] Add `AnalyticsRepository` with optimized queries
- [ ] Cache analytics results
- [ ] Test performance with 500+ receipts

**Deliverable**: Analytics calculations working efficiently

---

## Week 11-12: Settings & Data Management

### Developer 1 (Frontend) - Settings UI

**Branch**: `feature/frontend/settings`

**Tasks**:
- [ ] Build `SettingsScreen` with sections
- [ ] Create `DataManagementScreen`
- [ ] Implement data export UI
- [ ] Add account deletion flow with confirmation
- [ ] Build language switcher (Turkish/English)
- [ ] Create storage usage indicator
- [ ] Add app version and about section
- [ ] Test all settings options

**Deliverable**: Complete settings section

---

### Developer 2 (Backend) - Export & Data Management

**Branch**: `feature/backend/export-service`

**Tasks**:
- [ ] Implement `ExportService` for CSV export
- [ ] Build data deletion logic (cascade deletes)
- [ ] Create backup/restore functionality
- [ ] Implement `useLocalization` hook
- [ ] Add translation files (TR/EN)
- [ ] Build storage calculator
- [ ] Test export with large datasets
- [ ] Verify KVKK compliance

**Deliverable**: Data export and management working

---

## Week 13: Onboarding & Polish

### Developer 1 (Frontend) - Onboarding Flow

**Branch**: `feature/frontend/onboarding`

**Tasks**:
- [ ] Build `WelcomeScreen` with app intro
- [ ] Create `KVKKConsentScreen` with legal text
- [ ] Implement `PermissionsScreen` for camera/storage
- [ ] Add onboarding state management
- [ ] Create skip/next navigation
- [ ] Design welcome illustrations
- [ ] Test onboarding flow for first-time users

---

### Developer 2 (Backend) - Error Handling & Logging

**Branch**: `feature/backend/error-handling`

**Tasks**:
- [ ] Implement global error boundary
- [ ] Add error logging service
- [ ] Create user-friendly error messages
- [ ] Build retry logic for failed operations
- [ ] Add offline mode handling
- [ ] Implement crash reporting
- [ ] Test error scenarios

---

## Week 14: Testing & Bug Fixes

### Both Developers - Quality Assurance

**Branches**: `fix/*`

**Developer 1 Tasks**:
- [ ] Test all UI flows on iOS
- [ ] Fix UI bugs and polish animations
- [ ] Test with different screen sizes
- [ ] Optimize image loading
- [ ] Fix navigation edge cases
- [ ] Test accessibility
- [ ] Review and improve UX

**Developer 2 Tasks**:
- [ ] Test OCR with 50+ receipts
- [ ] Optimize database queries
- [ ] Fix data inconsistencies
- [ ] Test with large datasets (1000+ receipts)
- [ ] Profile app performance
- [ ] Fix memory leaks
- [ ] Test offline scenarios

---

## Week 15: Beta Deployment

### Both Developers - Release Preparation

**Branch**: `release/v1.0.0`

**Tasks**:
- [ ] Create production build
- [ ] Test production build on multiple devices
- [ ] Write release notes
- [ ] Create beta testing guide
- [ ] Set up TestFlight / Internal Testing
- [ ] Deploy to beta testers (20-50 users)
- [ ] Create feedback collection form
- [ ] Monitor crash reports
- [ ] Create quick fix plan for critical bugs
- [ ] Document known issues

**Deliverable**: App deployed to beta testers

---

## Communication Checklist

### Daily (Async)
- [ ] Morning sync: What you're working on today
- [ ] End of day: Push your work, note any blockers
- [ ] Review each other's PRs within 24 hours

### Weekly
- [ ] Monday: Plan the week's tasks
- [ ] Friday: Demo completed features to each other
- [ ] Review progress against timeline

### Important Milestones
- [ ] Week 2: Demo navigation and database
- [ ] Week 4: Demo receipt capture with OCR
- [ ] Week 6: Demo receipt management
- [ ] Week 8: Demo price comparison
- [ ] Week 10: Demo analytics
- [ ] Week 12: Demo complete flow
- [ ] Week 15: Beta release

---

## Definition of Done

A task is complete when:
- [ ] Code is written and tested locally
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] PR created and reviewed
- [ ] PR approved by other developer
- [ ] Merged to `development` branch
- [ ] Feature tested on device (not just simulator)
- [ ] No breaking changes to other features

---

## Priority Features (Must Have for MVP)

1. ✅ Receipt capture with camera
2. ✅ OCR text extraction
3. ✅ Manual correction of OCR errors
4. ✅ Receipt list and detail view
5. ✅ Basic analytics (spending by period)
6. ✅ Price comparison for top products
7. ✅ CSV export
8. ✅ Turkish language support

## Nice to Have (Post-MVP)

- Advanced charts and visualizations
- Budget tracking
- Receipt sharing
- Cloud backup
- Multi-user accounts
- Receipt categories
- Shopping list generator
- Expense predictions

---

## Success Metrics

**Week 4**: Successfully extract data from 10 receipts with 80%+ accuracy
**Week 8**: Price comparison working for 50+ products
**Week 12**: Complete app flow tested end-to-end
**Week 15**: 20 beta testers using the app daily

---

## Emergency Contacts & Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **ML Kit Text Recognition**: https://developers.google.com/ml-kit/vision/text-recognition
- **SQLite**: https://www.sqlite.org/docs.html

---

## Quick Start Commands

```bash
# Start development
npm start

# Clear cache
rm -rf .expo node_modules/.cache && npx expo start --clear

# Create feature branch
git checkout -b feature/frontend/task-name

# Push changes
git add . && git commit -m "feat: description" && git push
```

Good luck! 🚀
