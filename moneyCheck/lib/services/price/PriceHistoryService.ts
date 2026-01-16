// Price History Service - Track user's historical prices for products
import * as SQLite from 'expo-sqlite';
import type { PriceHistoryEntry, PriceTrend, PriceStats } from './types';
import { ProductMatchingService } from '../product';

export class PriceHistoryService {
  /**
   * Get user's purchase history for a product (with fuzzy matching)
   */
  static async getUserPriceHistory(
    db: SQLite.SQLiteDatabase,
    productName: string,
    limit: number = 20
  ): Promise<PriceHistoryEntry[]> {
    // Get all line items with similar names
    const allItems = await db.getAllAsync<any>(
      `SELECT 
        li.id as line_item_id,
        li.name as product_name,
        li.unit_price as price,
        r.store_name as store,
        r.purchase_date as date,
        r.id as receipt_id
      FROM line_items li
      JOIN receipts r ON li.receipt_id = r.id
      ORDER BY r.purchase_date DESC
      LIMIT 100`
    );

    // Filter by similarity
    const matches = ProductMatchingService.findSimilarProducts(
      productName,
      allItems.map(item => ({ name: item.product_name, id: item.line_item_id })),
      0.65 // Lower threshold for price history (more inclusive)
    );

    const matchingIds = new Set(matches.map(m => m.lineItemId));
    
    const history = allItems
      .filter(item => matchingIds.has(item.line_item_id))
      .slice(0, limit)
      .map(item => ({
        price: item.price,
        store: item.store || 'Unknown Store',
        date: new Date(item.date),
        receiptId: item.receipt_id,
        lineItemId: item.line_item_id,
      }));

    return history;
  }

  /**
   * Get the best (lowest) price user has paid for a product
   */
  static async getBestPrice(
    db: SQLite.SQLiteDatabase,
    productName: string
  ): Promise<PriceHistoryEntry | null> {
    const history = await this.getUserPriceHistory(db, productName, 100);
    
    if (history.length === 0) return null;

    return history.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  }

  /**
   * Get the worst (highest) price user has paid for a product
   */
  static async getWorstPrice(
    db: SQLite.SQLiteDatabase,
    productName: string
  ): Promise<PriceHistoryEntry | null> {
    const history = await this.getUserPriceHistory(db, productName, 100);
    
    if (history.length === 0) return null;

    return history.reduce((worst, current) => 
      current.price > worst.price ? current : worst
    );
  }

  /**
   * Calculate price trend (comparing last 2 purchases)
   */
  static async getPriceTrend(
    db: SQLite.SQLiteDatabase,
    productName: string
  ): Promise<PriceTrend | null> {
    const history = await this.getUserPriceHistory(db, productName, 10);
    
    if (history.length < 2) return null;

    const lastPrice = history[0].price;
    const previousPrice = history[1].price;
    const changePercent = ((lastPrice - previousPrice) / previousPrice) * 100;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 2) { // More than 2% change
      direction = changePercent > 0 ? 'up' : 'down';
    }

    return {
      direction,
      changePercent,
      lastPrice,
      previousPrice,
    };
  }

  /**
   * Get price statistics for a product
   */
  static async getPriceStatistics(
    db: SQLite.SQLiteDatabase,
    productName: string
  ): Promise<PriceStats | null> {
    const history = await this.getUserPriceHistory(db, productName, 100);
    
    if (history.length === 0) return null;

    const prices = history.map(h => h.price).sort((a, b) => a - b);
    
    const min = prices[0];
    const max = prices[prices.length - 1];
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const average = sum / prices.length;
    
    // Calculate median
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];

    return {
      min,
      max,
      average,
      median,
      count: prices.length,
    };
  }

  /**
   * Get recent price history for charting (last N purchases)
   */
  static async getRecentPriceHistory(
    db: SQLite.SQLiteDatabase,
    productName: string,
    limit: number = 10
  ): Promise<{ date: string; price: number; store: string }[]> {
    const history = await this.getUserPriceHistory(db, productName, limit);
    
    return history
      .reverse() // Oldest first for chart
      .map(h => ({
        date: h.date.toISOString().split('T')[0],
        price: h.price,
        store: h.store,
      }));
  }
}
