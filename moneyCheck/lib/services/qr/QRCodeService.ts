// QR Code Service - Main service for scanning and processing QR codes
import { GIBQRParser } from './GIBQRParser';
import type { QRScanResult, GIBQRData } from '@/lib/types/qr.types';
import type { OCRResult } from '@/lib/types';

/**
 * Service for handling QR code scanning and data extraction
 */
export class QRCodeService {
  
  /**
   * Process a scanned QR code string
   * Detects format and extracts receipt data
   */
  static async processQRCode(qrString: string): Promise<QRScanResult> {
    try {
      if (!qrString || qrString.trim().length === 0) {
        return {
          success: false,
          error: 'Empty QR code data',
        };
      }
      
      // Check if it's a GİB e-arşiv QR code
      if (GIBQRParser.isGIBFormat(qrString)) {
        const gibData = GIBQRParser.parseQRData(qrString);
        
        return {
          success: true,
          data: gibData,
          rawQRString: qrString,
        };
      }
      
      // Not a recognized receipt QR format
      return {
        success: false,
        error: 'QR code is not a recognized e-arşiv receipt format',
        rawQRString: qrString,
      };
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing QR code',
        rawQRString: qrString,
      };
    }
  }
  
  /**
   * Convert GİB QR data to OCRResult format for consistency with photo OCR
   * This allows us to use the same receipt processing flow
   */
  static convertToOCRResult(gibData: GIBQRData): OCRResult {
    // Parse date
    let receiptDate = new Date();
    if (gibData.documentDate) {
      try {
        receiptDate = new Date(gibData.documentDate);
      } catch (e) {
        console.warn('Could not parse QR date:', gibData.documentDate);
      }
    }
    
    return {
      merchant: {
        name: gibData.merchantName || gibData.merchantTitle || 'Unknown Store',
        confidence: 1.0, // QR data is 100% reliable
      },
      date: {
        value: receiptDate,
        confidence: 1.0,
      },
      total: {
        value: gibData.totalAmount || 0,
        confidence: 1.0,
      },
      items: [], // GİB QR typically doesn't contain line items, only totals
      rawText: JSON.stringify({
        source: 'qr',
        documentNumber: gibData.documentNumber,
        merchantTaxId: gibData.merchantTaxId,
        taxAmount: gibData.taxAmount,
        ettn: gibData.ettn,
        rawData: gibData.rawData,
      }),
    };
  }
  
  /**
   * Validate if a QR string is likely a receipt QR code
   * Quick check before full parsing
   */
  static isReceiptQR(qrString: string): boolean {
    if (!qrString || qrString.trim().length === 0) {
      return false;
    }
    
    // Check for GİB format
    if (GIBQRParser.isGIBFormat(qrString)) {
      return true;
    }
    
    // Other receipt QR formats can be added here
    
    return false;
  }
}
