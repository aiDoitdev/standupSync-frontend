import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Accessible loading spinner.
 * Replaces the 4 duplicate ad-hoc Spinner definitions across the codebase.
 */
export default function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-violet-500', sizeMap[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="status"
    >
      <title>{label}</title>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-page centred loading state
// ─────────────────────────────────────────────────────────────────────────────

interface PageLoadingProps {
  label?: string;
}

export function PageLoading({ label = 'Loading…' }: PageLoadingProps) {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-3"
      aria-busy="true"
      aria-label={label}
    >
      <Spinner size="lg" />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}
