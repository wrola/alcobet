import api from './api';
import type { User } from '../types';

export class AuthService {
  static async login(): Promise<void> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${API_URL}/auth/google`;
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if API call fails
      window.location.href = '/';
    }
  }

  static async getProfile(): Promise<User | null> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }
}

export default AuthService;