// Type definitions for receipt entities and OCR results

export interface Receipt {
  id: string;
  merchantId: string;
  merchantName: string;
  date: Date;
  total: number;
  imagePath: string;
  ocrConfidence: number;
  items?: LineItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id: string;
  receiptId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  confidence: number;
  category?: string;
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
