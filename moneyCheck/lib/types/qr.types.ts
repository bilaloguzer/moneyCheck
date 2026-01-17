// QR Code related types for e-arşiv and receipt scanning

/**
 * Supported QR data formats
 */
export type QRDataFormat = 'gib_earchive' | 'unknown';

/**
 * Raw GİB (Gelir İdaresi Başkanlığı) e-arşiv QR data structure
 * Turkish tax administration standard format
 */
export interface GIBQRData {
  // Document metadata
  documentNumber?: string;      // Belge No (Invoice/Receipt Number)
  documentDate?: string;         // Belge Tarihi (ISO format or DD/MM/YYYY)
  documentTime?: string;         // Belge Saati
  
  // Merchant info
  merchantTaxId?: string;        // VKN (Vergi Kimlik Numarası) or TCKN
  merchantTitle?: string;        // Firma Ünvanı
  merchantName?: string;         // Firma Adı
  
  // Financial data
  totalAmount?: number;          // Toplam Tutar
  taxAmount?: number;            // KDV Tutarı
  discountAmount?: number;       // İndirim Tutarı
  
  // Additional metadata
  ettn?: string;                 // ETTN (Elektronik Fatura UUID)
  rawData?: string;              // Original QR string for debugging
  format?: QRDataFormat;         // Detected format
}

/**
 * Result from QR code scanning
 */
export interface QRScanResult {
  success: boolean;
  data?: GIBQRData;
  error?: string;
  rawQRString?: string;
}

/**
 * QR scan mode for camera
 */
export type QRScanMode = 'photo' | 'qr';
