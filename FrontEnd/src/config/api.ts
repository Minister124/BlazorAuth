export const API_CONFIG = {
  BASE_URL: 'http://localhost:5238',
  FRONTEND_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/Account/identity/login',
      REGISTER: '/api/Account/identity/create',
      LOGOUT: '/api/Account/identity/logout',
      VALIDATE: '/api/Account/identity/validate',
      REFRESH: '/api/Account/identity/refresh-token',
      CREATE_ADMIN: '/api/Account/identity/admin/create'
    },
    USERS: {
      CREATE: '/api/Account/users/create',
      UPDATE: '/api/Account/users/update/{id}',
      DELETE: '/api/Account/users/delete/{id}',
      LIST: '/api/Account/users'
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
    EXPIRATION: 2 * 24 * 60 * 60 * 1000 // 2 days in milliseconds
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
