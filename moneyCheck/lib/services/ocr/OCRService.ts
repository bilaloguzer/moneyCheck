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
