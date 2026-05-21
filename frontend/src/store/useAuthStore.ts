import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'contractor' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;       // ← key flag: true once localStorage is loaded
  setHasHydrated: (v: boolean) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      },

      checkAuth: async () => {
        try {
          const { token } = get();
          if (!token) return;
          const response = await api.get('/auth/me');
          set({ user: response.data.data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      // Called once Zustand has finished loading from localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
