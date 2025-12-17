// Normalizes Turkish characters and handles common OCR errors (ş, ğ, ı, ö, ü, ç)

export class TurkishTextNormalizer {
  /**
   * Normalizes text by converting to upper case with Turkish locale awareness
   * and handling special characters.
   */
  normalize(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/i/g, 'İ')
      .replace(/ı/g, 'I')
      .replace(/ğ/g, 'Ğ')
      .replace(/ü/g, 'Ü')
      .replace(/ş/g, 'Ş')
      .replace(/ö/g, 'Ö')
      .replace(/ç/g, 'Ç')
      .toUpperCase();
  }

  /**
   * Fixes common OCR misinterpretations of characters
   */
  fixCommonOCRErrors(text: string): string {
    if (!text) return '';
    
    // Fix common number/letter confusions in price contexts or general text
    // This is context-sensitive usually, but we can do some safe globals or
    // helper methods for specific fields (like prices).
    
    // For now, return the text as is or apply very safe fixes.
    // aggressive fixing is dangerous without context (e.g. 0 vs O).
    // We will leave this simple for now and rely on specific parsers (like price parser)
    // to handle 0/O confusion.
    
    return text;
  }
  
  /**
   * specific fixer for numeric values (prices, dates)
   */
  normalizeNumeric(text: string): string {
     return text
       .replace(/O/g, '0')
       .replace(/o/g, '0')
       .replace(/I/g, '1')
       .replace(/l/g, '1')
       .replace(/B/g, '8')
       .replace(/S/g, '5')
       .replace(/Z/g, '2')
       .replace(/,/g, '.'); // Standardize decimal separator
  }
}
