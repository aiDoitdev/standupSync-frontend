import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Reusable skeleton primitives
// Compose these to build page-level loading states without duplicating markup.
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonCardProps {
  rows?: number;
  className?: string;
}

/** A card-shaped skeleton with N text rows */
export function SkeletonCard({ rows = 3, className }: SkeletonCardProps) {
  return (
    <div className={cn('app-card p-5 animate-pulse space-y-3', className)}>
      <Skeleton className="h-4 w-2/5" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

/** A row inside a table or list */
export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 animate-pulse', className)}>
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
    </div>
  );
}

/** A stat tile skeleton */
export function SkeletonStat({ className }: { className?: string }) {
  return (
    <div className={cn('app-card p-5 animate-pulse', className)}>
      <Skeleton className="w-9 h-9 rounded-xl mb-3" />
      <Skeleton className="h-7 w-1/3 mb-1" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/** A grid of N stat tiles */
export function SkeletonStatGrid({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStat key={i} />
      ))}
    </div>
  );
}

/** A table header + N rows */
interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export function SkeletonTable({ rows = 5, className }: SkeletonTableProps) {
  return (
    <div className={cn('app-card overflow-hidden animate-pulse', className)}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-card)' }}>
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border-card)' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
