// Compares user purchases against price database to identify savings opportunities
import type { PriceComparison, LineItem } from '@/lib/types';

export class PriceComparisonService {
  async compareReceipt(items: LineItem[], merchantId: string): Promise<PriceComparison[]> {
    throw new Error('Not implemented');
  }
}
