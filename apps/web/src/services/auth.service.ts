import apiClient, { setToken, clearToken } from '@web/lib/api-client';
import { LoginDto, AuthResponse } from '@shared/index';

/**
 * Servicio de autenticación
 */
export const authService = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', dto);
    const data = response.data as AuthResponse;
    setToken(data.accessToken);
    return data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout() {
    clearToken();
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
