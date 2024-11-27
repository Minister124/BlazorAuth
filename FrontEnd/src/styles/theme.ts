export const theme = {
  colors: {
    // Primary palette - Modern gradient-friendly colors
    primary: {
      base: '#2D3FDE',      // Rich blue - primary actions
      light: '#4C5EFF',     // Light blue - hover states
      dark: '#1E2A94',      // Dark blue - active states
      gradient: 'linear-gradient(135deg, #2D3FDE 0%, #4C5EFF 100%)',
    },
    // Secondary palette - Complementary accents
    secondary: {
      base: '#FF6B6B',      // Coral - secondary actions
      light: '#FF8E8E',     // Light coral - hover states
      dark: '#E64545',      // Dark coral - active states
    },
    // Background palette - Sophisticated neutrals
    background: {
      primary: '#F0F4FF',   // Light blue-gray - main background
      secondary: '#FFFFFF',  // White - card backgrounds
      tertiary: '#E8ECFD',  // Light purple-gray - alternate backgrounds
      dark: '#1A1B4B',      // Deep blue-gray - dark mode ready
    },
    // Text palette - Readable and elegant
    text: {
      primary: '#1A1B4B',   // Deep blue-gray - primary text
      secondary: '#4A4B77', // Medium blue-gray - secondary text
      tertiary: '#8E8FB3',  // Light blue-gray - disabled text
      inverse: '#FFFFFF',   // White - text on dark backgrounds
    },
    // Status colors - Clear and meaningful
    status: {
      success: '#00C853',   // Green - success states
      warning: '#FFB300',   // Amber - warning states
      error: '#FF3D00',     // Red - error states
      info: '#2196F3',      // Blue - info states
    },
    // Border and shadow colors
    border: {
      light: 'rgba(45, 63, 222, 0.1)',
      medium: 'rgba(45, 63, 222, 0.2)',
      dark: 'rgba(45, 63, 222, 0.3)',
    }
  },
  
  typography: {
    fontFamily: {
      primary: '"Inter", sans-serif',
      secondary: '"Manrope", sans-serif',
      mono: '"Fira Code", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
  },
  
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(45, 63, 222, 0.1)',
    md: '0 4px 8px rgba(45, 63, 222, 0.12)',
    lg: '0 8px 16px rgba(45, 63, 222, 0.14)',
    xl: '0 12px 24px rgba(45, 63, 222, 0.16)',
    inner: 'inset 0 2px 4px rgba(45, 63, 222, 0.05)',
    colored: '0 8px 16px rgba(45, 63, 222, 0.25)',
  },
  
  animation: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timings: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};
