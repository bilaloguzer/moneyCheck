import { OCRService } from '../../lib/services/ocr/OCRService';
import TextRecognition from '@react-native-ml-kit/text-recognition';

// Mock the external library
jest.mock('@react-native-ml-kit/text-recognition', () => ({
  recognize: jest.fn(),
  TextRecognitionScript: { LATIN: 'LATIN' },
}));

describe('OCRService', () => {
  let service: OCRService;

  beforeEach(() => {
    service = new OCRService();
    jest.clearAllMocks();
  });

  it('should call ML Kit and parse result', async () => {
    const mockText = `
      MIGROS
      TARIH: 01.01.2024
      TOPLAM 50,00
    `;
    
    (TextRecognition.recognize as jest.Mock).mockResolvedValue({
      text: mockText,
      blocks: [],
    });

    const result = await service.extractText('file://test.jpg');

    expect(TextRecognition.recognize).toHaveBeenCalledWith('file://test.jpg', 'LATIN');
    expect(result.merchant.name).toBe('Migros');
    expect(result.total.value).toBe(50.00);
  });

  it('should throw error if OCR fails', async () => {
    (TextRecognition.recognize as jest.Mock).mockResolvedValue(null);

    await expect(service.extractText('path')).rejects.toThrow();
  });
});
