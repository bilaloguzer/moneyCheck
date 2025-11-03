// Parses OCR text to extract merchant, date, total, and line items with confidence scores
import type { OCRResult } from '@/lib/types';

export class TextParser {
  parse(rawText: string): OCRResult {
    throw new Error('Not implemented');
  }
}
