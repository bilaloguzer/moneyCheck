import { OCRService } from '../../lib/services/ocr/OCRService';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';

jest.mock('axios');
jest.mock('expo-file-system');

describe('OCRService', () => {
  let service: OCRService;

  beforeEach(() => {
    service = new OCRService();
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
  });

  it('should call OpenAI API and parse result', async () => {
    const mockResponseData = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              merchant: { name: 'Migros', confidence: 0.9 },
              date: { value: '2024-01-01', confidence: 0.9 },
              total: { value: 50.00, confidence: 0.9 },
              items: []
            })
          }
        }
      ]
    };

    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64image');
    (axios.post as jest.Mock).mockResolvedValue({ data: mockResponseData });

    const result = await service.extractText('file://test.jpg');

    expect(axios.post).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.arrayContaining([
              expect.objectContaining({
                image_url: { url: 'data:image/jpeg;base64,base64image' }
              })
            ])
          })
        ])
      }),
      expect.any(Object)
    );

    expect(result.merchant.name).toBe('Migros');
    expect(result.total.value).toBe(50.00);
  });

  it('should throw error if API call fails', async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64image');
    (axios.post as jest.Mock).mockRejectedValue(new Error('API Error'));

    await expect(service.extractText('path')).rejects.toThrow('API Error');
  });
});
