# moneyCheck Development Roadmap

AI-powered receipt scanner for Turkish receipts with OCR, price intelligence, and spending analytics.

---

## 🔧 BACKEND DEVELOPER TASKS (34 tasks)

### Core Infrastructure & Database (4 tasks)
- [ ] 1. Create TypeScript types/interfaces for Receipt, LineItem, Category models
- [ ] 2. Set up SQLite database schema and migrations
- [ ] 3. Create database service layer with CRUD operations
- [ ] 4. Implement useDatabase hook for SQLite connection management

### Camera & Image Processing (3 tasks)
- [ ] 5. Create camera service utilities (permission handling, image capture)
- [ ] 6. Implement useCamera hook with permission states
- [ ] 7. Create image preprocessing utilities (crop, enhance, compress)

### OCR & Receipt Parsing (2 tasks)
- [ ] 8. Create OCR service using ML Kit text recognition
- [ ] 9. Implement Turkish receipt parser (extract merchant, date, items, prices)

### Receipt Management (6 tasks)
- [ ] 10. Implement receipt storage service (save receipt + image + line items)
- [ ] 11. Create useReceipts hook for fetching and managing receipts
- [ ] 12. Implement search/filter utilities for receipts
- [ ] 13. Create receipt detail fetching logic with line items
- [ ] 14. Create receipt update service for manual edits
- [ ] 15. Implement line item CRUD operations

### Analytics & Intelligence (5 tasks)
- [ ] 16. Create analytics service (calculate totals, categories, trends)
- [ ] 17. Implement useAnalytics hook for spending data
- [ ] 18. Create date range filtering utilities
- [ ] 19. Create price comparison service (group by product name)
- [ ] 20. Implement product matching algorithm for similar items

### Onboarding & Settings (5 tasks)
- [ ] 21. Create onboarding state management hook
- [ ] 22. Implement AsyncStorage for persisting onboarding completion
- [ ] 23. Create data export service (JSON/CSV formats)
- [ ] 24. Implement data import/restore utilities
- [ ] 25. Create backup service using FileSystem

### Localization (3 tasks)
- [ ] 26. Set up i18n configuration with expo-localization
- [ ] 27. Create translation files for Turkish and English
- [ ] 28. Implement useTranslation hook

### Testing & Optimization (6 tasks)
- [ ] 29. Write unit tests for OCR parser
- [ ] 30. Write unit tests for database service
- [ ] 31. Write unit tests for analytics calculations
- [ ] 32. Optimize image compression before OCR processing
- [ ] 33. Add database indexing for faster queries
- [ ] 34. Implement caching strategy for analytics data

---

## 🎨 UI DEVELOPER TASKS (31 tasks)

### Common Components (4 tasks)
- [x] 1. Complete Button component with primary/secondary/danger variants
- [x] 2. Complete Card component for consistent card styling
- [x] 3. Complete Input component with validation states
- [x] 4. Complete LoadingSpinner component

### Camera & Scanning Flow (4 tasks)
- [ ] 5. Implement CameraView component with capture UI overlay
- [ ] 6. Build receipt/capture screen UI with camera preview
- [ ] 7. Build receipt/preview screen with image preview and retake option
- [ ] 8. Build receipt/processing screen with loading animation

### Receipt Components (2 tasks)
- [ ] 9. Complete ReceiptCard component with merchant, date, total, thumbnail
- [ ] 10. Complete LineItemRow component displaying product name, quantity, price

### History Screen (2 tasks)
- [ ] 11. Build history screen with FlatList, search bar, and filters
- [ ] 12. Implement pull-to-refresh and pagination on history screen

### Receipt Detail & Edit (4 tasks)
- [ ] 13. Build receipt/[id] detail screen with full receipt info
- [ ] 14. Add delete receipt functionality to detail screen
- [ ] 15. Build receipt/[id]/edit screen with editable fields
- [ ] 16. Add inline editing for line items (add, edit, delete rows)

### Analytics & Charts (3 tasks)
- [ ] 17. Complete SpendingChart component (bar/line charts)
- [ ] 18. Build analytics screen with monthly/weekly breakdowns
- [ ] 19. Build analytics/breakdown screen with category charts

### Price Comparison (2 tasks)
- [ ] 20. Build receipt/[id]/compare screen showing price history
- [ ] 21. Display price trends and cheapest/most expensive merchant

### Onboarding Flow (3 tasks)
- [ ] 22. Complete onboarding/welcome screen with app intro
- [ ] 23. Complete onboarding/kvkk screen with privacy policy
- [ ] 24. Complete onboarding/permissions screen with camera permission request

### Settings (2 tasks)
- [ ] 25. Build settings screen with preferences
- [ ] 26. Build settings/data-management screen with export/import/delete

### Localization UI (2 tasks)
- [ ] 27. Replace all hardcoded strings with translation keys
- [ ] 28. Add language switcher in settings

### Home Screen Integration (3 tasks)
- [ ] 29. Update home screen with real data from useReceipts hook
- [ ] 30. Display recent receipts list on home screen
- [ ] 31. Implement quick stats with real analytics data

---

## 📊 Summary

- **Backend Tasks:** 34
- **UI Tasks:** 31
- **Total:** 65 tasks

## 🚀 Suggested Workflow

### Phase 1: Foundation (Week 1)
**Backend:** Tasks 1-6 (Types, Database, Camera hooks)
**UI:** Tasks 1-5 (Common components, Camera UI)

### Phase 2: Core Scanning (Week 2)
**Backend:** Tasks 7-15 (OCR, Parser, Receipt storage)
**UI:** Tasks 6-10 (Scanning flow screens, Receipt components)

### Phase 3: History & Details (Week 3)
**Backend:** Task 13 (Detail fetching)
**UI:** Tasks 11-16 (History, Detail, Edit screens)

### Phase 4: Analytics (Week 4)
**Backend:** Tasks 16-20 (Analytics services, Price comparison)
**UI:** Tasks 17-21 (Charts, Analytics screens)

### Phase 5: Polish (Week 5)
**Backend:** Tasks 21-28 (Onboarding, Settings, i18n)
**UI:** Tasks 22-31 (Onboarding, Settings, Home integration, i18n)

### Phase 6: Testing & Optimization (Week 6)
**Backend:** Tasks 29-34 (Tests, Performance)
**UI:** Final polish and bug fixes

---

## 📝 Notes

- Backend dev should create and document hook interfaces first
- UI dev can build screens with mock data while waiting for hooks
- Regular sync meetings to align on data structures and APIs
- Use TypeScript strictly for better collaboration
- Mark tasks as completed by changing `[ ]` to `[x]`

---

**Built with React Native, Expo, TypeScript, and SQLite**
