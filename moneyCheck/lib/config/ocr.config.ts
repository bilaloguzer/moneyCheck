// OCR-specific configuration - confidence thresholds, language settings

export const OCR_CONFIG = {
  language: 'tr', // Turkish

  confidenceThresholds: {
    merchant: 0.85,
    date: 0.90,
    total: 0.90,
    items: 0.80,
  },

  minConfidenceForAutoAccept: 0.95,

  textRecognitionOptions: {
    languageHint: ['tr', 'en'],
    useExactRegions: false,
  },
} as const;
