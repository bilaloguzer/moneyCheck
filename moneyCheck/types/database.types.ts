/**
 * Database Type Definitions
 * Models for Receipt, LineItem, and Category
 */

/**
 * Item Group - Level 4 (Turkish product names)
 */
export interface ItemGroup {
  id?: number;
  subcategoryId: number;
  name_tr: string; // Turkish name for OCR matching
  createdAt?: Date;
}

/**
 * Subcategory - Level 3
 */
export interface Subcategory {
  id?: number;
  categoryId: number;
  name_tr: string;
  name_en: string;
  color_code: string;
  itemGroups?: ItemGroup[];
  createdAt?: Date;
}

/**
 * Category - Level 2
 */
export interface Category {
  id?: number;
  departmentId: number;
  name_tr: string;
  name_en: string;
  color_code: string;
  subcategories?: Subcategory[];
  createdAt?: Date;
}

/**
 * Department - Level 1 (Top level)
 */
export interface Department {
  id?: number; // Fixed IDs 1-14
  name_tr: string;
  name_en: string;
  color_code: string;
  icon: string;
  categories?: Category[];
  createdAt?: Date;
}

/**
 * Legacy interfaces for backward compatibility
 * @deprecated Use new 4-level types above
 */
export interface LegacySubcategory {
  type: string;
  items: string[];
}

export interface LegacyCategory {
  id?: number;
  name: string;
  department?: number;
  items?: string[];
  subcategories?: LegacySubcategory[];
  createdAt?: Date;
  updatedAt?: Date;
}


// ============================================================================
// Receipt & LineItem Types
// ============================================================================

/**
 * Individual line item on a receipt
 */
export interface LineItem {
  id?: number;
  receiptId: number; // Required - line item must belong to a receipt
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // Category hierarchy (new 4-level system)
  departmentId?: number;
  categoryId?: number;
  subcategoryId?: number;
  itemGroupId?: number;
  categoryConfidence?: number; // OCR match confidence (0.0-1.0)
  
  // Full category object (populated via JOIN)
  category?: Category;
  
  // Legacy fields (deprecated, maintained for backward compatibility)
  /** @deprecated Use departmentId instead */
  departmentName?: string;
  /** @deprecated Use subcategoryId instead */
  subcategoryType?: string;
  
  discount?: number;
  taxAmount?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


/**
 * Payment method types
 */
export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'mobile_payment'
  | 'gift_card'
  | 'other';

/**
 * Receipt status
 */
export type ReceiptStatus =
  | 'pending'
  | 'processed'
  | 'verified'
  | 'archived';

/**
 * Main receipt model
 */
export interface Receipt {
  id?: number;
  storeName: string;
  storeLocation?: string;
  purchaseDate: Date;
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  paymentMethod?: PaymentMethod;
  status?: ReceiptStatus;
  imageUri?: string;
  ocrData?: string; // Raw OCR text data
  lineItems?: LineItem[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Database Operation Types
// ============================================================================

/**
 * Create receipt input (without id and timestamps)
 */
export type CreateReceiptInput = Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update receipt input (partial fields except id)
 */
export type UpdateReceiptInput = Partial<Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Create line item input (without id and timestamps)
 */
export type CreateLineItemInput = Omit<LineItem, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update line item input (partial fields except id)
 */
export type UpdateLineItemInput = Partial<Omit<LineItem, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Create category input (without id and timestamps)
 */
export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update category input (partial fields except id)
 */
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Create department input
 */
export type CreateDepartmentInput = Omit<Department, 'id' | 'categories' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// Query & Filter Types
// ============================================================================

/**
 * Receipt query filters
 */
export interface ReceiptQueryFilters {
  storeName?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
  status?: ReceiptStatus;
  categoryId?: number;
  limit?: number;
  offset?: number;
  searchQuery?: string; // For general search across stores and items
}

/**
 * Line item query filters
 */
export interface LineItemQueryFilters {
  receiptId?: number;
  categoryId?: number;
  departmentName?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

/**
 * Receipt with full line items
 */
export interface ReceiptWithItems extends Receipt {
  lineItems: LineItem[];
}

/**
 * Spending summary by category
 */
export interface CategorySpendingSummary {
  categoryId?: number;
  categoryName: string;
  departmentName?: string;
  totalSpent: number;
  itemCount: number;
  averagePrice: number;
}

/**
 * Spending summary by date range
 */
export interface DateRangeSpendingSummary {
  startDate: Date;
  endDate: Date;
  totalSpent: number;
  receiptCount: number;
  averageReceiptAmount: number;
  categorySummaries: CategorySpendingSummary[];
}
