import { TextParser } from '../../lib/services/ocr/TextParser';
import { KNOWN_MERCHANTS } from '../../lib/types';

describe('TextParser', () => {
  let parser: TextParser;

  beforeEach(() => {
    parser = new TextParser();
  });

  const sampleReceipt = `
    MIGROS TICARET A.S.
    KEMALPASA MAH. 123. SK
    TARIH: 15.03.2024 SAAT: 14:30
    FIS NO: 0123
    
    SUT 1LT TAM YAGLI   25,50
    EKMEK 250GR         10,00
    DOMATES KG          34,90
    
    TOPLAM KDV          12,50
    TOPLAM              70,40
    ODENEN              70,40
    
    TESEKKURLER
  `;

  it('should parse a complete receipt', () => {
    const result = parser.parse(sampleReceipt);

    // Merchant
    expect(result.merchant.name).toBe('Migros');
    expect(result.merchant.confidence).toBeGreaterThan(0.8);

    // Date
    expect(result.date.value.getDate()).toBe(15);
    expect(result.date.value.getMonth()).toBe(2); // March is 2
    expect(result.date.value.getFullYear()).toBe(2024);

    // Total
    expect(result.total.value).toBe(70.40);

    // Items
    expect(result.items.length).toBeGreaterThan(0);
    const milk = result.items.find(i => i.name.includes('SUT'));
    expect(milk).toBeDefined();
    expect(milk?.price).toBe(25.50);
  });

  it('should handle OCR errors in total', () => {
    const messyReceipt = `
      MARKET
      ...
      TOPLQM 100,50
    `;
    const result = parser.parse(messyReceipt);
    // Note: Depends on how robust extraction is, 
    // but we expect it to try and find the total price near keywords
    // In our implementation we look for TOPLAM variants.
    // If TOPLQM isn't in list, it might fail or fallback to max number.
    // Let's rely on fallback logic if keyword fails.
    expect(result.total.value).toBe(100.50);
  });
  
  it('should extract items correctly', () => {
      const result = parser.parse(sampleReceipt);
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toContain('SUT');
      expect(result.items[0].price).toBe(25.50);
      expect(result.items[1].name).toContain('EKMEK');
      expect(result.items[1].price).toBe(10.00);
  });
});
