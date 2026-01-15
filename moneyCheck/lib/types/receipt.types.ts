// Type definitions for receipt entities and OCR results

export interface Receipt {
  id: string;
  merchantId?: string;
  merchantName: string;
  date: string | Date;
  totalAmount: number;
  imageUri?: string;
  status: 'processing' | 'completed' | 'failed';
  items?: LineItem[];
  createdAt: string | Date;
  updatedAt: string | Date;
  ocrConfidence?: number;
}

export interface LineItem {
  id: string;
  receiptId: string;
  name: string;
  cleanName?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  lineTotal: number;
  confidence: number;
  category?: string;
  discount?: number;
}

export interface OCRResult {
  merchant: {
    name: string;
    confidence: number;
  };
  date: {
    value: Date;
    confidence: number;
  };
  total: {
    value: number;
    confidence: number;
  };
  items: Array<{
    name: string;
    cleanName?: string;
    category?: string;
    quantity: number;
    price: number;
    confidence: number;
  }>;
  rawText: string;
}

export interface ReceiptFilter {
  merchantId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}
