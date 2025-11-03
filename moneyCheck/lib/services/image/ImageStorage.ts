// Manages local storage of receipt images - save, retrieve, delete

export class ImageStorage {
  async save(imagePath: string, receiptId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async get(receiptId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async delete(receiptId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
