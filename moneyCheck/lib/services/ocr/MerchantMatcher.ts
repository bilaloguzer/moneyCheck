// Matches extracted merchant text against known Turkish retailers (Migros, Carrefour, A101, BİM, Şok)
import type { Merchant } from '@/lib/types';

export class MerchantMatcher {
  match(text: string): { merchant: Merchant | null; confidence: number } {
    throw new Error('Not implemented');
  }
}
