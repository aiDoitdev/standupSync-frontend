'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getUser } from '../lib/api';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeProvider';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getUser());
  }, []);

  function navLink(href, label, icon) {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${!active ? 'hover:bg-violet-500/10' : ''}`}
        style={{
          padding: '6px 14px',
          borderRadius: 8,
          fontWeight: active ? 600 : 500,
          background: active ? 'rgba(109,40,217,0.12)' : 'transparent',
          color: active ? 'var(--text-secondary)' : 'var(--text-muted)',
        }}
      >
        {icon && <span className="leading-none">{icon}</span>}
        {label}
      </Link>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-page)' }}>
      {/* Top Nav */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 30, height: 30, background: '#6D28D9' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="4.5" r="2.5" fill="white" />
                <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              StandupSync
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/dashboard', 'Dashboard',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            )}
            {navLink('/reports', 'Reports',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {navLink('/blockers', 'Blockers',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* User display */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium max-w-[120px] truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user.name || user.email}
                </span>
              </div>
            )}

            <ThemeToggle />

            <button
              onClick={logout}
              className="text-sm px-3 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-red-500/10 text-red-500 dark:text-red-400"
            >
              Logout
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
              aria-label="Menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 flex flex-col gap-1 border-t" style={{ borderColor: 'var(--nav-border)' }}>
            {navLink('/dashboard', 'Dashboard',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            )}
            {navLink('/reports', 'Reports',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {navLink('/blockers', 'Blockers',
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
            {user && (
              <div className="px-3 py-2 text-xs font-medium rounded-xl mt-1" style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                Signed in as {user.name || user.email}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}

