// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'manager' | 'member';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Teams
// ─────────────────────────────────────────────────────────────────────────────

export interface Team {
  id: number;
  name: string;
  members_count: number;
  checkin_count?: number;
  plan?: string;
  invite_token?: string;
  created_at?: string;
  owner_id?: number;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  streak?: number;
  last_checkin?: string | null;
  checkin_count?: number;
}

export interface TeamQuestion {
  id: number;
  text: string;
  order: number;
  team_id: number;
}

export interface InviteLink {
  invite_url: string;
  token: string;
  expires_at?: string;
}

export interface CreateTeamPayload {
  name: string;
}

export interface RenameTeamPayload {
  name: string;
}

export interface CreateQuestionPayload {
  text: string;
  order?: number;
}

export interface ReorderQuestionsPayload {
  questions: Array<{ id: number; order: number }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Check-ins
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckInAnswer {
  question_id: number;
  question_text: string;
  answer_text: string;
}

export interface CheckIn {
  id: number;
  user_id: number;
  team_id: number;
  submitted_at: string;
  answers: CheckInAnswer[];
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface TodayStatus {
  submitted: boolean;
  submission_id?: number;
  submitted_at?: string;
  checkin?: CheckIn;
}

export interface CheckInStreak {
  streak: number;
  submitted_dates: string[];
  total_checkins: number;
}

export interface PublicCheckinInfo {
  team_name: string;
  user_name: string;
  questions: Array<{ id: number; text: string }>;
  already_submitted: boolean;
}

export interface SubmitCheckinPayload {
  answers: Array<{ question_id: number; answer_text: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckinHistoryEntry {
  date: string;
  submitted_at: string;
  checkin_id: number;
  answers: CheckInAnswer[];
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface TeamCheckinReport {
  team_id: number;
  team_name: string;
  date: string;
  total_members: number;
  submitted_count: number;
  completion_rate: number;
  entries: CheckinHistoryEntry[];
}

export interface LeaderboardEntry {
  user: Pick<User, 'id' | 'name' | 'email'>;
  streak: number;
  total_checkins: number;
  completion_rate: number;
  rank: number;
}

export interface AIReport {
  summary: string;
  highlights: string[];
  concerns: string[];
  generated_at: string;
}

export interface WeeklyTrendPoint {
  date: string;
  completion_rate: number;
  submitted: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Blockers
// ─────────────────────────────────────────────────────────────────────────────

export type BlockerStatus = 'open' | 'in_progress' | 'resolved';

export interface Blocker {
  id: number;
  text: string;
  status: BlockerStatus;
  created_at: string;
  resolved_at?: string | null;
  user: Pick<User, 'id' | 'name' | 'email'>;
  team_id: number;
  checkin_id?: number;
  ai_summary?: string;
}

export interface UpdateBlockerPayload {
  status: BlockerStatus;
}

export interface AIBlockerAnalysis {
  summary: string;
  patterns: string[];
  recommendations: string[];
  generated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing
// ─────────────────────────────────────────────────────────────────────────────

export type BillingPlan = 'free' | 'starter' | 'pro';
export type BillingStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'grace_period';

export interface BillingInfo {
  plan: BillingPlan;
  status: BillingStatus;
  seats_used: number;
  seats_limit: number;
  teams_used: number;
  teams_limit: number;
  next_billing_date?: string;
  grace_period_ends_at?: string;
  stripe_customer_id?: string;
}

export interface PlanUpgradePayload {
  plan: BillingPlan;
  payment_method_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic API shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | { message: string } | Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface MessageResponse {
  message: string;
}
