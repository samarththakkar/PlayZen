import { create } from 'zustand';
import { authService } from '@/lib/api-services';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.data) {
        set({ user: response.data.user, isAuthenticated: true });
      }
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      // Even if logout fails, clear local state
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authService.getCurrentUser();
      if (response.data && response.data !== null) {
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      // Don't treat 401 as an error for getCurrentUser - just means not logged in
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));