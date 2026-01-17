// Handles receipt OCR using OpenAI GPT-4o API
import type { OCRResult } from '@/lib/types';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

// TODO: Ideally move this to a secure environment variable or settings
// For now, the user will need to provide their API Key in the UI or .env
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || ''; 
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export class OCRService {
  
  async extractText(imagePath: string): Promise<OCRResult> {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API Key is missing. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.');
      throw new Error('MISSING_API_KEY');
    }

    try {
      // 1. Convert image to base64
      const responseImage = await fetch(imagePath);
      const blob = await responseImage.blob();
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // remove data:image/jpeg;base64, prefix if present
          resolve(base64.split(',')[1]); 
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 2. Prepare payload for OpenAI
      const prompt = `
        Analyze this receipt image and extract the following data in strict JSON format:
        {
          "merchant": { "name": "Store Name", "confidence": 0-1 },
          "date": { "value": "ISO-8601 Date string", "confidence": 0-1 },
          "total": { "value": number, "confidence": 0-1 },
          "items": [
            { 
              "name": "Raw Product Name", 
              "cleanName": "Clean/Descriptive Name (e.g. 'Milka Chocolate')",
              "category": "category_key",
              "quantity": number, 
              "unitPrice": number,
              "lineTotal": number,
              "confidence": 0-1 
            }
          ]
        }
        
        For "category", chose strictly from: "groceries", "household", "beverages", "snacks", "personal_care", "cleaning", "other".

        CRITICAL MATHEMATICAL RULES (Step-by-Step):
        1. **Detect the Grand Total first**. Use this as your anchor.
        2. **Extract Items**. For each item, look for Quantity, Unit Price, and Line Total.
        3. **Decimal Correction**: If an item price is 695 and the Grand Total is 900, it is possible the price is 695. But if you see two of them, and 695+695 > 900, then the price MUST be 69.50. **Always shift decimals to make the sum of items match the Grand Total.**
           - Example: "695" -> likely 69.50
           - Example: "10" next to "29.50" might be %10 Tax, NOT quantity. Default quantity to 1.
        4. **Verify Sum**: Sum(Item Line Totals) must equal Grand Total (±1%). If they don't match, re-evaluate the prices that look suspiciously high (like missing decimal points).
        5. **Bag Quantity**: It is extremely unlikely to buy 43 shopping bags. If you see "43" next to "0.50", "43" is likely a code, not quantity. Quantity is likely 1.
        6. **Monster Energy**: "10" is often the VAT rate (KDV). If the line total is ~30-40, Quantity is 1. If line total is ~300, Quantity is 10.
        
        Return ONLY the JSON string.
      `;

      const payload = {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      };

      // 3. Call OpenAI API via Axios
      const response = await axios.post(OPENAI_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      });

      const data = response.data;
      
      // 4. Parse OpenAI Response
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No text returned from OpenAI');
      }

      const jsonString = this.cleanJsonString(content);
      const parsedData = JSON.parse(jsonString);

      return this.mapResponseToOCRResult(parsedData, content);

    } catch (error) {
      console.error('OCR processing error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenAI API request failed: ${error.response?.status} ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }
  
  /**
   * Extract text from receipt image using QR code context as anchor data
   * This provides much better accuracy by using known totals to validate line items
   */
  async extractTextWithQRContext(imagePath: string, qrContext: any): Promise<OCRResult> {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API Key is missing. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file.');
      throw new Error('MISSING_API_KEY');
    }

    try {
      // 1. Convert image to base64
      const responseImage = await fetch(imagePath);
      const blob = await responseImage.blob();
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // 2. Prepare enhanced prompt with QR anchor data
      const merchantName = qrContext.merchantName || qrContext.merchantTitle || 'Unknown';
      const grandTotal = qrContext.totalAmount || 0;
      const qrDate = qrContext.documentDate || new Date().toISOString();
      const taxAmount = qrContext.taxAmount || 0;

      const prompt = `
        You have VERIFIED ANCHOR DATA from a QR code scan (100% accurate):
        - Merchant: "${merchantName}"
        - Grand Total: ${grandTotal} TL
        - Date: ${qrDate}
        - Tax Amount: ${taxAmount} TL
        
        Now analyze this receipt image and extract the line items.
        
        CRITICAL MATHEMATICAL RULES:
        1. **The Grand Total MUST be ${grandTotal} TL** - This is VERIFIED from the QR code
        2. **Your extracted items MUST sum to this exact total** (±0.50 TL tolerance for rounding)
        3. **Use this total as your PRIMARY GUIDE to fix decimal point errors**
        4. **Common Error Pattern**: Turkish receipts often show prices without decimal points
           - If you see "695" and other items, it's likely 6.95 TL (not 695 TL)
           - If you see "1750", it's likely 17.50 TL (not 1750 TL)
           - If you see "10" next to a product and another number, "10" might be VAT rate (KDV %), not quantity
        
        5. **Validation Process**:
           a. Extract all line items with quantities and prices
           b. Calculate: Sum(quantity × unitPrice) for each item
           c. Verify: Total of all line items ≈ ${grandTotal} TL
           d. If mismatch: Adjust decimal points until sum matches ${grandTotal}
        
        6. **Bag Quantity Rule**: Shopping bags rarely exceed 5 units. If you see "43 bags", it's probably a code.
        
        7. **Monster Energy / Beverages**: "10" is often the VAT rate, not quantity. Check line total.
        
        Return STRICT JSON format:
        {
          "merchant": {
            "name": "${merchantName}",
            "confidence": 1.0
          },
          "date": {
            "value": "${qrDate}",
            "confidence": 1.0
          },
          "total": {
            "value": ${grandTotal},
            "confidence": 1.0
          },
          "items": [
            {
              "name": "Product Name",
              "cleanName": "Clean Product Name",
              "category": "groceries|household|beverages|snacks|personal_care|cleaning|other",
              "quantity": 1,
              "unitPrice": 10.50,
              "lineTotal": 10.50,
              "confidence": 0.9
            }
          ]
        }
        
        FINAL CHECK BEFORE RETURNING:
        - Sum of all item.lineTotal values = ${grandTotal} TL (±0.50)
        - If not matching, FIX decimal points in prices
        - Merchant name matches: ${merchantName}
        
        Return ONLY the JSON string, no markdown formatting.
      `;

      const payload = {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        response_format: { type: "json_object" }
      };

      // 3. Call OpenAI API
      const response = await axios.post(OPENAI_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      });

      const data = response.data;
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No text returned from OpenAI');
      }

      const jsonString = this.cleanJsonString(content);
      const parsedData = JSON.parse(jsonString);

      // Validate that items sum to QR total
      const itemsTotal = parsedData.items?.reduce((sum: number, item: any) => 
        sum + (item.lineTotal || 0), 0) || 0;
      const diff = Math.abs(itemsTotal - grandTotal);
      
      console.log('QR-enhanced OCR validation:', {
        qrTotal: grandTotal,
        itemsTotal: itemsTotal.toFixed(2),
        difference: diff.toFixed(2),
        withinTolerance: diff <= 0.50
      });

      return this.mapResponseToOCRResult(parsedData, content);

    } catch (error) {
      console.error('QR-enhanced OCR processing error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenAI API request failed: ${error.response?.status} ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }

  private cleanJsonString(text: string): string {
    // Remove markdown code blocks if present (```json ... ```)
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  private mapResponseToOCRResult(data: any, rawText: string): OCRResult {
    return {
      merchant: {
        name: data.merchant?.name || 'Unknown',
        confidence: data.merchant?.confidence || 0,
      },
      date: {
        value: data.date?.value ? new Date(data.date.value) : new Date(),
        confidence: data.date?.confidence || 0,
      },
      total: {
        value: typeof data.total?.value === 'number' ? data.total.value : 0,
        confidence: data.total?.confidence || 0,
      },
      items: Array.isArray(data.items) ? data.items.map((item: any) => ({
        name: item.name || 'Unknown Item',
        cleanName: item.cleanName || item.name,
        category: item.category || 'other',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        price: typeof item.lineTotal === 'number' ? item.lineTotal : (item.price || 0), // Use lineTotal preferably
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
        confidence: item.confidence || 0
      })) : [],
      rawText: rawText // We store the full JSON response or raw extraction as "raw text"
    };
  }
}
