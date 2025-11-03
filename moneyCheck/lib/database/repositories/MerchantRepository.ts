// Repository for merchant data access and search
import type { Merchant } from '@/lib/types';

export class MerchantRepository {
  async findById(id: string): Promise<Merchant | null> {
    throw new Error('Not implemented');
  }

  async findByName(name: string): Promise<Merchant | null> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<Merchant[]> {
    throw new Error('Not implemented');
  }

  async search(query: string): Promise<Merchant[]> {
    throw new Error('Not implemented');
  }
}
