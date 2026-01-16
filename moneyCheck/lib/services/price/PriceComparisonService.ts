// Price Comparison Service - Compare prices with mock market data
import type { MarketPriceData, PriceComparison, StorePriceEntry } from './types';

export class PriceComparisonService {
  /**
   * Common Turkish grocery stores
   */
  private static readonly STORES = [
    { name: 'Şok', priceRange: [0.85, 0.95] },      // Budget
    { name: 'A101', priceRange: [0.88, 0.97] },     // Budget
    { name: 'BIM', priceRange: [0.90, 1.00] },      // Budget
    { name: 'Migros', priceRange: [0.95, 1.05] },   // Regular
    { name: 'Carrefour', priceRange: [0.97, 1.07] },// Regular
    { name: 'Macro', priceRange: [1.05, 1.15] },    // Premium
    { name: 'File', priceRange: [1.00, 1.10] },     // Regular
    { name: 'Kipa', priceRange: [0.98, 1.08] },     // Regular
  ];

  /**
   * Generate realistic mock market data based on current price
   */
  static generateMockMarketData(
    productName: string,
    basePrice: number,
    excludeStore?: string
  ): MarketPriceData {
    const priceDistribution: StorePriceEntry[] = [];
    const now = new Date();

    for (const store of this.STORES) {
      // Skip the user's current store to avoid duplication
      if (store.name === excludeStore) continue;

      // Generate price within store's typical range
      const [minRange, maxRange] = store.priceRange;
      const randomFactor = minRange + Math.random() * (maxRange - minRange);
      const storePrice = Math.round(basePrice * randomFactor * 100) / 100;

      // Add some time variance (prices from last 1-7 days)
      const daysAgo = Math.floor(Math.random() * 7) + 1;
      const priceDate = new Date(now);
      priceDate.setDate(priceDate.getDate() - daysAgo);

      priceDistribution.push({
        store: store.name,
        price: storePrice,
        date: priceDate,
      });
    }

    // Calculate statistics
    const prices = priceDistribution.map(p => p.price);
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return {
      productName,
      averagePrice: Math.round(averagePrice * 100) / 100,
      minPrice,
      maxPrice,
      priceDistribution: priceDistribution.sort((a, b) => a.price - b.price),
    };
  }

  /**
   * Compare user's price with market data
   */
  static compareWithMarket(
    productName: string,
    userPrice: number,
    userStore: string
  ): PriceComparison {
    const marketData = this.generateMockMarketData(productName, userPrice, userStore);

    const difference = userPrice - marketData.averagePrice;
    const percentDifference = (difference / marketData.averagePrice) * 100;

    // Determine rank
    let rank: 'excellent' | 'good' | 'average' | 'high' | 'very-high';
    const percentile = this.calculatePercentile(userPrice, [
      ...marketData.priceDistribution.map(p => p.price),
      userPrice
    ]);

    if (percentile <= 20) rank = 'excellent';
    else if (percentile <= 40) rank = 'good';
    else if (percentile <= 60) rank = 'average';
    else if (percentile <= 80) rank = 'high';
    else rank = 'very-high';

    const cheapest = marketData.priceDistribution[0];
    const mostExpensive = marketData.priceDistribution[marketData.priceDistribution.length - 1];
    const savingsOpportunity = Math.max(0, userPrice - cheapest.price);

    return {
      userPrice,
      userStore,
      marketAverage: marketData.averagePrice,
      difference: Math.round(difference * 100) / 100,
      percentDifference: Math.round(percentDifference * 10) / 10,
      rank,
      savingsOpportunity: Math.round(savingsOpportunity * 100) / 100,
      cheapestStore: cheapest.store,
      cheapestPrice: cheapest.price,
      mostExpensiveStore: mostExpensive.store,
      mostExpensivePrice: mostExpensive.price,
    };
  }

  /**
   * Calculate percentile of a value in a dataset
   */
  private static calculatePercentile(value: number, dataset: number[]): number {
    const sorted = [...dataset].sort((a, b) => a - b);
    const index = sorted.findIndex(v => v >= value);
    if (index === -1) return 100;
    return Math.round((index / sorted.length) * 100);
  }

  /**
   * Get full market comparison with price distribution
   */
  static getFullMarketComparison(
    productName: string,
    userPrice: number,
    userStore: string
  ): {
    comparison: PriceComparison;
    marketData: MarketPriceData;
    allPrices: (StorePriceEntry & { isUserPrice?: boolean })[];
  } {
    const comparison = this.compareWithMarket(productName, userPrice, userStore);
    const marketData = this.generateMockMarketData(productName, userPrice, userStore);

    // Combine market prices with user's price
    const allPrices = [
      ...marketData.priceDistribution,
      {
        store: userStore,
        price: userPrice,
        date: new Date(),
        isUserPrice: true,
      }
    ].sort((a, b) => a.price - b.price);

    return {
      comparison,
      marketData,
      allPrices,
    };
  }

  /**
   * Get rank color
   */
  static getRankColor(rank: PriceComparison['rank']): string {
    switch (rank) {
      case 'excellent': return '#2C9364'; // Green
      case 'good': return '#82C43C';      // Light green
      case 'average': return '#FFB020';   // Yellow
      case 'high': return '#FF6B35';      // Orange
      case 'very-high': return '#E03E3E'; // Red
    }
  }

  /**
   * Get rank label
   */
  static getRankLabel(rank: PriceComparison['rank']): string {
    switch (rank) {
      case 'excellent': return 'Excellent Price';
      case 'good': return 'Good Price';
      case 'average': return 'Average Price';
      case 'high': return 'Above Average';
      case 'very-high': return 'High Price';
    }
  }

  /**
   * Get savings message
   */
  static getSavingsMessage(savingsOpportunity: number): string {
    if (savingsOpportunity === 0) {
      return 'You got the best price!';
    } else if (savingsOpportunity < 2) {
      return `Save ${savingsOpportunity.toFixed(2)} ₺ at the cheapest store`;
    } else {
      return `You could save ${savingsOpportunity.toFixed(2)} ₺`;
    }
  }
}
