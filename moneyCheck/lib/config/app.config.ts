// App-wide configuration - API endpoints, feature flags, performance settings

export const APP_CONFIG = {
  version: '0.1.0',
  environment: process.env.APP_ENV || 'development',

  features: {
    priceComparison: true,
    analytics: true,
    export: true,
  },

  performance: {
    maxReceiptImageSize: 5 * 1024 * 1024, // 5MB
    ocrTimeout: 30000, // 30 seconds
    imageCacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  database: {
    name: 'smartspend.db',
    version: 1,
  },
} as const;
