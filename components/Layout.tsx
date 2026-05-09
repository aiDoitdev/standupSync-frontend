'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore, selectUser } from '@/store/authStore';
import { useTheme } from '@/components/ThemeProvider';
import {
  IconDashboard,
  IconReports,
  IconBlockers,
  IconTeam,
  IconSparkle,
  IconCreditCard,
  IconSettings,
  IconLogout,
  IconLogoMark,
  IconMenu,
  IconClose,
  IconChevronRight,
} from '@/components/icons';
import { cn, getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ─── Nav config ──────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { href: ROUTES.dashboard,  label: 'Dashboard',    Icon: IconDashboard },
  { href: '/teams',          label: 'Teams',        Icon: IconTeam      },
  { href: ROUTES.blockers,   label: 'Blockers',     Icon: IconBlockers  },
  { href: ROUTES.reportsAI,  label: 'AI Radar',     Icon: IconSparkle   },
  { href: ROUTES.blockersAI, label: 'Blocker Intel', Icon: IconSparkle  },
  { href: ROUTES.reports,    label: 'Reports',      Icon: IconReports   },
] as const;

const NAV_ACCOUNT = [
  { href: ROUTES.billing, label: 'Billing',  Icon: IconCreditCard },
  { href: ROUTES.team,    label: 'Settings', Icon: IconSettings   },
] as const;

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':         'Dashboard',
  '/teams':             'Teams',
  '/blockers':          'Blockers',
  '/blockers/ai':       'Blocker Intel',
  '/reports':           'Reports',
  '/reports/ai':        'AI Radar',
  '/dashboard/billing': 'Billing',
  '/team':              'Settings',
};

// ─── SidebarItem ─────────────────────────────────────────────────────────────

function SidebarItem({
  href,
  label,
  Icon,
  onClick,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href.length > 1 && pathname.startsWith(href + '/'));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('ss-nav-item', isActive && 'active')}
    >
      <Icon
        width={15}
        height={15}
        strokeWidth={isActive ? 2.2 : 1.7}
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((s) => s.logout);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const pageTitle = ROUTE_LABELS[pathname] ?? 'StandupSync';
  const userName = user?.name || user?.email || 'User';
  const userPlan = (user as any)?.plan as string | undefined;
  const isPaid = userPlan && userPlan !== 'free';

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className={cn('sidebar', sidebarOpen && 'open')}>
        {/* Brand */}
        <div className="brand">
          <Link
            href={ROUTES.dashboard}
            style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}
          >
            <div className="brand-mark">
              <IconLogoMark size={13} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
              StandupSync
            </span>
          </Link>
        </div>

        {/* Main navigation */}
        <nav
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}
          aria-label="Main navigation"
        >
          <div className="ss-nav">
            {NAV_MAIN.map((item) => (
              <SidebarItem key={item.href} {...item} />
            ))}
          </div>

          <div>
            <div className="ss-nav-section">Account</div>
            <div className="ss-nav">
              {NAV_ACCOUNT.map((item) => (
                <SidebarItem key={item.href} {...item} />
              ))}
            </div>
          </div>
        </nav>

        {/* Quick actions */}
        <div className="sidebar-quick">
          <div className="sidebar-quick-title">
            <span>Quick Actions</span>
          </div>
          <button
            className="sidebar-quick-btn"
            onClick={() => router.push(ROUTES.dashboard)}
          >
            <span style={{ fontSize: 14 }}>+</span>
            New Check-in
          </button>
          <button
            className="sidebar-quick-btn"
            onClick={() => router.push(ROUTES.blockers)}
          >
            <span style={{ fontSize: 14 }}>⚡</span>
            View Blockers
          </button>
        </div>

        {/* User profile */}
        <div className="sidebar-user">
          <div
            className="ss-avatar"
            style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}
            aria-hidden="true"
          >
            {getInitials(userName)}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-email">{user?.email || ''}</div>
          </div>
          <span className={cn('plan-pill', isPaid ? 'paid' : 'free')}>
            {isPaid ? '★ Pro' : 'Free'}
          </span>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="ss-topbar">
          {/* Mobile hamburger */}
          <button
            className="ss-btn icon-only topbar-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen
              ? <IconClose width={16} height={16} aria-hidden="true" />
              : <IconMenu  width={16} height={16} aria-hidden="true" />
            }
          </button>

          {/* Breadcrumb */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            aria-label="Breadcrumb"
          >
            <span className="ss-topbar-crumb">StandupSync</span>
            <IconChevronRight
              width={11}
              height={11}
              strokeWidth={2}
              style={{ color: 'var(--border-strong)' }}
              aria-hidden="true"
            />
            <span className="ss-topbar-title">{pageTitle}</span>
          </div>

          <div className="ss-topbar-spacer" />

          {/* Actions */}
          <div className="ss-topbar-actions">
            {/* Theme toggle */}
            <button
              className="ss-btn icon-only"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Logout */}
            <button
              className="ss-btn"
              onClick={logout}
              style={{ color: 'var(--danger)', gap: 6 }}
              aria-label="Log out"
            >
              <IconLogout width={14} height={14} aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px 64px',
            maxWidth: 1320,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Theme icons ─────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
        clipRule="evenodd"
      />
    </svg>
  );
}
