import type { BlockerStatus, BillingPlan } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Blocker status config
// Single source of truth — replaces divergent copies in blockers/ and reports/
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCKER_STATUS_CONFIG: Record<
  BlockerStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  open: {
    label: 'Open',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
  },
  resolved: {
    label: 'Resolved',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
  },
};

export const BLOCKER_STATUSES: BlockerStatus[] = ['open', 'in_progress', 'resolved'];

// ─────────────────────────────────────────────────────────────────────────────
// Billing plan config
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_CONFIG: Record<
  BillingPlan,
  { label: string; seats: number; teams: number; price: number }
> = {
  free: { label: 'Free', seats: 3, teams: 1, price: 0 },
  starter: { label: 'Starter', seats: 15, teams: -1, price: 19 },
  pro: { label: 'Pro', seats: -1, teams: -1, price: 49 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/reports', label: 'Reports' },
  { href: '/blockers', label: 'Blockers' },
  { href: '/team', label: 'Team' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// React Query keys — centralised to avoid typo bugs
// ─────────────────────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  teams: ['teams'] as const,
  team: (id: number) => ['teams', id] as const,
  teamMembers: (id: number) => ['teams', id, 'members'] as const,
  teamQuestions: (id: number) => ['teams', id, 'questions'] as const,
  todayStatus: (teamId: number) => ['teams', teamId, 'today-status'] as const,
  streak: (teamId: number) => ['teams', teamId, 'streak'] as const,
  history: (teamId: number, userId?: number) =>
    userId ? ['teams', teamId, 'history', userId] : ['teams', teamId, 'history'],
  reports: (teamId: number, dateRange?: string) => ['reports', teamId, dateRange] as const,
  leaderboard: (teamId: number) => ['reports', teamId, 'leaderboard'] as const,
  aiReport: (teamId: number, date: string) => ['reports', teamId, 'ai', date] as const,
  blockers: (teamId: number, status?: string) => ['blockers', teamId, status] as const,
  aiBlockers: (teamId: number) => ['blockers', teamId, 'ai'] as const,
  billing: ['billing'] as const,
  checkin: (token: string) => ['checkin', token] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Local storage keys — single source of truth
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  theme: 'ss-theme',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// App routes — avoids magic strings in push/replace calls
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  team: '/team',
  reports: '/reports',
  reportsAI: '/reports/ai',
  blockers: '/blockers',
  blockersAI: '/blockers/ai',
  billing: '/dashboard/billing',
  history: (teamId: number, userId: number) => `/dashboard/history/${teamId}/${userId}`,
  checkin: (token: string) => `/checkin/${token}`,
  join: (token: string) => `/join/${token}`,
} as const;
