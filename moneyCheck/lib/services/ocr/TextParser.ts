// Parses OCR text to extract merchant, date, total, and line items with confidence scores
import type { OCRResult } from '@/lib/types';
import { TurkishTextNormalizer } from './TurkishTextNormalizer';
import { MerchantMatcher } from './MerchantMatcher';

export class TextParser {
  private normalizer: TurkishTextNormalizer;
  private merchantMatcher: MerchantMatcher;

  constructor() {
    this.normalizer = new TurkishTextNormalizer();
    this.merchantMatcher = new MerchantMatcher();
  }

  parse(rawText: string): OCRResult {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // 1. Merchant Extraction
    const merchantResult = this.extractMerchant(lines);
    
    // 2. Date Extraction
    const dateResult = this.extractDate(lines);
    
    // 3. Total Extraction
    const totalResult = this.extractTotal(lines);
    
    // 4. Line Items Extraction
    // We pass lines and the indices of found metadata to avoid re-parsing them as items
    const items = this.extractItems(lines, totalResult.lineIndex, dateResult.lineIndex);

    return {
      merchant: merchantResult,
      date: dateResult,
      total: totalResult,
      items: items,
      rawText: rawText,
    };
  }

  private extractMerchant(lines: string[]) {
    // Check first 5 lines for merchant
    const linesToCheck = lines.slice(0, 5);
    for (const line of linesToCheck) {
      const match = this.merchantMatcher.match(line);
      if (match.merchant) {
        return {
          name: match.merchant.displayName,
          confidence: match.confidence,
        };
      }
    }
    
    // Fallback: Return first line as merchant if no match found (low confidence)
    return {
      name: lines[0] || 'Unknown Merchant',
      confidence: 0.2, // Low confidence
    };
  }

  private extractDate(lines: string[]) {
    // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    const datePattern = /(\d{2})[./-](\d{2})[./-](\d{4})/;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(datePattern);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
            const year = parseInt(match[3], 10);
            
            const date = new Date(year, month, day);
            // Basic validation
            if (year > 2000 && year < 2100 && month >= 0 && month < 12 && day > 0 && day <= 31) {
                return {
                    value: date,
                    confidence: 0.9,
                    lineIndex: i
                };
            }
        }
    }

    return {
        value: new Date(),
        confidence: 0,
        lineIndex: -1
    };
  }

  private extractTotal(lines: string[]) {
    // Look for TOPLAM or TUTAR
    // Also look for *TOPK* or similar due to OCR errors
    const totalKeywords = ['TOPLAM', 'TOPLAN', 'TUTAR', 'ODENECEK'];
    
    for (let i = 0; i < lines.length; i++) {
        const normalizedLine = this.normalizer.normalize(lines[i]);
        
        // Check if line contains keywords
        const hasKeyword = totalKeywords.some(keyword => normalizedLine.includes(keyword));
        
        if (hasKeyword) {
            // Check for KDV line to avoid picking it up as total
            if (normalizedLine.includes('TOPLAM KDV') || normalizedLine.includes('KDV TOPLAM')) {
                continue; 
            }

            // Try to find price in this line
            const price = this.parsePrice(lines[i]);
            if (price !== null) {
                return { value: price, confidence: 0.85, lineIndex: i };
            }
            
            // Try next line if keyword is standalone
            if (i + 1 < lines.length) {
                const nextLinePrice = this.parsePrice(lines[i+1]);
                 if (nextLinePrice !== null) {
                    return { value: nextLinePrice, confidence: 0.8, lineIndex: i + 1 };
                }
            }
        } else {
            // Check for KDV line to avoid picking it up as total if it has a higher value than the current fallback?
            // Actually, "TOPLAM KDV" might be picked up if we aren't careful.
            // "TOPLAM KDV" line has "TOPLAM" keyword, so it enters this block.
            // We need to differentiate TOPLAM vs TOPLAM KDV
            
            if (normalizedLine.includes('TOPLAM KDV') || normalizedLine.includes('KDV TOPLAM')) {
                // This is likely the tax line, skip if we want grand total
                // Unless grand total is not found elsewhere?
                // Usually we want the actual total.
                // Let's explicitly look for just "TOPLAM" with price or "GENEL TOPLAM"
                continue; 
            }
        }
    }

    // Fallback: Find the largest number in the bottom half of the receipt
    // This is risky but often effective
    let maxPrice = 0;
    let maxPriceIndex = -1;
    
    const startSearchIndex = Math.floor(lines.length / 2);
    for (let i = startSearchIndex; i < lines.length; i++) {
        const price = this.parsePrice(lines[i]);
        if (price !== null && price > maxPrice) {
            maxPrice = price;
            maxPriceIndex = i;
        }
    }
    
    if (maxPrice > 0) {
        return { value: maxPrice, confidence: 0.4, lineIndex: maxPriceIndex };
    }

    return { value: 0, confidence: 0, lineIndex: -1 };
  }

  private extractItems(lines: string[], totalIndex: number, dateIndex: number) {
      const items: OCRResult['items'] = [];
      
      // Heuristic: Items are usually between header and total
      // Start after header (approx line 3) and end before total
      const startIndex = 2;
      const endIndex = totalIndex > -1 ? totalIndex : lines.length - 2;

      for (let i = startIndex; i < endIndex; i++) {
          if (i === dateIndex) continue; // Skip date line

          const line = lines[i];
          const normalizedLine = this.normalizer.normalize(line);
          
          // Skip lines that look like headers or irrelevant info
          if (normalizedLine.includes('KDV') || normalizedLine.includes('FIS') || normalizedLine.includes('TARIH')) {
              continue;
          }

          // Try to extract price at the end of the line
          const price = this.extractPriceAtEnd(line);
          
          if (price !== null) {
              // Extract name (everything before the price)
              // This is a naive split, assumes price is last token(s)
              // We need to be careful about quantity like "2 x 15,00"
              
              const name = this.cleanItemName(line, price);
              
              if (name.length > 2) { // Ignore very short noise
                   items.push({
                      name: name,
                      quantity: 1, // Default to 1, TODO: parse "2x" patterns
                      price: price,
                      confidence: 0.7
                  });
              }
          }
      }

      return items;
  }

  private parsePrice(text: string): number | null {
      // Normalize: replace , with . if needed (Turkish style 10,50 -> 10.50)
      // Remove all non-numeric chars except . and ,
      
      // Regex to find price pattern: digits + [,.] + digits
      // We need to handle "1.234,56" format too but for now let's assume simple receipts
      
      // Clean noise
      let clean = this.normalizer.normalizeNumeric(text);
      
      // Match something that looks like a price at the end or standalone
      const priceMatch = clean.match(/(\d+[.,]\d{2})/);
      
      if (priceMatch) {
          let numStr = priceMatch[1];
          // Turkish format: comma is decimal separator usually
          numStr = numStr.replace(',', '.');
          
          const val = parseFloat(numStr);
          if (!isNaN(val)) return val;
      }
      
      return null;
  }
  
  private extractPriceAtEnd(text: string): number | null {
       // Look specifically at the end of the line
       const parts = text.trim().split(/\s+/);
       if (parts.length < 2) return null; // Need name + price
       
       const lastPart = parts[parts.length - 1];
       const secondLastPart = parts[parts.length - 2];
       
       // Try last part
       let price = this.parsePrice(lastPart);
       if (price !== null) return price;
       
       // Sometimes price has a currency symbol or 'A'/'KDV' marker after it
       // Check second to last
       if (lastPart.length <= 3) { // Assume it's a marker
           price = this.parsePrice(secondLastPart);
           if (price !== null) return price;
       }
       
       return null;
  }

  private cleanItemName(text: string, price: number): string {
      // Remove the price from the text
      // This is rough, ideally we use indices
      
      // Heuristic: remove digits and special chars from end until we hit text
      // Or just take the first N words
      
      let clean = text;
      // Remove the price string roughly
      // This is purely visual cleaning
      
      // Split by spaces, remove last part(s) that look like numbers
      const parts = text.split(/\s+/);
      while(parts.length > 0) {
          const last = parts[parts.length - 1];
          if (this.parsePrice(last) !== null || last.length < 2 || /^\d+$/.test(last)) {
              parts.pop();
          } else {
              break;
          }
      }
      
      return parts.join(' ');
  }
}
