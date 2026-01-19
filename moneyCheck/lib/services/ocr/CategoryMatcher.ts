/**
 * Category Matcher Service
 * Fuzzy matching for Turkish OCR text to categorize receipt items
 */

import Fuse, { FuseResult } from 'fuse.js';
import * as SQLite from 'expo-sqlite';

/**
 * Item group with full category hierarchy
 */
export interface ItemGroupWithHierarchy {
  id: number;
  name_tr: string;
  subcategory_id: number;
  subcategory_name: string;
  category_id: number;
  category_name: string;
  department_id: number;
  department_name: string;
  color_code: string;
}

/**
 * Category match result
 */
export interface CategoryMatch {
  itemGroup: ItemGroupWithHierarchy;
  confidence: number; // 0.0 to 1.0
  originalText: string;
  matchedText: string;
}

/**
 * Batch match result for a receipt
 */
export interface BatchMatchResult {
  matched: CategoryMatch[];
  unmatched: string[];
  averageConfidence: number;
}

/**
 * Category Matcher Class
 * Uses Fuse.js for fuzzy string matching optimized for Turkish text
 */
export class CategoryMatcher {
  private fuse: Fuse<ItemGroupWithHierarchy> | null = null;
  private itemGroups: ItemGroupWithHierarchy[] = [];
  private initialized = false;

  /**
   * Initialize the matcher with item groups from database
   */
  async initialize(db: SQLite.SQLiteDatabase): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('Initializing Category Matcher...');

    // Load all item groups with full hierarchy
    const items = await db.getAllAsync<ItemGroupWithHierarchy>(`
      SELECT 
        ig.id,
        ig.name_tr,
        ig.subcategory_id,
        s.name_tr as subcategory_name,
        s.category_id,
        c.name_tr as category_name,
        c.department_id,
        d.name_tr as department_name,
        d.color_code
      FROM item_groups ig
      JOIN subcategories s ON ig.subcategory_id = s.id
      JOIN categories c ON s.category_id = c.id
      JOIN departments d ON c.department_id = d.id
      ORDER BY ig.name_tr
    `);

    this.itemGroups = items;

    // Configure Fuse.js for Turkish text matching
    this.fuse = new Fuse(this.itemGroups, {
      keys: ['name_tr'],
      threshold: 0.4, // Lower = more strict, Higher = more fuzzy
      distance: 100, // Maximum distance to search
      minMatchCharLength: 2,
      includeScore: true,
      ignoreLocation: true, // Don't care where in the string the match is
      useExtendedSearch: false,
    });

    this.initialized = true;
    console.log(`Category Matcher initialized with ${this.itemGroups.length} item groups`);
  }

  /**
   * Normalize Turkish text for better OCR matching
   * Handles common OCR errors with Turkish characters
   */
  private normalizeTurkishText(text: string): string {
    let normalized = text.toLowerCase().trim();

    // Remove special characters except Turkish letters
    normalized = normalized.replace(/[^a-zçğıöşü0-9\s]/gi, '');

    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');

    return normalized;
  }

  /**
   * Create variations of text to improve matching for common OCR errors
   */
  private createTextVariations(text: string): string[] {
    const variations = [text];
    
    // Common Turkish OCR confusion pairs
    const replacements: [string, string[]][] = [
      ['ı', ['i', 'l', '1']],
      ['i', ['ı', 'l', '1']],
      ['ğ', ['g']],
      ['ş', ['s']],
      ['ç', ['c']],
      ['ö', ['o']],
      ['ü', ['u']],
    ];

    // Generate variations (limited to avoid explosion)
    for (const [original, replacementChars] of replacements) {
      if (text.includes(original)) {
        for (const replacement of replacementChars) {
          const variant = text.replace(new RegExp(original, 'g'), replacement);
          if (!variations.includes(variant)) {
            variations.push(variant);
          }
        }
        // Only do first match to avoid too many variations
        break;
      }
    }

    return variations;
  }

  /**
   * Find best matching category for a single item
   */
  findBestMatch(ocrText: string): CategoryMatch | null {
    if (!this.initialized || !this.fuse) {
      throw new Error('Category Matcher not initialized. Call initialize() first.');
    }

    if (!ocrText || ocrText.trim().length < 2) {
      return null;
    }

    // Normalize the input text
    const cleanText = this.normalizeTurkishText(ocrText);
    
    // Create variations to handle OCR errors
    const variations = this.createTextVariations(cleanText);

    let bestResult: FuseResult<ItemGroupWithHierarchy> | null = null;
    let bestVariation = cleanText;

    // Try each variation and keep the best match
    for (const variation of variations) {
      const results = this.fuse.search(variation);
      
      if (results.length > 0) {
        const topResult = results[0];
        if (!bestResult || (topResult.score ?? 1) < (bestResult.score ?? 1)) {
          bestResult = topResult;
          bestVariation = variation;
        }
      }
    }

    if (!bestResult || bestResult.score === undefined) {
      return null;
    }

    // Convert Fuse score (lower is better) to confidence (higher is better)
    const confidence = 1 - bestResult.score;

    return {
      itemGroup: bestResult.item,
      confidence,
      originalText: ocrText,
      matchedText: bestVariation,
    };
  }

  /**
   * Match multiple items from a receipt
   */
  async matchReceiptItems(
    ocrItems: string[],
    minConfidence: number = 0.6
  ): Promise<BatchMatchResult> {
    if (!this.initialized) {
      throw new Error('Category Matcher not initialized. Call initialize() first.');
    }

    const matched: CategoryMatch[] = [];
    const unmatched: string[] = [];
    let totalConfidence = 0;

    for (const itemText of ocrItems) {
      const match = this.findBestMatch(itemText);

      if (match && match.confidence >= minConfidence) {
        matched.push(match);
        totalConfidence += match.confidence;
      } else {
        unmatched.push(itemText);
      }
    }

    const averageConfidence = matched.length > 0 
      ? totalConfidence / matched.length 
      : 0;

    return {
      matched,
      unmatched,
      averageConfidence,
    };
  }

  /**
   * Search for item groups by name
   * Useful for manual category selection
   */
  searchItemGroups(query: string, limit: number = 20): ItemGroupWithHierarchy[] {
    if (!this.initialized || !this.fuse) {
      return [];
    }

    const cleanQuery = this.normalizeTurkishText(query);
    const results = this.fuse.search(cleanQuery);

    return results
      .slice(0, limit)
      .map(result => result.item);
  }

  /**
   * Get all item groups for a specific department
   */
  getItemGroupsByDepartment(departmentId: number): ItemGroupWithHierarchy[] {
    return this.itemGroups.filter(item => item.department_id === departmentId);
  }

  /**
   * Get all item groups for a specific category
   */
  getItemGroupsByCategory(categoryId: number): ItemGroupWithHierarchy[] {
    return this.itemGroups.filter(item => item.category_id === categoryId);
  }

  /**
   * Get all item groups for a specific subcategory
   */
  getItemGroupsBySubcategory(subcategoryId: number): ItemGroupWithHierarchy[] {
    return this.itemGroups.filter(item => item.subcategory_id === subcategoryId);
  }

  /**
   * Reset and reinitialize the matcher
   */
  async reset(db: SQLite.SQLiteDatabase): Promise<void> {
    this.initialized = false;
    this.fuse = null;
    this.itemGroups = [];
    await this.initialize(db);
  }
}

/**
 * Singleton instance
 */
let categoryMatcherInstance: CategoryMatcher | null = null;

/**
 * Get or create the category matcher instance
 */
export async function getCategoryMatcher(db: SQLite.SQLiteDatabase): Promise<CategoryMatcher> {
  if (!categoryMatcherInstance) {
    categoryMatcherInstance = new CategoryMatcher();
    await categoryMatcherInstance.initialize(db);
  }
  return categoryMatcherInstance;
}

/** 
 * Common Turkish product name mappings for improved OCR accuracy
 * Maps common OCR misreads to correct product names
 */
export const TURKISH_PRODUCT_CORRECTIONS: Record<string, string> = {
  // Common vegetables
  'domates': 'Domates',
  'salatalik': 'Salatalık',
  'salatal1k': 'Salatalık',
  'biber': 'Biber',
  'patl1can': 'Patlıcan',
  'patlican': 'Patlıcan',
  
  // Common fruits
  'elma': 'Elma',
  'portakal': 'Portakal',
  'muz': 'Muz',
  'uzum': 'Üzüm',
  
  // Dairy
  'peynir': 'Peynir',
  'kasar': 'Kaşar',
  'yogurt': 'Yoğurt',
  'sut': 'Süt',
  
  // Common items
  'ekmek': 'Ekmek',
  'su': 'Su',
  'cay': 'Çay',
  'kahve': 'Kahve',
};

/**
 * Apply common corrections to OCR text
 */
export function applyTurkishCorrections(text: string): string {
  const lowercased = text.toLowerCase().trim();
  return TURKISH_PRODUCT_CORRECTIONS[lowercased] || text;
}
