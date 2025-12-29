// Spending category constants and mappings

export const SPENDING_CATEGORIES = {
  GROCERIES: 'groceries',
  HOUSEHOLD: 'household',
  BEVERAGES: 'beverages',
  SNACKS: 'snacks',
  PERSONAL_CARE: 'personal_care',
  CLEANING: 'cleaning',
  OTHER: 'other',
} as const;

export const CATEGORY_DISPLAY_NAMES = {
  [SPENDING_CATEGORIES.GROCERIES]: 'Gıda',
  [SPENDING_CATEGORIES.HOUSEHOLD]: 'Ev Eşyaları',
  [SPENDING_CATEGORIES.BEVERAGES]: 'İçecekler',
  [SPENDING_CATEGORIES.SNACKS]: 'Atıştırmalıklar',
  [SPENDING_CATEGORIES.PERSONAL_CARE]: 'Kişisel Bakım',
  [SPENDING_CATEGORIES.CLEANING]: 'Temizlik',
  [SPENDING_CATEGORIES.OTHER]: 'Diğer',
} as const;

/**
 * Category color codes for consistent UI display
 */
export const CATEGORY_COLORS: Record<string, string> = {
  [SPENDING_CATEGORIES.GROCERIES]: '#FF6384',
  [SPENDING_CATEGORIES.HOUSEHOLD]: '#36A2EB',
  [SPENDING_CATEGORIES.BEVERAGES]: '#FFCE56',
  [SPENDING_CATEGORIES.SNACKS]: '#4BC0C0',
  [SPENDING_CATEGORIES.PERSONAL_CARE]: '#9966FF',
  [SPENDING_CATEGORIES.CLEANING]: '#FF9F40',
  [SPENDING_CATEGORIES.OTHER]: '#C9CBCF',
};

/**
 * Get display name for a category key
 */
export function getCategoryDisplayName(categoryKey: string): string {
  return CATEGORY_DISPLAY_NAMES[categoryKey as keyof typeof CATEGORY_DISPLAY_NAMES] || categoryKey;
}

/**
 * Get color code for a category key
 */
export function getCategoryColor(categoryKey: string): string {
  return CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS[SPENDING_CATEGORIES.OTHER];
}
