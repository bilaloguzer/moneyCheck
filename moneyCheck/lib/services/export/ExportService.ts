// Exports receipt data to CSV format for external analysis
import type { Receipt } from '@/lib/types';

export class ExportService {
  async exportToCSV(receipts: Receipt[]): Promise<string> {
    throw new Error('Not implemented');
  }
}
