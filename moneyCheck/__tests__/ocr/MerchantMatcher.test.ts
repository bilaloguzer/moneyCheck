import { MerchantMatcher } from '../../lib/services/ocr/MerchantMatcher';
import { KNOWN_MERCHANTS, MerchantCategory } from '../../lib/types';

describe('MerchantMatcher', () => {
  let matcher: MerchantMatcher;

  beforeEach(() => {
    matcher = new MerchantMatcher();
  });

  it('should match Migros', () => {
    const result = matcher.match('MIGROS TICARET A.S.');
    expect(result.merchant).not.toBeNull();
    expect(result.merchant?.id).toBe(KNOWN_MERCHANTS.MIGROS);
    expect(result.merchant?.category).toBe(MerchantCategory.SUPERMARKET);
  });

  it('should match BİM', () => {
    const result = matcher.match('BIM BIRLESIK MAGAZALAR');
    expect(result.merchant).not.toBeNull();
    expect(result.merchant?.id).toBe(KNOWN_MERCHANTS.BIM);
  });

  it('should match Şok', () => {
    const result = matcher.match('SOK MARKETLER TIC. A.S.');
    expect(result.merchant).not.toBeNull();
    expect(result.merchant?.id).toBe(KNOWN_MERCHANTS.SOK);
  });

  it('should match A101', () => {
    const result = matcher.match('A 101 YENI MAGAZACILIK');
    expect(result.merchant).not.toBeNull();
    expect(result.merchant?.id).toBe(KNOWN_MERCHANTS.A101);
  });

  it('should match Carrefour', () => {
    const result = matcher.match('CARREFOURSA CARREFOUR SABANCI');
    expect(result.merchant).not.toBeNull();
    expect(result.merchant?.id).toBe(KNOWN_MERCHANTS.CARREFOUR);
  });

  it('should return null for unknown merchants', () => {
    const result = matcher.match('UNKNOWN SHOP LTD.');
    expect(result.merchant).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it('should be case insensitive', () => {
    const result = matcher.match('migros');
    expect(result.merchant?.id).toBe(KNOWN_MERCHANTS.MIGROS);
  });
});
