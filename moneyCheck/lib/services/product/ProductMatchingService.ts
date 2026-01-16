// Product Matching Service - Match similar products across receipts
import type { ProductMatch } from '../price/types';

export class ProductMatchingService {
  /**
   * Turkish character mapping for normalization
   */
  private static readonly TURKISH_CHAR_MAP: Record<string, string> = {
    'ş': 's', 'Ş': 's',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u',
    'ç': 'c', 'Ç': 'c',
  };

  /**
   * Common noise words to remove from product names
   */
  private static readonly NOISE_WORDS = new Set([
    'adet', 'kg', 'gr', 'ml', 'lt', 'l', 'g',
    'paket', 'kutu', 'sise', 'sisesi', 'poset',
    'tam', 'yarim', 'buyuk', 'kucuk', 'orta',
    'yeni', 'fresh', 'taze'
  ]);

  /**
   * Normalize a product name for comparison
   */
  static normalizeProductName(name: string): string {
    if (!name) return '';

    let normalized = name.toLowerCase().trim();

    // Replace Turkish characters
    for (const [turkish, latin] of Object.entries(this.TURKISH_CHAR_MAP)) {
      normalized = normalized.replace(new RegExp(turkish, 'g'), latin);
    }

    // Remove special characters except spaces
    normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');

    // Remove numbers (sizes, quantities)
    normalized = normalized.replace(/\d+/g, '');

    // Split into words
    const words = normalized.split(/\s+/).filter(word => word.length > 0);

    // Remove noise words
    const cleanedWords = words.filter(word => !this.NOISE_WORDS.has(word));

    // Sort words for consistent comparison
    const sortedWords = cleanedWords.sort();

    return sortedWords.join(' ').trim();
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,    // deletion
            dp[i][j - 1] + 1,    // insertion
            dp[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Calculate Dice coefficient (bigram similarity)
   */
  private static diceCoefficient(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length < 2 || str2.length < 2) return 0.0;

    const getBigrams = (str: string): Set<string> => {
      const bigrams = new Set<string>();
      for (let i = 0; i < str.length - 1; i++) {
        bigrams.add(str.substring(i, i + 2));
      }
      return bigrams;
    };

    const bigrams1 = getBigrams(str1);
    const bigrams2 = getBigrams(str2);

    let intersection = 0;
    for (const bigram of bigrams1) {
      if (bigrams2.has(bigram)) {
        intersection++;
      }
    }

    return (2.0 * intersection) / (bigrams1.size + bigrams2.size);
  }

  /**
   * Calculate similarity score between two product names (0-1)
   */
  static calculateSimilarity(name1: string, name2: string): number {
    const normalized1 = this.normalizeProductName(name1);
    const normalized2 = this.normalizeProductName(name2);

    if (normalized1 === normalized2) return 1.0;
    if (!normalized1 || !normalized2) return 0.0;

    // Exact normalized match
    if (normalized1 === normalized2) return 1.0;

    // Calculate Levenshtein similarity
    const maxLen = Math.max(normalized1.length, normalized2.length);
    const levDist = this.levenshteinDistance(normalized1, normalized2);
    const levSimilarity = 1 - (levDist / maxLen);

    // Calculate Dice coefficient
    const diceSim = this.diceCoefficient(normalized1, normalized2);

    // Weighted combination (Dice is better for fuzzy matching)
    const similarity = (levSimilarity * 0.3) + (diceSim * 0.7);

    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Check if two product names likely refer to the same product
   */
  static areProductsSimilar(name1: string, name2: string, threshold: number = 0.7): boolean {
    return this.calculateSimilarity(name1, name2) >= threshold;
  }

  /**
   * Find similar products from a list
   */
  static findSimilarProducts(
    productName: string,
    products: { name: string; id?: number }[],
    threshold: number = 0.7
  ): ProductMatch[] {
    const normalized = this.normalizeProductName(productName);
    const matches: ProductMatch[] = [];

    for (const product of products) {
      const similarity = this.calculateSimilarity(productName, product.name);
      
      if (similarity >= threshold) {
        matches.push({
          productName: product.name,
          normalizedName: this.normalizeProductName(product.name),
          similarity,
          lineItemId: product.id,
        });
      }
    }

    // Sort by similarity (highest first)
    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Group similar items together
   */
  static groupSimilarItems(
    items: { name: string; id: number }[],
    threshold: number = 0.7
  ): Map<string, { name: string; id: number }[]> {
    const groups = new Map<string, { name: string; id: number }[]>();
    const processed = new Set<number>();

    for (const item of items) {
      if (processed.has(item.id)) continue;

      const normalized = this.normalizeProductName(item.name);
      const group: { name: string; id: number }[] = [item];
      processed.add(item.id);

      // Find all similar items
      for (const other of items) {
        if (processed.has(other.id)) continue;
        
        if (this.areProductsSimilar(item.name, other.name, threshold)) {
          group.push(other);
          processed.add(other.id);
        }
      }

      groups.set(normalized, group);
    }

    return groups;
  }
}
