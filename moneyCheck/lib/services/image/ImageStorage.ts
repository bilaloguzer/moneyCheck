// Manages local storage of receipt images - save, retrieve, delete
import * as FileSystem from 'expo-file-system';

export class ImageStorage {
  private readonly itemsDirectory = `${FileSystem.documentDirectory}receipts/`;

  constructor() {
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists() {
    const dirInfo = await FileSystem.getInfoAsync(this.itemsDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.itemsDirectory, { intermediates: true });
    }
  }

  async save(imageUri: string, receiptId: string): Promise<string> {
    await this.ensureDirectoryExists();
    
    // Create a new filename based on receiptId
    // We assume JPEG for now as that's what ImageProcessor outputs
    const filename = `${receiptId}.jpg`;
    const destination = `${this.itemsDirectory}${filename}`;

    // Copy the file from cache/temp to permanent storage
    await FileSystem.copyAsync({
      from: imageUri,
      to: destination
    });

    return destination;
  }

  async get(receiptId: string): Promise<string> {
      const filename = `${receiptId}.jpg`;
      const path = `${this.itemsDirectory}${filename}`;
      
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) {
          throw new Error(`Image not found for receipt: ${receiptId}`);
      }
      
      return path;
  }

  async delete(receiptId: string): Promise<void> {
    const filename = `${receiptId}.jpg`;
    const path = `${this.itemsDirectory}${filename}`;
    
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) {
        await FileSystem.deleteAsync(path);
    }
  }
}
