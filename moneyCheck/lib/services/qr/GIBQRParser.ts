// GİB (Gelir İdaresi Başkanlığı) e-arşiv QR Code Parser
// Parses Turkish tax administration QR format for e-invoices and e-receipts

import type { GIBQRData, QRDataFormat } from '@/lib/types/qr.types';

/**
 * Parser for Turkish GİB e-arşiv QR codes
 * 
 * Common formats:
 * 1. Pipe-delimited: "VKN|DocumentNo|Date|Amount|..."
 * 2. URL format: "https://earsivportal.efatura.gov.tr/..."
 * 3. JSON format: {"vkn": "...", "documentNo": "...", ...}
 */
export class GIBQRParser {
  
  /**
   * Parse a QR code string and extract receipt/invoice data
   */
  static parseQRData(qrString: string): GIBQRData {
    const trimmed = qrString.trim();
    
    // Try different parsing strategies
    if (this.isURLFormat(trimmed)) {
      return this.parseURLFormat(trimmed);
    } else if (this.isPipeDelimited(trimmed)) {
      return this.parsePipeDelimited(trimmed);
    } else if (this.isJSONFormat(trimmed)) {
      return this.parseJSONFormat(trimmed);
    }
    
    // Unknown format - return raw data
    return {
      rawData: trimmed,
      format: 'unknown',
    };
  }
  
  /**
   * Detect if QR is a GİB e-arşiv format
   */
  static isGIBFormat(qrString: string): boolean {
    const trimmed = qrString.trim();
    
    // Check for common GİB indicators
    const gibIndicators = [
      'earsivportal.efatura.gov.tr',
      'efatura.gov.tr',
      'ETTN',
      'VKN',
      'TCKN',
    ];
    
    return gibIndicators.some(indicator => 
      trimmed.includes(indicator)
    );
  }
  
  // ========== Format Detection ==========
  
  private static isURLFormat(str: string): boolean {
    return str.startsWith('http://') || str.startsWith('https://');
  }
  
  private static isPipeDelimited(str: string): boolean {
    // GİB often uses pipe delimiter: field|field|field
    return str.includes('|') && str.split('|').length > 3;
  }
  
  private static isJSONFormat(str: string): boolean {
    return (str.startsWith('{') && str.endsWith('}')) || 
           (str.startsWith('[') && str.endsWith(']'));
  }
  
  // ========== Format Parsers ==========
  
  /**
   * Parse URL format: https://earsivportal.efatura.gov.tr/...?params
   * Often contains ETTN, date, amount as query parameters
   */
  private static parseURLFormat(url: string): GIBQRData {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      const data: GIBQRData = {
        format: 'gib_earchive',
        rawData: url,
      };
      
      // Common parameter names (varies by implementation)
      data.ettn = params.get('ettn') || params.get('ETTN') || undefined;
      data.documentNumber = params.get('belgeNo') || params.get('documentNo') || undefined;
      data.merchantTaxId = params.get('vkn') || params.get('VKN') || undefined;
      
      // Try to extract date
      const dateParam = params.get('tarih') || params.get('date');
      if (dateParam) {
        data.documentDate = this.normalizeDate(dateParam);
      }
      
      // Try to extract amount
      const amountParam = params.get('tutar') || params.get('amount');
      if (amountParam) {
        data.totalAmount = this.parseAmount(amountParam);
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing URL format QR:', error);
      return {
        rawData: url,
        format: 'unknown',
      };
    }
  }
  
  /**
   * Parse pipe-delimited format: VKN|DocumentNo|Date|Amount|...
   * Format varies, but common pattern is:
   * Position 0: VKN/TCKN
   * Position 1: Document Number
   * Position 2: Date
   * Position 3: Total Amount
   * Position 4: Tax Amount or ETTN (UUID format)
   * Position 5: ETTN (if position 4 was tax amount)
   */
  private static parsePipeDelimited(str: string): GIBQRData {
    const parts = str.split('|');

    const data: GIBQRData = {
      format: 'gib_earchive',
      rawData: str,
    };

    // Try to intelligently map fields
    // This is a best-effort approach - actual format may vary

    if (parts.length >= 1 && this.looksLikeTaxId(parts[0])) {
      data.merchantTaxId = parts[0];
    }

    if (parts.length >= 2) {
      data.documentNumber = parts[1];
    }

    if (parts.length >= 3) {
      data.documentDate = this.normalizeDate(parts[2]);
    }

    if (parts.length >= 4) {
      data.totalAmount = this.parseAmount(parts[3]);
    }

    // Position 4 could be either tax amount or ETTN
    if (parts.length >= 5) {
      // Check if it's a UUID (ETTN) or a number (tax amount)
      if (this.looksLikeUUID(parts[4])) {
        data.ettn = parts[4];
      } else {
        data.taxAmount = this.parseAmount(parts[4]);
      }
    }

    // Position 5 might be ETTN if position 4 was tax amount
    if (parts.length >= 6 && this.looksLikeUUID(parts[5])) {
      data.ettn = parts[5];
    }

    return data;
  }
  
  /**
   * Parse JSON format
   */
  private static parseJSONFormat(str: string): GIBQRData {
    try {
      const json = JSON.parse(str);
      
      const data: GIBQRData = {
        format: 'gib_earchive',
        rawData: str,
      };
      
      // Map common JSON field names (case-insensitive)
      const getLowerKey = (obj: any, key: string) => {
        const lowerKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return lowerKey ? obj[lowerKey] : undefined;
      };
      
      data.documentNumber = getLowerKey(json, 'belgeno') || getLowerKey(json, 'documentno');
      data.merchantTaxId = getLowerKey(json, 'vkn') || getLowerKey(json, 'tckn');
      data.merchantTitle = getLowerKey(json, 'unvan') || getLowerKey(json, 'title');
      data.merchantName = getLowerKey(json, 'firmaadi') || getLowerKey(json, 'name');
      data.ettn = getLowerKey(json, 'ettn');
      
      const dateStr = getLowerKey(json, 'tarih') || getLowerKey(json, 'date');
      if (dateStr) {
        data.documentDate = this.normalizeDate(dateStr);
      }
      
      const timeStr = getLowerKey(json, 'saat') || getLowerKey(json, 'time');
      if (timeStr) {
        data.documentTime = timeStr;
      }
      
      const totalStr = getLowerKey(json, 'toplam') || getLowerKey(json, 'tutar') || getLowerKey(json, 'amount');
      if (totalStr) {
        data.totalAmount = this.parseAmount(totalStr);
      }
      
      const taxStr = getLowerKey(json, 'kdv') || getLowerKey(json, 'tax');
      if (taxStr) {
        data.taxAmount = this.parseAmount(taxStr);
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing JSON format QR:', error);
      return {
        rawData: str,
        format: 'unknown',
      };
    }
  }
  
  // ========== Utility Functions ==========
  
  /**
   * Check if a string looks like a Turkish tax ID (VKN or TCKN)
   * VKN: 10 digits, TCKN: 11 digits
   */
  private static looksLikeTaxId(str: string): boolean {
    const cleaned = str.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
  }

  /**
   * Check if a string looks like a UUID (ETTN format)
   * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   */
  private static looksLikeUUID(str: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(str.trim());
  }
  
  /**
   * Normalize date to ISO format
   * Handles: DD/MM/YYYY, DD.MM.YYYY, YYYY-MM-DD, etc.
   */
  private static normalizeDate(dateStr: string): string {
    try {
      // Remove time if present
      const datePart = dateStr.split(' ')[0];
      
      // Try DD/MM/YYYY or DD.MM.YYYY
      if (datePart.includes('/') || datePart.includes('.')) {
        const separator = datePart.includes('/') ? '/' : '.';
        const parts = datePart.split(separator);
        
        if (parts.length === 3) {
          const [day, month, year] = parts;
          // Convert to ISO: YYYY-MM-DD
          return `${year.padStart(4, '20')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      // Already in ISO format or other format
      return datePart;
    } catch (error) {
      return dateStr;
    }
  }
  
  /**
   * Parse amount string to number
   * Handles: "123.45", "123,45", "123.456,78" (Turkish format)
   */
  private static parseAmount(amountStr: string | number): number {
    if (typeof amountStr === 'number') {
      return amountStr;
    }
    
    try {
      // Remove currency symbols and spaces
      let cleaned = amountStr.replace(/[^\d,.-]/g, '');
      
      // Handle Turkish format: 1.234,56 -> 1234.56
      if (cleaned.includes(',') && cleaned.includes('.')) {
        // Assume . is thousands separator, , is decimal
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else if (cleaned.includes(',')) {
        // Only comma - could be decimal separator
        cleaned = cleaned.replace(',', '.');
      }
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    } catch (error) {
      return 0;
    }
  }
}
