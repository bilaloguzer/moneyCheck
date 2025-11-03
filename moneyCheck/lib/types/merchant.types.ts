// Type definitions for merchant entities

export interface Merchant {
  id: string;
  name: string;
  displayName: string;
  category: MerchantCategory;
  logoUrl?: string;
  patterns: string[]; // Regex patterns for OCR matching
  createdAt: Date;
}

export enum MerchantCategory {
  GROCERY = 'grocery',
  SUPERMARKET = 'supermarket',
  CONVENIENCE = 'convenience',
  OTHER = 'other',
}

export const KNOWN_MERCHANTS = {
  MIGROS: 'migros',
  CARREFOUR: 'carrefour',
  A101: 'a101',
  BIM: 'bim',
  SOK: 'sok',
} as const;

export type KnownMerchantId = typeof KNOWN_MERCHANTS[keyof typeof KNOWN_MERCHANTS];
