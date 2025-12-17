// Handles receipt OCR using Google ML Kit - extracts text from receipt images
import type { OCRResult } from '@/lib/types';
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import { TextParser } from './TextParser';

export class OCRService {
  private parser: TextParser;

  constructor() {
    this.parser = new TextParser();
  }

  async extractText(imagePath: string): Promise<OCRResult> {
    try {
      // 1. Perform OCR using ML Kit
      // We use Turkish script if available, or Latin (default)
      // The library auto-detects usually, but we can specify script
      const result = await TextRecognition.recognize(imagePath, TextRecognitionScript.LATIN);

      if (!result || !result.text) {
        throw new Error('OCR failed to extract text');
      }

      // 2. Parse the extracted text
      const parsedResult = this.parser.parse(result.text);

      return parsedResult;

    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }
}
