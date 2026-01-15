import { supabase } from '@/lib/supabase';

export class SupabaseReceiptService {
  /**
   * Get price comparison data for a product
   * Tries Edge Function first, then falls back to local/client-side calculation if needed (omitted for brevity here)
   */
  static async getPriceComparison(productName: string) {
    try {
      const { data, error } = await supabase.functions.invoke('price-comparison', {
        body: { productName: productName }
      });
      
      if (error) {
        console.warn('Edge function error, falling back?', error);
        // In a real recovery, we would implement the client-side fallback here
        // For now, returning null data so UI handles "no data" gracefully
        return { data: null, error };
      }
      return { data, error: null };
    } catch (error) {
      console.error('Price comparison error:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete all data for the current user
   */
  static async deleteAllData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('user_id', user.id);
        
      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getReceipts(limit = 20) {
    return await supabase
      .from('receipts')
      .select('*')
      .order('purchase_date', { ascending: false })
      .limit(limit);
  }

  static async getReceiptById(id: string) {
    return await supabase
      .from('receipts')
      .select('*, items:line_items(*)')
      .eq('id', id)
      .single();
  }
}
