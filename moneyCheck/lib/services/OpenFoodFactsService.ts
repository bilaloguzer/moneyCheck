// Open Food Facts API Service
// https://world.openfoodfacts.org/api/v2/
// Free API for product information (no pricing, but great for standardization)

export interface OpenFoodFactsProduct {
  code: string; // Barcode
  product_name: string;
  product_name_tr?: string; // Turkish name
  brands: string;
  categories: string;
  categories_tags: string[];
  image_url?: string;
  image_front_url?: string;
  image_front_small_url?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
  quantity?: string;
}

export interface OpenFoodFactsResponse {
  code: string;
  product?: OpenFoodFactsProduct;
  status: number;
  status_verbose: string;
}

export class OpenFoodFactsService {
  private static BASE_URL = 'https://world.openfoodfacts.org/api/v2';
  
  /**
   * Get product by barcode
   */
  static async getProductByBarcode(barcode: string): Promise<{
    data: OpenFoodFactsProduct | null;
    error: any;
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/product/${barcode}.json`);
      const result: OpenFoodFactsResponse = await response.json();
      
      if (result.status === 1 && result.product) {
        return { data: result.product, error: null };
      }
      
      return { data: null, error: 'Product not found' };
    } catch (error) {
      console.error('Open Food Facts API error:', error);
      return { data: null, error };
    }
  }

  /**
   * Search products by name
   */
  static async searchProducts(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    data: OpenFoodFactsProduct[];
    error: any;
  }> {
    try {
      const url = `${this.BASE_URL}/search?search_terms=${encodeURIComponent(searchTerm)}&page=${page}&page_size=${pageSize}&fields=code,product_name,product_name_tr,brands,categories,image_url,quantity`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      return {
        data: result.products || [],
        error: null,
      };
    } catch (error) {
      console.error('Open Food Facts search error:', error);
      return { data: [], error };
    }
  }

  /**
   * Get standardized product name (prefers Turkish if available)
   */
  static getStandardizedName(product: OpenFoodFactsProduct): string {
    return product.product_name_tr || product.product_name || 'Unknown Product';
  }

  /**
   * Get product brand
   */
  static getBrand(product: OpenFoodFactsProduct): string {
    return product.brands || 'Unknown Brand';
  }

  /**
   * Get main category
   */
  static getMainCategory(product: OpenFoodFactsProduct): string {
    if (!product.categories_tags || product.categories_tags.length === 0) {
      return 'other';
    }
    
    const firstCategory = product.categories_tags[0];
    
    // Map Open Food Facts categories to our app categories
    const categoryMapping: Record<string, string> = {
      'en:beverages': 'beverages',
      'en:snacks': 'snacks',
      'en:groceries': 'groceries',
      'en:dairies': 'groceries',
      'en:fruits': 'groceries',
      'en:vegetables': 'groceries',
      'en:meats': 'groceries',
      'en:plant-based-foods': 'groceries',
      'en:sweets': 'snacks',
      'en:chocolate': 'snacks',
    };
    
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (firstCategory.includes(key)) {
        return value;
      }
    }
    
    return 'other';
  }

  /**
   * Enrich line item with Open Food Facts data
   */
  static async enrichLineItem(barcode?: string, productName?: string): Promise<{
    standardizedName?: string;
    brand?: string;
    category?: string;
    imageUrl?: string;
    quantity?: string;
  }> {
    // Try barcode first
    if (barcode) {
      const { data: product } = await this.getProductByBarcode(barcode);
      if (product) {
        return {
          standardizedName: this.getStandardizedName(product),
          brand: this.getBrand(product),
          category: this.getMainCategory(product),
          imageUrl: product.image_front_small_url || product.image_url,
          quantity: product.quantity,
        };
      }
    }
    
    // Fall back to name search
    if (productName) {
      const { data: products } = await this.searchProducts(productName, 1, 1);
      if (products && products.length > 0) {
        const product = products[0];
        return {
          standardizedName: this.getStandardizedName(product),
          brand: this.getBrand(product),
          category: this.getMainCategory(product),
          imageUrl: product.image_front_small_url || product.image_url,
          quantity: product.quantity,
        };
      }
    }
    
    return {};
  }
}

