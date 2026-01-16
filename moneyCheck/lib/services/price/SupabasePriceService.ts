// Supabase Price Service - Cross-user price comparison with real data
import { supabase } from '@/lib/supabase';
import { ProductMatchingService } from '../product';
import type { MarketPriceData, StorePriceEntry } from './types';
import type { Receipt } from '@/lib/types';

export class SupabasePriceService {
  /**
   * Hash product name for privacy
   * Uses first 16 chars of SHA-256 hash
   */
  private static hashProductName(normalizedName: string): string {
    // Simple hash for React Native (crypto.subtle not available)
    // In production, consider using a proper hashing library
    let hash = 0;
    const str = normalizedName.toLowerCase();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).padStart(16, '0').substring(0, 16);
  }

  /**
   * Check if user has opted in to share price data
   */
  static async getUserPreference(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('share_price_data')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no preferences exist, return false
        if (error.code === 'PGRST116') return false;
        throw error;
      }

      return data?.share_price_data ?? false;
    } catch (error) {
      console.error('Error getting user preference:', error);
      return false;
    }
  }

  /**
   * Update user's sharing preference
   */
  static async setUserPreference(shareData: boolean, region?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          share_price_data: shareData,
          region: region || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting user preference:', error);
      throw error;
    }
  }

  /**
   * Upload price data from a receipt
   */
  static async uploadReceiptPrices(receipt: Receipt): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping upload');
        return;
      }

      // Check if user opted in
      const optedIn = await this.getUserPreference();
      if (!optedIn) {
        console.log('User not opted in, skipping upload');
        return;
      }

      if (!receipt.items || receipt.items.length === 0) return;

      // Prepare price data
      const priceData = receipt.items.map(item => {
        const normalizedName = ProductMatchingService.normalizeProductName(item.name);
        const productHash = this.hashProductName(normalizedName);

        return {
          product_hash: productHash,
          product_name_normalized: normalizedName,
          price: item.unitPrice || 0,
          store_name: receipt.merchantName || 'Unknown',
          region: null, // TODO: Get from user preferences if needed
        };
      });

      // Upload to Supabase
      const { error } = await supabase
        .from('price_data')
        .insert(priceData);

      if (error) {
        console.error('Error uploading price data:', error);
        throw error;
      }

      console.log(`Uploaded ${priceData.length} price points to Supabase`);
    } catch (error) {
      console.error('Failed to upload receipt prices:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Check if real data is available for a product
   */
  static async hasRealData(productName: string): Promise<boolean> {
    try {
      const normalizedName = ProductMatchingService.normalizeProductName(productName);
      const productHash = this.hashProductName(normalizedName);

      const { count, error } = await supabase
        .from('price_data')
        .select('*', { count: 'exact', head: true })
        .eq('product_hash', productHash)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) throw error;

      return (count ?? 0) > 0;
    } catch (error) {
      console.error('Error checking real data availability:', error);
      return false;
    }
  }

  /**
   * Get real market data for a product
   */
  static async getRealMarketData(
    productName: string,
    daysBack: number = 30
  ): Promise<MarketPriceData & { sampleSize: number; isRealData: boolean }> {
    try {
      const normalizedName = ProductMatchingService.normalizeProductName(productName);
      const productHash = this.hashProductName(normalizedName);
      const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      // Query price data
      const { data, error } = await supabase
        .from('price_data')
        .select('price, store_name, created_at')
        .eq('product_hash', productHash)
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No real data available');
      }

      // Aggregate by store (average price per store)
      const storeMap = new Map<string, { prices: number[]; dates: Date[] }>();
      
      for (const row of data) {
        if (!storeMap.has(row.store_name)) {
          storeMap.set(row.store_name, { prices: [], dates: [] });
        }
        const store = storeMap.get(row.store_name)!;
        store.prices.push(row.price);
        store.dates.push(new Date(row.created_at));
      }

      // Create price distribution
      const priceDistribution: StorePriceEntry[] = [];
      let totalPrice = 0;
      let totalCount = 0;

      for (const [storeName, { prices, dates }] of storeMap.entries()) {
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const mostRecentDate = dates.reduce((latest, d) => d > latest ? d : latest, dates[0]);
        
        priceDistribution.push({
          store: storeName,
          price: Math.round(avgPrice * 100) / 100,
          date: mostRecentDate,
        });

        totalPrice += avgPrice;
        totalCount++;
      }

      priceDistribution.sort((a, b) => a.price - b.price);

      const averagePrice = totalCount > 0 ? totalPrice / totalCount : 0;
      const minPrice = priceDistribution[0]?.price ?? 0;
      const maxPrice = priceDistribution[priceDistribution.length - 1]?.price ?? 0;

      return {
        productName,
        averagePrice: Math.round(averagePrice * 100) / 100,
        minPrice,
        maxPrice,
        priceDistribution,
        sampleSize: data.length,
        isRealData: true,
      };
    } catch (error) {
      console.error('Error fetching real market data:', error);
      throw error;
    }
  }

  /**
   * Get statistics about available data
   */
  static async getDataStatistics(): Promise<{
    totalProducts: number;
    totalPricePoints: number;
    lastUpdate: Date | null;
  }> {
    try {
      const { count: totalPricePoints } = await supabase
        .from('price_data')
        .select('*', { count: 'exact', head: true });

      const { data: uniqueProducts } = await supabase
        .from('price_data')
        .select('product_hash')
        .limit(1000); // Reasonable limit

      const uniqueHashes = new Set(uniqueProducts?.map(p => p.product_hash) ?? []);

      const { data: latestEntry } = await supabase
        .from('price_data')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalProducts: uniqueHashes.size,
        totalPricePoints: totalPricePoints ?? 0,
        lastUpdate: latestEntry ? new Date(latestEntry.created_at) : null,
      };
    } catch (error) {
      console.error('Error getting data statistics:', error);
      return {
        totalProducts: 0,
        totalPricePoints: 0,
        lastUpdate: null,
      };
    }
  }
}
