import { theme } from './theme';

export const components = {
  // Card styles
  card: {
    base: `
      bg-white rounded-xl shadow-lg
      transition-all duration-300
      hover:shadow-xl
      dark:bg-gray-800
    `,
    variants: {
      primary: `border-l-4 border-primary-500`,
      secondary: `border border-gray-100`,
      elevated: `hover:translate-y-[-2px]`,
    }
  },

  // Button styles
  button: {
    base: `
      inline-flex items-center justify-center
      px-4 py-2 rounded-lg
      font-medium text-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
    `,
    variants: {
      primary: `
        bg-gradient-to-r from-primary-500 to-primary-600
        text-white
        hover:from-primary-600 hover:to-primary-700
        focus:ring-primary-500
      `,
      secondary: `
        bg-white
        text-gray-700
        border border-gray-300
        hover:bg-gray-50
        focus:ring-gray-500
      `,
      danger: `
        bg-red-500
        text-white
        hover:bg-red-600
        focus:ring-red-500
      `,
    },
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }
  },

  // Input styles
  input: {
    base: `
      w-full
      px-4 py-2
      border border-gray-300 rounded-lg
      text-gray-900
      placeholder-gray-500
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500
      disabled:bg-gray-100 disabled:cursor-not-allowed
    `,
    variants: {
      error: `
        border-red-500
        focus:border-red-500 focus:ring-red-500
      `,
      success: `
        border-green-500
        focus:border-green-500 focus:ring-green-500
      `,
    }
  },

  // Navigation styles
  nav: {
    item: `
      flex items-center gap-3
      px-4 py-3 rounded-lg
      font-medium text-gray-700
      transition-all duration-200
      hover:bg-primary-50
      focus:outline-none focus:bg-primary-50
    `,
    itemActive: `
      bg-primary-50
      text-primary-700
    `,
  },

  // Badge styles
  badge: {
    base: `
      inline-flex items-center
      px-2.5 py-0.5
      rounded-full text-xs font-medium
    `,
    variants: {
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
    }
  },

  // Avatar styles
  avatar: {
    base: `
      inline-flex items-center justify-center
      rounded-full
      bg-gray-100
      overflow-hidden
    `,
    sizes: {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
    }
  },

  // Toast/Notification styles
  toast: {
    base: `
      flex items-center gap-3
      p-4 rounded-lg shadow-lg
      max-w-sm w-full
      pointer-events-auto
      transition-all duration-300
      transform
    `,
    variants: {
      info: 'bg-blue-50 text-blue-900',
      success: 'bg-green-50 text-green-900',
      warning: 'bg-yellow-50 text-yellow-900',
      error: 'bg-red-50 text-red-900',
    }
  }
};
