// Matches extracted merchant text against known Turkish retailers (Migros, Carrefour, A101, BİM, Şok)
import type { Merchant } from '@/lib/types';
import { MERCHANT_PATTERNS, MERCHANT_CATEGORIES } from '@/lib/constants/merchants';
import { KNOWN_MERCHANTS } from '@/lib/types'; // Import keys

export class MerchantMatcher {
  match(text: string): { merchant: Merchant | null; confidence: number } {
    if (!text) return { merchant: null, confidence: 0 };

    const normalizedText = text.toLowerCase(); // Patterns are usually lower case or we need to handle case
    
    // We need to iterate over the KNOWN_MERCHANTS keys
    // Since MERCHANT_PATTERNS uses the values from KNOWN_MERCHANTS as keys
    
    for (const key of Object.keys(MERCHANT_PATTERNS)) {
       const merchantKey = key as keyof typeof MERCHANT_PATTERNS;
       const patterns = MERCHANT_PATTERNS[merchantKey];
       
       for (const pattern of patterns) {
         if (normalizedText.includes(pattern)) {
           // Match found
           // Construct a partial Merchant object or return the ID/Name
           // Since we don't have a database of merchant objects here, we construct a transient one
           // or we might need to fetch it. For now, we return a basic object.
           
           const merchantName = this.formatMerchantName(merchantKey);
           
           const merchant: Merchant = {
             id: merchantKey,
             name: merchantKey, // ID as name for now, or display name
             displayName: merchantName,
             category: MERCHANT_CATEGORIES[merchantKey],
             patterns: [...patterns],
             createdAt: new Date(), // Dummy date
           };
           
           return { merchant, confidence: 0.9 }; // High confidence on direct string match
         }
       }
    }

    return { merchant: null, confidence: 0 };
  }
  
  private formatMerchantName(key: string): string {
    // Simple formatter, e.g., 'migros' -> 'Migros'
    // Or map specific display names
    const displayNames: Record<string, string> = {
        [KNOWN_MERCHANTS.MIGROS]: 'Migros',
        [KNOWN_MERCHANTS.CARREFOUR]: 'CarrefourSA',
        [KNOWN_MERCHANTS.A101]: 'A101',
        [KNOWN_MERCHANTS.BIM]: 'BİM',
        [KNOWN_MERCHANTS.SOK]: 'Şok Market',
    };
    return displayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }
}
