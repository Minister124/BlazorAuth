export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5238',
  FRONTEND_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/account/identity/login',
      REGISTER: '/api/account/identity/create',
      REFRESH: '/api/account/identity/refresh-token',
      LOGOUT: '/api/account/identity/logout',
      VALIDATE: '/api/account/identity/validate',
      CREATE_ADMIN: '/api/account/identity/admin/create'
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      GET: '/api/users/:id',
      UPDATE: '/api/users/:id',
      DELETE: '/api/users/:id',
      PROFILE: '/api/users/profile',
    },
    DEPARTMENTS: {
      LIST: '/api/departments',
      CREATE: '/api/departments',
      GET: '/api/departments/:id',
      UPDATE: '/api/departments/:id',
      DELETE: '/api/departments/:id',
      ASSIGN_MANAGER: '/api/departments/:id/manager',
    },
    ROLES: {
      LIST: '/api/roles',
      CREATE: '/api/roles',
      GET: '/api/roles/:id',
      UPDATE: '/api/roles/:id',
      DELETE: '/api/roles/:id',
      PERMISSIONS: '/api/roles/permissions',
    },
  },
  TOKEN: {
    KEY: 'auth_token',
    REFRESH_KEY: 'refresh_token',
  },
  ERROR_MESSAGES: {
    DEFAULT: 'An error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
  },
};
