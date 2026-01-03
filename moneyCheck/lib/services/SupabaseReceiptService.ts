import { supabase } from '@/lib/supabase';
import { Receipt, LineItem } from '@/lib/types/receipt.types';

export class SupabaseReceiptService {
  /**
   * Create a new receipt with line items
   */
  static async createReceipt(
    receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>,
    items: Omit<LineItem, 'id' | 'receiptId'>[]
  ): Promise<{ data: Receipt | null; error: any }> {
    try {
      // Insert receipt
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          merchant_name: receipt.merchantName,
          purchase_date: receipt.date,
          total_amount: receipt.totalAmount,
          image_uri: receipt.imageUri,
          status: receipt.status,
        })
        .select()
        .single();

      if (receiptError) {
        return { data: null, error: receiptError };
      }

      // Insert line items
      const lineItemsData = items.map((item) => ({
        receipt_id: receiptData.id,
        name: item.name,
        clean_name: item.cleanName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        line_total: item.lineTotal,
        discount: item.discount || 0,
        confidence: item.confidence,
      }));

      const { error: itemsError } = await supabase.from('line_items').insert(lineItemsData);

      if (itemsError) {
        // Rollback receipt if items fail
        await supabase.from('receipts').delete().eq('id', receiptData.id);
        return { data: null, error: itemsError };
      }

      return {
        data: {
          id: receiptData.id,
          merchantName: receiptData.merchant_name,
          date: receiptData.purchase_date,
          totalAmount: receiptData.total_amount,
          imageUri: receiptData.image_uri,
          status: receiptData.status,
          createdAt: receiptData.created_at,
          updatedAt: receiptData.updated_at,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Fetch all receipts for the current user
   */
  static async getReceipts(
    limit = 50,
    offset = 0
  ): Promise<{ data: Receipt[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('purchase_date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { data: null, error };
      }

      const receipts = data.map((row) => ({
        id: row.id,
        merchantName: row.merchant_name,
        date: row.purchase_date,
        totalAmount: row.total_amount,
        imageUri: row.image_uri,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { data: receipts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Fetch a single receipt by ID with line items
   */
  static async getReceiptById(
    id: string
  ): Promise<{ data: (Receipt & { items: LineItem[] }) | null; error: any }> {
    try {
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .select('*, line_items(*)')
        .eq('id', id)
        .single();

      if (receiptError) {
        return { data: null, error: receiptError };
      }

      const receipt: Receipt & { items: LineItem[] } = {
        id: receiptData.id,
        merchantName: receiptData.merchant_name,
        date: receiptData.purchase_date,
        totalAmount: receiptData.total_amount,
        imageUri: receiptData.image_uri,
        status: receiptData.status,
        createdAt: receiptData.created_at,
        updatedAt: receiptData.updated_at,
        items: receiptData.line_items.map((item: any) => ({
          id: item.id,
          receiptId: item.receipt_id,
          name: item.name,
          cleanName: item.clean_name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unit_price,
          lineTotal: item.line_total,
          discount: item.discount,
          confidence: item.confidence,
        })),
      };

      return { data: receipt, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete a receipt and its line items
   */
  static async deleteReceipt(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.from('receipts').delete().eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get spending analytics for a time range
   */
  static async getSpendingAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    data: {
      totalSpent: number;
      receiptCount: number;
      categoryBreakdown: { category: string; value: number; color: string }[];
      dailySpending: { value: number; label: string }[];
      topItems: { name: string; count: number; totalSpent: number }[];
    } | null;
    error: any;
  }> {
    try {
      let query = supabase.from('receipts').select('total_amount, purchase_date, line_items(*)');

      if (startDate) {
        query = query.gte('purchase_date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('purchase_date', endDate.toISOString());
      }

      const { data: receipts, error } = await query;

      if (error) {
        return { data: null, error };
      }

      // Calculate total spent and receipt count
      const totalSpent = receipts.reduce((sum, r) => sum + r.total_amount, 0);
      const receiptCount = receipts.length;

      // Category breakdown
      const categoryMap = new Map<string, number>();
      receipts.forEach((receipt) => {
        receipt.line_items.forEach((item: any) => {
          const category = item.category || 'other';
          categoryMap.set(category, (categoryMap.get(category) || 0) + item.line_total);
        });
      });

      const categoryColors: Record<string, string> = {
        groceries: '#FF6B6B',
        household: '#4ECDC4',
        beverages: '#45B7D1',
        snacks: '#FFA07A',
        personal_care: '#98D8C8',
        cleaning: '#F7DC6F',
        other: '#B19CD9',
      };

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, value]) => ({
        category,
        value: parseFloat(value.toFixed(2)),
        color: categoryColors[category] || '#B19CD9',
      }));

      // Daily spending (group by date)
      const dailyMap = new Map<string, number>();
      receipts.forEach((receipt) => {
        const date = new Date(receipt.purchase_date).toISOString().split('T')[0];
        dailyMap.set(date, (dailyMap.get(date) || 0) + receipt.total_amount);
      });

      const dailySpending = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({
          label: label.substring(5), // MM-DD
          value: parseFloat(value.toFixed(2)),
        }));

      // Top items by total spent
      const itemMap = new Map<string, { count: number; totalSpent: number }>();
      receipts.forEach((receipt) => {
        receipt.line_items.forEach((item: any) => {
          const existing = itemMap.get(item.clean_name) || { count: 0, totalSpent: 0 };
          itemMap.set(item.clean_name, {
            count: existing.count + 1,
            totalSpent: existing.totalSpent + item.line_total,
          });
        });
      });

      const topItems = Array.from(itemMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      return {
        data: {
          totalSpent,
          receiptCount,
          categoryBreakdown,
          dailySpending,
          topItems,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get price comparison for a product
   */
  static async getPriceComparison(
    productName: string,
    merchantId?: string
  ): Promise<{
    data: {
      productName: string;
      averagePrice: number;
      minPrice: number;
      maxPrice: number;
      currentPrice?: number;
      priceHistory: { merchant: string; price: number; date: string }[];
      recommendations: string[];
    } | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('price-comparison', {
        body: { productName, merchantId },
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

