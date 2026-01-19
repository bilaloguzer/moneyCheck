// PDF Scanning Service - Extracts text from PDF and sends to OpenAI for parsing
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import type { OCRResult } from '@/lib/types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Service for handling PDF file selection and text extraction with OpenAI
 */
export class PDFScanningService {
  
  /**
   * Pick a PDF file and extract invoice data using OpenAI
   */
  static async pickPDF(): Promise<{ success: boolean; ocrResult?: OCRResult; error?: string }> {
    try {
      // Let user pick a PDF file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      // Handle cancellation
      if (result.canceled) {
        return {
          success: false,
          error: 'PDF selection cancelled',
        };
      }

      // Ensure we have a valid file
      if (!result.assets || result.assets.length === 0) {
        return {
          success: false,
          error: 'No file selected',
        };
      }

      const file = result.assets[0];
      console.log('PDF selected:', file.name, file.size, 'bytes');

      // Extract and parse invoice data
      const ocrResult = await this.extractInvoiceData(file.uri);
      
      if (ocrResult) {
        return {
          success: true,
          ocrResult,
        };
      } else {
        return {
          success: false,
          error: 'Failed to extract invoice data from PDF',
        };
      }
      
    } catch (error) {
      console.error('Error picking PDF:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error selecting PDF',
      };
    }
  }

  /**
   * Extract invoice data from PDF using OpenAI text model
   */
  private static async extractInvoiceData(pdfUri: string): Promise<OCRResult | null> {
    try {
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return null;
      }

      console.log('Reading PDF file...');
      
      // Read the PDF file as base64
      const base64 = await FileSystemLegacy.readAsStringAsync(pdfUri, {
        encoding: 'base64',
      });

      // Convert to text (will be messy but contains the invoice data)
      const pdfBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const pdfText = new TextDecoder('utf-8', { fatal: false }).decode(pdfBytes);
      
      console.log('Sending PDF text to OpenAI (length:', pdfText.length, 'chars)');

      // Send to OpenAI GPT-4o
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at extracting structured invoice data from Turkish e-arşiv PDF text content. The text contains PDF formatting codes mixed with invoice data. Extract all relevant information accurately.'
            },
            {
              role: 'user',
              content: `Extract complete invoice data from this Turkish e-arşiv PDF text. Find:
- Merchant name (company name, usually ends with LTD, A.Ş., TİC., etc.) - NOT the PDF creator like "IronPdf"
- Date (invoice date in YYYY-MM-DD format)
- Total amount (Toplam Tutar, Ödenecek Tutar, or similar)
- ALL line items with: product name, quantity, unit price, and line total

CRITICAL: Look for the ACTUAL MERCHANT that issued the invoice, not the software that created the PDF.
CRITICAL: Extract ALL products/items from the invoice table.

Return ONLY valid JSON in this exact structure:
{
  "merchant": {"name": "Company Name", "confidence": 1},
  "date": {"value": "YYYY-MM-DD", "confidence": 1},
  "total": {"value": 123.45, "confidence": 1},
  "items": [
    {
      "name": "Product Name",
      "cleanName": "Clean Product Name",
      "category": "groceries",
      "quantity": 1,
      "price": 10.50,
      "unitPrice": 10.50,
      "confidence": 0.9
    }
  ]
}

Categories: groceries, household, beverages, snacks, personal_care, cleaning, other

PDF Content:
${pdfText.substring(0, 20000)}`
            }
          ],
          max_tokens: 2000,
          temperature: 0,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return null;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('No content in OpenAI response');
        return null;
      }

      const extractedData = JSON.parse(content);
      console.log('Extracted invoice data:', extractedData);

      // Convert to OCRResult format
      const ocrResult: OCRResult = {
        merchant: extractedData.merchant || { name: 'Unknown', confidence: 0 },
        date: extractedData.date || { value: new Date(), confidence: 0 },
        total: extractedData.total || { value: 0, confidence: 0 },
        items: (extractedData.items || []).map((item: any) => ({
          name: item.name || 'Unknown',
          cleanName: item.cleanName || item.name,
          category: item.category || 'other',
          quantity: item.quantity || 1,
          price: item.price || item.unitPrice || 0,
          unitPrice: item.unitPrice || item.price || 0,
          confidence: item.confidence || 0.8,
        })),
        rawText: JSON.stringify(extractedData),
      };

      return ocrResult;

    } catch (error) {
      console.error('Error extracting invoice data:', error);
      return null;
    }
  }
}
