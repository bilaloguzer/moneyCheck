import { ImageStorage } from '../../lib/services/image/ImageStorage';
import * as FileSystem from 'expo-file-system';

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///data/user/0/com.moneycheck/files/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('ImageStorage', () => {
  let storage: ImageStorage;
  const mockReceiptId = 'receipt-123';
  const mockImageUri = 'file:///tmp/image.jpg';
  const expectedPath = `file:///data/user/0/com.moneycheck/files/receipts/${mockReceiptId}.jpg`;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to existing directory to avoid constructor errors or extra calls
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
    storage = new ImageStorage();
  });

  describe('save', () => {
    it('should create directory if it does not exist', async () => {
      // Setup for this specific test
      // First call (constructor) returns exists: true (from beforeEach), 
      // but we want to test the explicit call inside save()
      // ensureDirectoryExists is called in constructor AND save.
      // We can't easily change the constructor call result since it already happened.
      // But we can verify the call inside save().
      
      // Let's reset the mock behavior for the call inside save()
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      
      await storage.save(mockImageUri, mockReceiptId);

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        expect.stringContaining('receipts/'),
        { intermediates: true }
      );
    });

    it('should not create directory if it exists', async () => {
        (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
        
        await storage.save(mockImageUri, mockReceiptId);
  
        expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
      });

    it('should copy file to persistent storage', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      
      const result = await storage.save(mockImageUri, mockReceiptId);

      expect(FileSystem.copyAsync).toHaveBeenCalledWith({
        from: mockImageUri,
        to: expectedPath
      });
      expect(result).toBe(expectedPath);
    });
  });

  describe('get', () => {
    it('should return path if file exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

      const result = await storage.get(mockReceiptId);

      expect(result).toBe(expectedPath);
    });

    it('should throw error if file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      await expect(storage.get(mockReceiptId)).rejects.toThrow(`Image not found for receipt: ${mockReceiptId}`);
    });
  });

  describe('delete', () => {
    it('should delete file if it exists', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

      await storage.delete(mockReceiptId);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(expectedPath);
    });

    it('should do nothing if file does not exist', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      await storage.delete(mockReceiptId);

      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
