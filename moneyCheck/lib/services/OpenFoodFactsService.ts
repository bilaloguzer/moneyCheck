import axios from 'axios';

const BASE_URL = 'https://world.openfoodfacts.org/api/v0';

export class OpenFoodFactsService {
  static async getProductByBarcode(barcode: string) {
    try {
      const response = await axios.get(`${BASE_URL}/product/${barcode}.json`);
      return response.data;
    } catch (error) {
      console.error('OpenFoodFacts barcode search error:', error);
      return { status: 0, product: null };
    }
  }

  static async searchProducts(query: string) {
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl`, {
        params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 5
        }
      });
      return response.data;
    } catch (error) {
      console.error('OpenFoodFacts search error:', error);
      return { products: [] };
    }
  }

  static getStandardizedName(product: any): string {
    return product?.product_name || product?.product_name_en || '';
  }

  static getBrand(product: any): string {
    return product?.brands || '';
  }

  static getMainCategory(product: any): string {
    // Basic category extraction
    const categories = product?.categories_tags || [];
    if (categories.length > 0) {
      return categories[0].replace('en:', '').replace(/-/g, ' ');
    }
    return '';
  }

  static async enrichLineItem(item: any, query: string) {
    // Basic enrichment via search
    try {
      const searchRes = await this.searchProducts(query);
      if (searchRes.products && searchRes.products.length > 0) {
        const product = searchRes.products[0];
        return {
          standardizedName: this.getStandardizedName(product),
          brand: this.getBrand(product),
          category: this.getMainCategory(product),
          imageUrl: product.image_front_small_url || product.image_url
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
