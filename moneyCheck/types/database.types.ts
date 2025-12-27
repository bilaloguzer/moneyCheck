/**
 * Database Type Definitions
 * Models for Receipt, LineItem, and Category
 */

// ============================================================================
// Category Types
// ============================================================================

/**
 * Subcategory with specific type and items
 */
export interface Subcategory {
  type: string;
  items: string[];
}

/**
 * Category structure that can have either direct items or subcategories
 */
export interface Category {
  id?: number;
  name: string;
  department?: number; // department ID
  items?: string[];
  subcategories?: Subcategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Department containing multiple categories
 */
export interface Department {
  id?: number;
  name: string;
  categories: Category[];
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
  categoryId?: number;
  category?: Category;
  departmentName?: string;
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
