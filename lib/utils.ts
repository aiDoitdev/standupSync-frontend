import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─────────────────────────────────────────────────────────────────────────────
// shadcn/ui utility — merges Tailwind classes without conflicts
// ─────────────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Date / Time helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Format an ISO datetime string to a human-readable time, e.g. "09:42 AM" */
export function formatTime(dt: string | null | undefined): string {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format today's date as "Monday, April 23, 2026" */
export function formatTodayLong(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format any Date to ISO date string "YYYY-MM-DD" */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Format an ISO date string to a short display format, e.g. "Apr 23" */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format an ISO date string to a medium display format, e.g. "April 23, 2026" */
export function formatDateMedium(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format an ISO datetime string to relative time, e.g. "2 hours ago" */
export function formatRelativeTime(dt: string | null | undefined): string {
  if (!dt) return '';
  const diff = Date.now() - new Date(dt).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the current check-in streak from an array of submitted ISO date strings.
 * Counts backwards from today (or yesterday if today has no submission).
 */
export function computeStreak(submittedDates: string[]): number {
  if (!submittedDates.length) return 0;
  const set = new Set(submittedDates);
  const today = toISODate(new Date());
  const cursor = new Date();
  if (!set.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (true) {
    const key = toISODate(cursor);
    if (!set.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─────────────────────────────────────────────────────────────────────────────
// Number / String helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Return user initials from name or email, e.g. "John Doe" → "JD" */
export function getInitials(nameOrEmail: string): string {
  const parts = nameOrEmail.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return nameOrEmail.slice(0, 2).toUpperCase();
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format a percentage, e.g. 0.857 → "86%" */
export function formatPercent(ratio: number, decimals = 0): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** Truncate a string to a max length with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/** Check if a value is a non-empty string */
export function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Environment helpers
// ─────────────────────────────────────────────────────────────────────────────

export const isBrowser = typeof window !== 'undefined';
