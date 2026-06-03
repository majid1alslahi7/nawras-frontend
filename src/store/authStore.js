import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('nawras-user') || 'null'),
  token: localStorage.getItem('nawras-token') || null,
  isAuthenticated: !!localStorage.getItem('nawras-token'),
  isLoading: false,

  login: async (phone, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/login', { phone, password });
      
      // حفظ في localStorage مباشرة
      localStorage.setItem('nawras-token', data.token);
      localStorage.setItem('nawras-user', JSON.stringify(data.user));
      
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('nawras-token');
    localStorage.removeItem('nawras-user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
