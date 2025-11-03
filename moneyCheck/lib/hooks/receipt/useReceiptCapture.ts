// Hook for capturing and processing receipt images - orchestrates camera, OCR, parsing
import { useState, useCallback } from 'react';
import type { OCRResult } from '@/lib/types';

export function useReceiptCapture() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);

  const captureReceipt = useCallback(async (imagePath: string) => {
    // Implementation placeholder
  }, []);

  return { captureReceipt, isProcessing, result };
}
