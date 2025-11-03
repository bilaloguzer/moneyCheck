// Constants for known Turkish retailers - names, patterns, categories
import { MerchantCategory, KNOWN_MERCHANTS } from '@/lib/types';

export const MERCHANT_PATTERNS = {
  [KNOWN_MERCHANTS.MIGROS]: ['migros', 'mıgros'],
  [KNOWN_MERCHANTS.CARREFOUR]: ['carrefour', 'carrefoursa'],
  [KNOWN_MERCHANTS.A101]: ['a101', 'a 101'],
  [KNOWN_MERCHANTS.BIM]: ['bim', 'bım'],
  [KNOWN_MERCHANTS.SOK]: ['şok', 'sok', 'şok market'],
} as const;

export const MERCHANT_CATEGORIES = {
  [KNOWN_MERCHANTS.MIGROS]: MerchantCategory.SUPERMARKET,
  [KNOWN_MERCHANTS.CARREFOUR]: MerchantCategory.SUPERMARKET,
  [KNOWN_MERCHANTS.A101]: MerchantCategory.GROCERY,
  [KNOWN_MERCHANTS.BIM]: MerchantCategory.GROCERY,
  [KNOWN_MERCHANTS.SOK]: MerchantCategory.GROCERY,
} as const;
