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
