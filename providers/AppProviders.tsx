'use client';

import QueryProvider from './QueryProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import MotionProvider from '@/app/MotionProvider';

// ─────────────────────────────────────────────────────────────────────────────
// AppProviders — single wrapper that composes all global providers in the
// correct nesting order. Import this once in the root layout.
//
// Order matters:
//   MotionProvider (Framer Motion LazyMotion — wraps everything)
//   └── ThemeProvider (theme context + dark/light class on <html>)
//       └── QueryProvider (React Query client)
//           └── {children}
// ─────────────────────────────────────────────────────────────────────────────

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <MotionProvider>
      <ThemeProvider>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </MotionProvider>
  );
}
