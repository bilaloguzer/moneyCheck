import { TurkishTextNormalizer } from '../../lib/services/ocr/TurkishTextNormalizer';

describe('TurkishTextNormalizer', () => {
  let normalizer: TurkishTextNormalizer;

  beforeEach(() => {
    normalizer = new TurkishTextNormalizer();
  });

  describe('normalize', () => {
    it('should correctly upper case Turkish characters', () => {
      expect(normalizer.normalize('istanbul')).toBe('İSTANBUL');
      expect(normalizer.normalize('ığdır')).toBe('IĞDIR');
      expect(normalizer.normalize('şeker')).toBe('ŞEKER');
      expect(normalizer.normalize('çay')).toBe('ÇAY');
      expect(normalizer.normalize('öğle')).toBe('ÖĞLE');
      expect(normalizer.normalize('üzüm')).toBe('ÜZÜM');
    });

    it('should handle mixed case strings', () => {
      expect(normalizer.normalize('iStanBul')).toBe('İSTANBUL');
    });

    it('should handle empty strings', () => {
      expect(normalizer.normalize('')).toBe('');
    });
  });

  describe('normalizeNumeric', () => {
    it('should correct common OCR numeric errors', () => {
      expect(normalizer.normalizeNumeric('1O,50')).toBe('10.50');
      expect(normalizer.normalizeNumeric('l2,00')).toBe('12.00');
      expect(normalizer.normalizeNumeric('B,99')).toBe('8.99');
      expect(normalizer.normalizeNumeric('S,00')).toBe('5.00');
    });

    it('should replace commas with dots', () => {
      expect(normalizer.normalizeNumeric('12,50')).toBe('12.50');
    });
  });
});
