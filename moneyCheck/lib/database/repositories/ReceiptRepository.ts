// Repository for receipt CRUD operations and queries
import * as SQLite from 'expo-sqlite';
import type { Receipt, ReceiptFilter, PaginatedResult } from '@/lib/types';
import * as ReceiptService from '@/database/services/receiptService';
import * as LineItemService from '@/database/services/lineItemService';
import * as CategoryService from '@/database/services/categoryService';
import { 
  CreateReceiptInput, 
  CreateLineItemInput,
  Receipt as DBReceipt,
  LineItem as DBLineItem,
  ReceiptWithItems
} from '@/types/database.types';

export class ReceiptRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async create(receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Receipt> {
    let receiptId: number;

    // Use transaction for data integrity
    await this.db.withTransactionAsync(async () => {
      // 1. Create Receipt
      const receiptInput: CreateReceiptInput = {
        storeName: receipt.merchantName,
        purchaseDate: receipt.date,
        totalAmount: receipt.total,
        imageUri: receipt.imagePath,
        ocrData: receipt.ocrConfidence.toString(), // Storing confidence as simplified OCR data for now, or raw text if we had it
        status: 'processed'
      };

      receiptId = await ReceiptService.createReceipt(this.db, receiptInput);

      // 2. Create Line Items if any
      if (receipt.items && receipt.items.length > 0) {
        // Map domain items to DB items
        // Note: The domain 'items' in Create input might be different from internal LineItem type
        // We assume the input receipt object adheres to the OCRResult structure roughly or has mapped items.
        // Let's assume the input 'receipt' has 'items' which are compatible with CreateLineItemInput minus receiptId
        
        // Fix: We should check if 'items' exist on the input object even if not strictly typed, 
        // or we should update the Receipt type definition. 
        // For now, I will cast to any to access items, assuming the caller passes them.
        const inputItems = (receipt as any).items || [];
        
        if (inputItems.length > 0) {
            // Create items one by one to avoid nested transaction issues
            // (since LineItemService.createLineItems uses a transaction and we are already in one)
            for (const item of inputItems) {
                // Try to resolve category string to category_id
                let categoryId: number | null = null;
                if (item.category && typeof item.category === 'string') {
                    categoryId = await CategoryService.getCategoryIdByName(this.db, item.category);
                }
                
                const lineItemInput: CreateLineItemInput = {
                    receiptId: receiptId,
                    name: item.name || item.productName,
                    quantity: item.quantity || 1,
                    unitPrice: item.price || item.unitPrice,
                    totalPrice: (item.price || item.unitPrice) * (item.quantity || 1),
                    discount: item.discount || 0,
                    categoryId: categoryId ?? undefined
                };
                await LineItemService.createLineItem(this.db, lineItemInput);
            }
        }
      }
    });

    // Fetch the created receipt to return full object
    // @ts-ignore
    return this.findById(receiptId!.toString()) as Promise<Receipt>;
  }

  async findById(id: string): Promise<Receipt | null> {
    const dbReceipt = await ReceiptService.getReceiptWithItems(this.db, parseInt(id, 10));
    if (!dbReceipt) return null;
    return this.mapToDomain(dbReceipt);
  }

  async findAll(filter?: ReceiptFilter, page = 1, limit = 20): Promise<PaginatedResult<Receipt>> {
    const offset = (page - 1) * limit;
    
    // Map domain filter to DB filter
    const dbFilter: any = {
      limit,
      offset,
      startDate: filter?.startDate,
      endDate: filter?.endDate,
      minAmount: filter?.minAmount,
      maxAmount: filter?.maxAmount,
      searchQuery: filter?.merchantName // Mapping merchantName search to general search query
    };

    if (filter?.merchantName) {
        // If it's a specific merchant search, we can use storeName, 
        // but if it's a general search bar input, use searchQuery.
        // Assuming the filter object from UI might be reused for general search.
        // Let's use searchQuery for broad search if the intent is "Search".
        // For now, let's map merchantName to searchQuery to enable item search too!
        dbFilter.searchQuery = filter.merchantName;
        delete dbFilter.storeName; 
    }

    const [receipts, totalCount] = await Promise.all([
      ReceiptService.getReceipts(this.db, dbFilter),
      ReceiptService.getReceiptsCount(this.db, dbFilter)
    ]);

    return {
      data: receipts.map(r => this.mapToDomain(r)),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  async update(id: string, data: Partial<Receipt>): Promise<Receipt> {
    // Map domain updates to DB updates
    const updates: any = {};
    if (data.merchantName) updates.storeName = data.merchantName;
    if (data.date) updates.purchaseDate = data.date;
    if (data.total) updates.totalAmount = data.total;
    if (data.imagePath) updates.imageUri = data.imagePath;
    
    await ReceiptService.updateReceipt(this.db, parseInt(id, 10), updates);
    
    return this.findById(id) as Promise<Receipt>;
  }

  async delete(id: string): Promise<void> {
    await ReceiptService.deleteReceipt(this.db, parseInt(id, 10));
  }

  // --- Line Item Operations ---

  async addLineItem(receiptId: string, item: any): Promise<Receipt> {
    const rId = parseInt(receiptId, 10);
    
    // Try to resolve category string to category_id
    let categoryId = item.categoryId;
    if (item.category && typeof item.category === 'string' && !categoryId) {
        categoryId = await CategoryService.getCategoryIdByName(this.db, item.category);
    }
    
    const lineItemInput: CreateLineItemInput = {
      receiptId: rId,
      name: item.productName || item.name,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.price,
      totalPrice: (item.unitPrice || item.price) * (item.quantity || 1),
      // Optional fields
      categoryId: categoryId,
      departmentName: item.departmentName,
      subcategoryType: item.subcategoryType
    };
    
    await LineItemService.createLineItem(this.db, lineItemInput);
    await this.recalculateReceiptTotal(rId);
    
    return this.findById(receiptId) as Promise<Receipt>;
  }

  async updateLineItem(receiptId: string, itemId: string, updates: any): Promise<Receipt> {
    const rId = parseInt(receiptId, 10);
    const lId = parseInt(itemId, 10);
    
    // If quantity or price changes, update total price
    if (updates.quantity || updates.unitPrice) {
       // We might need to fetch current item to calculate correctly if only one is provided
       // For simplicity, assume caller provides enough or we fetch.
       // Let's fetch to be safe.
       const current = await LineItemService.getLineItemById(this.db, lId);
       if (current) {
           const qty = updates.quantity ?? current.quantity;
           const price = updates.unitPrice ?? current.unitPrice;
           updates.totalPrice = qty * price;
       }
    }

    await LineItemService.updateLineItem(this.db, lId, updates);
    await this.recalculateReceiptTotal(rId);
    
    return this.findById(receiptId) as Promise<Receipt>;
  }

  async deleteLineItem(receiptId: string, itemId: string): Promise<Receipt> {
    const rId = parseInt(receiptId, 10);
    const lId = parseInt(itemId, 10);
    
    await LineItemService.deleteLineItem(this.db, lId);
    await this.recalculateReceiptTotal(rId);
    
    return this.findById(receiptId) as Promise<Receipt>;
  }

  private async recalculateReceiptTotal(receiptId: number): Promise<void> {
    const items = await LineItemService.getLineItemsByReceiptId(this.db, receiptId);
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    await ReceiptService.updateReceipt(this.db, receiptId, { totalAmount: total });
  }

  // --- Mappers ---

  private mapToDomain(dbReceipt: DBReceipt | ReceiptWithItems): Receipt {
    // Check if it has items
    const items = (dbReceipt as any).lineItems?.map((item: DBLineItem) => ({
        id: item.id?.toString(),
        receiptId: item.receiptId.toString(),
        name: item.name,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        category: item.category?.name, // Flatten category name
        discount: item.discount || 0
    })) || [];

    return {
      id: dbReceipt.id!.toString(),
      merchantId: 'unknown', // We don't have separate merchant table yet, just store names
      merchantName: dbReceipt.storeName,
      date: new Date(dbReceipt.purchaseDate),
      total: dbReceipt.totalAmount,
      imagePath: dbReceipt.imageUri || '',
      ocrConfidence: parseFloat(dbReceipt.ocrData || '0'),
      createdAt: dbReceipt.createdAt || new Date(),
      updatedAt: dbReceipt.updatedAt || new Date(),
      // @ts-ignore - Valid property for internal usage or if we extend the type
      items: items
    };
  }
}
