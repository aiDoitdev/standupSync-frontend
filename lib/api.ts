import { STORAGE_KEYS } from './constants';
import type { AuthResponse, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.token);
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return 'Something went wrong';
  const d = data as Record<string, unknown>;
  const detail = d['detail'];
  if (typeof detail === 'string') return detail;
  if (detail && typeof detail === 'object') {
    const msg = (detail as Record<string, unknown>)['message'];
    if (typeof msg === 'string') return msg;
    return JSON.stringify(detail);
  }
  return 'Something went wrong';
}

// ─────────────────────────────────────────────────────────────────────────────
// Core fetch wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface ApiCallOptions {
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

export async function apiCall<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body: unknown = null,
  { retries = 2, retryDelay = 800, signal }: ApiCallOptions = {},
): Promise<T> {
  const config: RequestInit = {
    method,
    headers: buildHeaders(),
    signal,
  };

  if (body !== null) {
    config.body = JSON.stringify(body);
  }

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, config);

      // Retry on 5xx only; 4xx are definitive client errors
      if (res.status >= 500 && attempt < retries) {
        lastError = new Error(`Server error (${res.status})`);
        continue;
      }

      const data: unknown = await res.json();

      if (!res.ok) {
        throw new Error(extractErrorMessage(data));
      }

      return data as T;
    } catch (err) {
      // Don't retry on abort
      if (err instanceof DOMException && err.name === 'AbortError') throw err;

      // Retry on network-level failures
      if (err instanceof TypeError && attempt < retries) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────────────────────────────────────

export function saveAuth(token: string, user: User): void {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

// Backward-compatible alias — pages still using getUser() will work until
// they are migrated to useAuthStore in Phase 3.
export const getUser = getStoredUser;

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

// ─────────────────────────────────────────────────────────────────────────────
// Typed endpoint helpers
// Every API endpoint lives here — no raw `apiCall` in components/pages
// ─────────────────────────────────────────────────────────────────────────────

import type {
  LoginPayload,
  SignupPayload,
  Team,
  TeamMember,
  TeamQuestion,
  InviteLink,
  CreateTeamPayload,
  RenameTeamPayload,
  CreateQuestionPayload,
  ReorderQuestionsPayload,
  TodayStatus,
  CheckInStreak,
  CheckIn,
  CheckinHistoryEntry,
  LeaderboardEntry,
  AIReport,
  Blocker,
  BlockerStatus,
  UpdateBlockerPayload,
  AIBlockerAnalysis,
  BillingInfo,
  PublicCheckinInfo,
  SubmitCheckinPayload,
  MessageResponse,
} from '@/types';

// Auth
export const authApi = {
  login: (payload: LoginPayload) =>
    apiCall<AuthResponse>('/auth/login', 'POST', payload),

  signup: (payload: SignupPayload) =>
    apiCall<AuthResponse>('/auth/signup', 'POST', payload),
};

// Teams
export const teamsApi = {
  list: (signal?: AbortSignal) =>
    apiCall<Team[]>('/teams', 'GET', null, { signal }),

  create: (payload: CreateTeamPayload) =>
    apiCall<Team>('/teams', 'POST', payload),

  rename: (teamId: number, payload: RenameTeamPayload) =>
    apiCall<Team>(`/teams/${teamId}/rename`, 'PATCH', payload),

  delete: (teamId: number) =>
    apiCall<MessageResponse>(`/teams/${teamId}`, 'DELETE'),

  getMembers: (teamId: number, signal?: AbortSignal) =>
    apiCall<TeamMember[]>(`/teams/${teamId}/members`, 'GET', null, { signal }),

  removeMember: (teamId: number, userId: number) =>
    apiCall<MessageResponse>(`/teams/${teamId}/members/${userId}`, 'DELETE'),

  getQuestions: (teamId: number, signal?: AbortSignal) =>
    apiCall<TeamQuestion[]>(`/teams/${teamId}/questions`, 'GET', null, { signal }),

  createQuestion: (teamId: number, payload: CreateQuestionPayload) =>
    apiCall<TeamQuestion>(`/teams/${teamId}/questions`, 'POST', payload),

  deleteQuestion: (teamId: number, questionId: number) =>
    apiCall<MessageResponse>(`/teams/${teamId}/questions/${questionId}`, 'DELETE'),

  reorderQuestions: (teamId: number, payload: ReorderQuestionsPayload) =>
    apiCall<MessageResponse>(`/teams/${teamId}/questions/reorder`, 'PUT', payload),

  getInviteLink: (teamId: number) =>
    apiCall<InviteLink>(`/teams/${teamId}/invite-link`),

  revokeInviteLink: (teamId: number) =>
    apiCall<MessageResponse>(`/teams/${teamId}/invite-link`, 'DELETE'),
};

// Check-ins
export const checkinsApi = {
  getTodayStatus: (teamId: number, signal?: AbortSignal) =>
    apiCall<TodayStatus>(`/teams/${teamId}/checkin-status`, 'GET', null, { signal }),

  getStreak: (teamId: number, signal?: AbortSignal) =>
    apiCall<CheckInStreak>(`/teams/${teamId}/streak`, 'GET', null, { signal }),

  getHistory: (teamId: number, signal?: AbortSignal) =>
    apiCall<CheckinHistoryEntry[]>(`/teams/${teamId}/history`, 'GET', null, { signal }),

  getMemberHistory: (teamId: number, userId: number, signal?: AbortSignal) =>
    apiCall<CheckinHistoryEntry[]>(
      `/teams/${teamId}/members/${userId}/history`,
      'GET',
      null,
      { signal },
    ),

  getPublicInfo: (token: string, signal?: AbortSignal) =>
    apiCall<PublicCheckinInfo>(`/checkin/${token}`, 'GET', null, { signal }),

  submit: (token: string, payload: SubmitCheckinPayload) =>
    apiCall<CheckIn>(`/checkin/${token}`, 'POST', payload),

  joinTeam: (token: string) =>
    apiCall<MessageResponse>(`/join/${token}`, 'POST'),
};

// Reports
export const reportsApi = {
  getTeamReport: (teamId: number, date?: string, signal?: AbortSignal) => {
    const query = date ? `?date=${date}` : '';
    return apiCall<CheckIn[]>(`/teams/${teamId}/report${query}`, 'GET', null, { signal });
  },

  getLeaderboard: (teamId: number, signal?: AbortSignal) =>
    apiCall<LeaderboardEntry[]>(`/teams/${teamId}/leaderboard`, 'GET', null, { signal }),

  getAIReport: (teamId: number, date: string, signal?: AbortSignal) =>
    apiCall<AIReport>(`/teams/${teamId}/ai-report?date=${date}`, 'GET', null, { signal }),
};

// Blockers
export const blockersApi = {
  list: (teamId: number, status?: BlockerStatus, signal?: AbortSignal) => {
    const query = status ? `?status=${status}` : '';
    return apiCall<Blocker[]>(`/teams/${teamId}/blockers${query}`, 'GET', null, { signal });
  },

  update: (blockerId: number, payload: UpdateBlockerPayload) =>
    apiCall<Blocker>(`/blockers/${blockerId}`, 'PATCH', payload),

  getAIAnalysis: (teamId: number, signal?: AbortSignal) =>
    apiCall<AIBlockerAnalysis>(`/teams/${teamId}/blockers/ai`, 'GET', null, { signal }),
};

// Billing
export const billingApi = {
  getInfo: (signal?: AbortSignal) =>
    apiCall<BillingInfo>('/billing', 'GET', null, { signal }),

  upgrade: (plan: string) =>
    apiCall<BillingInfo>('/billing/upgrade', 'POST', { plan }),

  createCheckoutSession: (plan: string) =>
    apiCall<{ checkout_url: string }>('/billing/checkout', 'POST', { plan }),
};
