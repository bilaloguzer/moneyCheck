/**
 * Department and Category Colors
 * Color constants for the 4-level category system
 */

export const DEPARTMENT_COLORS = {
  FOOD_BEVERAGE: '#2E7D32',
  HOUSEHOLD_CLEANING: '#0288D1',
  PERSONAL_CARE: '#AB47BC',
  HEALTH_PHARMACY: '#E91E63',
  ELECTRONICS: '#2196F3',
  CLOTHING_FASHION: '#FF6F61',
  HOME_LIVING: '#795548',
  TRANSPORTATION: '#FF5722',
  ENTERTAINMENT: '#9C27B0',
  SPORTS: '#009688',
  EDUCATION: '#3F51B5',
  SERVICES: '#607D8B',
  PETS: '#8BC34A',
  MISCELLANEOUS: '#FFC107',
} as const;

export const DEPARTMENT_ICONS = {
  1: '🍎', // Food & Beverage
  2: '🧹', // Household & Cleaning
  3: '💄', // Personal Care & Beauty
  4: '💊', // Health & Pharmacy
  5: '📱', // Electronics & Technology
  6: '👕', // Clothing & Fashion
  7: '🏠', // Home & Living
  8: '🚗', // Transportation & Fuel
  9: '🎮', // Entertainment & Media
  10: '⚽', // Sports & Outdoors
  11: '📚', // Education & Stationery
  12: '🛠️', // Services
  13: '🐾', // Pets
  14: '📦', // Miscellaneous
} as const;

/**
 * Map department ID to color
 */
const DEPARTMENT_COLOR_MAP: Record<number, string> = {
  1: DEPARTMENT_COLORS.FOOD_BEVERAGE,
  2: DEPARTMENT_COLORS.HOUSEHOLD_CLEANING,
  3: DEPARTMENT_COLORS.PERSONAL_CARE,
  4: DEPARTMENT_COLORS.HEALTH_PHARMACY,
  5: DEPARTMENT_COLORS.ELECTRONICS,
  6: DEPARTMENT_COLORS.CLOTHING_FASHION,
  7: DEPARTMENT_COLORS.HOME_LIVING,
  8: DEPARTMENT_COLORS.TRANSPORTATION,
  9: DEPARTMENT_COLORS.ENTERTAINMENT,
  10: DEPARTMENT_COLORS.SPORTS,
  11: DEPARTMENT_COLORS.EDUCATION,
  12: DEPARTMENT_COLORS.SERVICES,
  13: DEPARTMENT_COLORS.PETS,
  14: DEPARTMENT_COLORS.MISCELLANEOUS,
};

/**
 * Get department color by ID
 * @param departmentId Department ID (1-14)
 * @returns Hex color code or default gray
 */
export function getDepartmentColor(departmentId: number): string {
  return DEPARTMENT_COLOR_MAP[departmentId] || '#9E9E9E';
}

/**
 * Get department icon by ID
 * @param departmentId Department ID (1-14)
 * @returns Emoji icon or default box
 */
export function getDepartmentIcon(departmentId: number): string {
  return DEPARTMENT_ICONS[departmentId as keyof typeof DEPARTMENT_ICONS] || '📦';
}

/**
 * Validate if a string is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Get color with opacity
 * @param color Hex color code (e.g., '#2E7D32')
 * @param opacity Opacity value 0-1 (e.g., 0.1 for 10%)
 * @returns Hex color with opacity (e.g., '#2E7D3210' for 10% opacity)
 */
export function getColorWithOpacity(color: string, opacity: number): string {
  if (!isValidHexColor(color)) {
    return color;
  }
  
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  
  return `${color}${opacityHex}`;
}

/**
 * Category color palette mapping (category_id → color)
 * This is a comprehensive map for quick lookups
 */
export const CATEGORY_COLOR_MAP: Record<number, string> = {
  // Department 1: Food & Beverage
  101: '#4CAF50', // Fruits & Vegetables
  102: '#8BC34A', // Dairy
  103: '#1B5E20', // Meat & Seafood
  104: '#CDC092', // Bakery
  105: '#7CB342', // Pantry Staples
  106: '#00C853', // Snacks
  107: '#66BB6A', // Beverages
  108: '#69F0AE', // Frozen Foods
  109: '#558B2F', // Breakfast Items
  
  // Department 2: Household & Cleaning
  201: '#03A9F4', // Laundry
  202: '#0277BD', // Kitchen Cleaning
  203: '#01579B', // Bathroom Cleaning
  204: '#0097A7', // General Cleaning
  205: '#006064', // Paper Products
  
  // Department 3: Personal Care & Beauty
  301: '#BA68C8', // Hygiene
  302: '#9C27B0', // Hair Care
  303: '#8E24AA', // Skin Care
  304: '#6A1B9A', // Makeup
  305: '#4A148C', // Shaving
  306: '#D500F9', // Feminine Hygiene
  
  // Department 4: Health & Pharmacy
  401: '#EC407A', // Medicine & Vitamins
  402: '#C2185B', // First Aid
  403: '#880E4F', // Mother & Baby Health
  404: '#AD1457', // Medical Devices
  
  // Department 5: Electronics & Technology
  501: '#42A5F5', // Phones & Tablets
  502: '#1976D2', // Computers
  503: '#0D47A1', // Audio & Video
  504: '#01579B', // Photography & Camera
  505: '#0091EA', // Gaming Consoles
  
  // Department 6: Clothing & Fashion
  601: '#FF8A80', // Women's Clothing
  602: '#FF5252', // Men's Clothing
  603: '#F44336', // Kids' Clothing
  604: '#D32F2F', // Shoes
  605: '#C62828', // Accessories
  606: '#B71C1C', // Underwear
  
  // Department 7: Home & Living
  701: '#8D6E63', // Furniture
  702: '#6D4C41', // Home Textiles
  703: '#5D4037', // Kitchenware
  704: '#4E342E', // Home Appliances
  705: '#3E2723', // Decoration
  
  // Department 8: Transportation & Fuel
  801: '#FF6F43', // Fuel
  802: '#F4511E', // Public Transport
  803: '#E64A19', // Parking & Tolls
  804: '#D84315', // Vehicle Maintenance
  
  // Department 9: Entertainment & Media
  901: '#AB47BC', // Digital Content
  902: '#8E24AA', // Books & Magazines
  903: '#7B1FA2', // Cinema & Theater
  904: '#6A1B9A', // Hobbies
  
  // Department 10: Sports & Outdoors
  1001: '#26A69A', // Sportswear
  1002: '#00897B', // Sports Equipment
  1003: '#00796B', // Gyms
  
  // Department 11: Education & Stationery
  1101: '#5C6BC0', // Stationery
  1102: '#303F9F', // School Supplies
  1103: '#283593', // Educational Services
  
  // Department 12: Services
  1201: '#78909C', // Utilities
  1202: '#546E7A', // Professional Services
  1203: '#455A64', // Home Services
  1204: '#37474F', // Beauty & Care
  
  // Department 13: Pets
  1301: '#9CCC65', // Cats
  1302: '#7CB342', // Dogs
  1303: '#689F38', // Birds & Others
  1304: '#558B2F', // Veterinary
  
  // Department 14: Miscellaneous
  1401: '#FFD54F', // Donations & Charity
  1402: '#FFB300', // Gifts
  1403: '#FFA000', // Tobacco
  1404: '#FF8F00', // Uncategorized
};

/**
 * Get category color by ID
 * @param categoryId Category ID
 * @returns Hex color code or default gray
 */
export function getCategoryColor(categoryId: number): string {
  return CATEGORY_COLOR_MAP[categoryId] || '#9E9E9E';
}

/**
 * Get subcategory color by ID
 * Falls back to parent category color if not specifically defined
 * @param subcategoryId Subcategory ID
 * @param categoryId Parent category ID (for fallback)
 * @returns Hex color code
 */
export function getSubcategoryColor(
  subcategoryId: number,
  categoryId?: number
): string {
  // Subcategories inherit category colors by default
  // You can extend this with specific subcategory colors if needed
  if (categoryId) {
    return getCategoryColor(categoryId);
  }
  return '#9E9E9E';
}
