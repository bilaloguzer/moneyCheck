// Product Matching Service - Fuzzy matching for product names
// Uses fuzzysort for fast, accurate fuzzy matching
import fuzzysort from 'fuzzysort';

export interface ProductMatch {
  productId: string;
  productName: string;
  score: number; // 0-1, higher is better
  merchant: string;
  price: number;
  date: string;
}

export class ProductMatchingService {
  /**
   * Normalize product name for better matching
   */
  static normalizeProductName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      // Remove special characters but keep Turkish chars
      .replace(/[^\wğüşıöçĞÜŞİÖÇ\s]/g, '')
      // Common variations
      .replace(/\blt\b/g, 'l')
      .replace(/\bltr\b/g, 'l')
      .replace(/\blitre\b/g, 'l')
      .replace(/\bliter\b/g, 'l')
      .replace(/\bml\b/g, 'ml')
      .replace(/\bgr\b/g, 'g')
      .replace(/\bgram\b/g, 'g')
      .replace(/\bkg\b/g, 'kg')
      .replace(/\bkilogram\b/g, 'kg')
      .replace(/\badet\b/g, 'pcs')
      .replace(/\bpiece\b/g, 'pcs');
  }

  /**
   * Find similar products using fuzzy matching
   */
  static findSimilarProducts(
    searchTerm: string,
    products: Array<{
      id: string;
      name: string;
      cleanName?: string;
      merchant?: string;
      price?: number;
      date?: string;
    }>,
    threshold: number = 0.5, // Minimum similarity score (0-1)
    limit: number = 10
  ): ProductMatch[] {
    const normalizedSearch = this.normalizeProductName(searchTerm);
    
    // Prepare products for fuzzy search
    const preparedProducts = products.map(product => ({
      ...product,
      searchText: this.normalizeProductName(product.cleanName || product.name),
    }));
    
    // Use fuzzysort for fuzzy matching
    const results = fuzzysort.go(normalizedSearch, preparedProducts, {
      key: 'searchText',
      limit,
      threshold: threshold * 1000 - 1000, // Convert 0-1 to fuzzysort scale
    });
    
    // Map results to ProductMatch
    return results.map(result => ({
      productId: result.obj.id,
      productName: result.obj.name,
      score: this.normalizeScore(result.score),
      merchant: result.obj.merchant || 'Unknown',
      price: result.obj.price || 0,
      date: result.obj.date || new Date().toISOString(),
    }));
  }

  /**
   * Normalize fuzzysort score to 0-1 range
   */
  private static normalizeScore(score: number): number {
    // Fuzzysort scores are negative (0 is perfect, more negative is worse)
    // Convert to 0-1 scale where 1 is best
    const normalized = Math.max(0, (score + 1000) / 1000);
    return Math.min(1, normalized);
  }

  /**
   * Check if two product names likely refer to the same product
   */
  static areSameProduct(name1: string, name2: string, threshold: number = 0.7): boolean {
    const normalized1 = this.normalizeProductName(name1);
    const normalized2 = this.normalizeProductName(name2);
    
    // Exact match after normalization
    if (normalized1 === normalized2) {
      return true;
    }
    
    // Fuzzy match
    const result = fuzzysort.single(normalized1, normalized2);
    if (!result) return false;
    
    const score = this.normalizeScore(result.score);
    return score >= threshold;
  }

  /**
   * Group similar products together
   */
  static groupSimilarProducts(
    products: Array<{
      id: string;
      name: string;
      cleanName?: string;
      [key: string]: any;
    }>,
    threshold: number = 0.8
  ): Array<Array<typeof products[0]>> {
    const groups: Array<Array<typeof products[0]>> = [];
    const processed = new Set<string>();
    
    for (const product of products) {
      if (processed.has(product.id)) continue;
      
      const group = [product];
      processed.add(product.id);
      
      // Find similar products
      for (const otherProduct of products) {
        if (
          processed.has(otherProduct.id) ||
          product.id === otherProduct.id
        ) {
          continue;
        }
        
        if (
          this.areSameProduct(
            product.cleanName || product.name,
            otherProduct.cleanName || otherProduct.name,
            threshold
          )
        ) {
          group.push(otherProduct);
          processed.add(otherProduct.id);
        }
      }
      
      groups.push(group);
    }
    
    return groups;
  }

  /**
   * Extract brand from product name
   */
  static extractBrand(productName: string): string | null {
    const commonBrands = [
      'coca cola',
      'pepsi',
      'fanta',
      'sprite',
      'ülker',
      'eti',
      'torku',
      'pınar',
      'sütaş',
      'danone',
      'nestle',
      'unilever',
      'procter',
      'gillette',
      'colgate',
      'milka',
      'nutella',
      'lipton',
      'knorr',
      'maggi',
      'lay',
      'doritos',
      'ruffles',
    ];
    
    const lowerName = productName.toLowerCase();
    
    for (const brand of commonBrands) {
      if (lowerName.includes(brand)) {
        return brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    }
    
    // Try to extract first word as potential brand
    const words = productName.trim().split(/\s+/);
    if (words.length > 0 && words[0].length > 2) {
      return words[0];
    }
    
    return null;
  }

  /**
   * Calculate similarity percentage between two strings
   */
  static getSimilarityScore(str1: string, str2: string): number {
    const normalized1 = this.normalizeProductName(str1);
    const normalized2 = this.normalizeProductName(str2);
    
    const result = fuzzysort.single(normalized1, normalized2);
    if (!result) return 0;
    
    return this.normalizeScore(result.score);
  }
}

