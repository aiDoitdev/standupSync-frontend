'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { IconXCircle } from '@/components/icons';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled render errors anywhere in the subtree and shows a
 * recovery UI instead of a blank screen. React error boundaries must be
 * class components — this is the only class component in the codebase.
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, pipe this to your error-tracking service (Sentry, etc.)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="app-card p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto mt-16">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.12)' }}
          >
            <IconXCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={this.reset}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
