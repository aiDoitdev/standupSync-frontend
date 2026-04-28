// Central re-export — import all types from '@/types'
export * from './api';

// ─────────────────────────────────────────────────────────────────────────────
// UI / Component types
// ─────────────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
