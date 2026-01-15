import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SupabaseReceiptService } from '../SupabaseReceiptService';

export class ExportService {
  /**
   * Export all user data to a CSV file and open share sheet
   */
  static async exportToCSV(): Promise<{ error?: any }> {
    try {
      // 1. Fetch all data
      const { data: receipts, error } = await SupabaseReceiptService.getReceipts(1000); // Fetch up to 1000 receipts
      if (error) throw error;
      if (!receipts || receipts.length === 0) throw new Error('No data to export');

      // 2. We need line items too, but getReceipts only returns summary.
      // We'll fetch full details for each receipt. 
      // Optimization: In a real app we'd make a dedicated RPC call for this dump.
      // For now, we'll iterate (might be slow for huge data, but fine for personal use).
      // Actually, let's just make a new method in SupabaseReceiptService or query directly here if possible.
      // But to keep it simple and clean, let's fetch details for the most recent 50, 
      // or ideally modify getReceipts to support 'all' with LineItems.
      // 
      // users can export summary is useful, but line items are better.
      // Let's rely on getReceipts for now and maybe just export summary + basic details if we can't get deep.
      
      // Better approach: Let's fetch everything efficiently.
      // Since we don't have a "getAllReceiptsWithItems" method ready and easy access to supabase client here...
      // wait, we can just use the supabase client directly if we import it, OR add a method to generic service.
      // Let's assume we just export Receipt properties for now to be safe, 
      // OR we can try to fetch items for the CSV rows.
      
      // Let's try to export Receipt Summary + Items flattened.
      // I'll define the headers.
      const headers = [
        'Date',
        'Merchant',
        'Total Amount',
        'Status',
        'Item Name',
        'Category',
        'Quantity',
        'Unit Price',
        'Line Total',
        'Receipt ID'
      ].join(',');

      const rows: string[] = [];
      rows.push(headers);

      // Warning: N+1 problem here if we loop.
      // Let's use SupabaseReceiptService.getReceiptById in a loop for now, 
      // limiting to recent 100 to avoid timeout, or just do a raw export if possible.
      // 
      // Actually, I'll update the loop to be safe.
      
      for (const receipt of receipts) {
        // Fetch details (including items)
        const { data: detailedReceipt } = await SupabaseReceiptService.getReceiptById(receipt.id);
        
        if (detailedReceipt && detailedReceipt.items && detailedReceipt.items.length > 0) {
          for (const item of detailedReceipt.items) {
             const row = [
               `"${detailedReceipt.date}"`,
               `"${detailedReceipt.merchantName?.replace(/"/g, '""') || ''}"`,
               detailedReceipt.totalAmount,
               detailedReceipt.status,
               `"${item.name?.replace(/"/g, '""') || ''}"`,
               item.category,
               item.quantity,
               item.unitPrice,
               item.lineTotal,
               detailedReceipt.id
             ].join(',');
             rows.push(row);
          }
        } else {
          // Receipt with no items (or failed detail fetch)
          const row = [
            `"${receipt.date}"`,
            `"${receipt.merchantName?.replace(/"/g, '""') || ''}"`,
            receipt.totalAmount,
            receipt.status,
            '', '', '', '', '', // Empty item fields
            receipt.id
          ].join(',');
          rows.push(row);
        }
      }

      const csvContent = rows.join('\n');

      // 3. Write to file
      const filename = `moneycheck_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // 4. Share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error('Sharing not available on this device');
      }

      return {};
    } catch (error) {
      console.error('Export error:', error);
      return { error };
    }
  }
}

