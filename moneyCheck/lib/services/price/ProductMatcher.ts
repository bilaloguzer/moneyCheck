// Matches extracted receipt items to products in price database using fuzzy matching
import type { Product } from '@/lib/types';

export class ProductMatcher {
  match(productName: string): Product | null {
    throw new Error('Not implemented');
  }

  fuzzyMatch(productName: string, threshold = 0.8): Product[] {
    throw new Error('Not implemented');
  }
}
