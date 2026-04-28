import { create } from 'zustand';
import { STORAGE_KEYS, ROUTES } from '@/lib/constants';
import { saveAuth, clearAuth, getStoredUser } from '@/lib/api';
import type { User } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const user = getStoredUser();
    set({
      token,
      user,
      isAuthenticated: !!token && !!user,
      isHydrated: true,
    });
  },

  setAuth: (token, user) => {
    saveAuth(token, user);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    clearAuth();
    set({ token: null, user: null, isAuthenticated: false });
    // Hard navigate to clear any in-memory React Query cache too
    window.location.href = ROUTES.login;
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Selectors — use these in components instead of selecting the whole store
// ─────────────────────────────────────────────────────────────────────────────

export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsHydrated = (s: AuthState) => s.isHydrated;
export const selectUserRole = (s: AuthState) => s.user?.role ?? null;
