// Handles receipt OCR using Google ML Kit - extracts text from receipt images
import type { OCRResult } from '@/lib/types';

export class OCRService {
  async extractText(imagePath: string): Promise<OCRResult> {
    throw new Error('Not implemented');
  }
}
