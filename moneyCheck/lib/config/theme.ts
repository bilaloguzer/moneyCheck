// App theme configuration - Notion-inspired aesthetic
// Clean, minimal design with neutral colors and spacious layouts

export const THEME = {
  colors: {
    // Notion-inspired neutral palette
    primary: '#37352F',        // Dark gray-brown (Notion text)
    secondary: '#787774',      // Medium gray
    accent: '#2EAADC',         // Notion blue
    success: '#0F7B6C',        // Muted teal
    danger: '#E03E3E',         // Muted red
    warning: '#D9730D',        // Muted orange
    background: '#FFFFFF',     // Clean white
    surface: '#F7F6F3',        // Warm off-white (Notion bg)
    surfaceHover: '#EFEEEB',   // Slightly darker on hover
    text: '#37352F',           // Primary text
    textSecondary: '#787774',  // Secondary text
    textTertiary: '#9B9A97',   // Tertiary/placeholder text
    border: '#E9E9E7',         // Subtle border
    divider: '#E9E9E7',        // Divider lines
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    h1: { fontSize: 32, fontWeight: '700', lineHeight: 40, color: '#37352F' },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 32, color: '#37352F' },
    h3: { fontSize: 18, fontWeight: '600', lineHeight: 28, color: '#37352F' },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24, color: '#37352F' },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20, color: '#37352F' },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16, color: '#787774' },
  },

  borderRadius: {
    sm: 3,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#00000015',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#00000020',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  },
} as const;
