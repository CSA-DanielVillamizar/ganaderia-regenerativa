// Endpoint base de la API (incluye prefijo /api/v1)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  FARMS: '/farms',
  PADDOCKS: '/paddocks',
  HERDS: '/herds',
  WEIGHINGS: '/weighings',
  MOVEMENTS: '/movements',
  FORAGE: '/forage-samples',
  DASHBOARD: '/dashboard',
};
