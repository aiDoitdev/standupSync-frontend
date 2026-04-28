'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore, selectUser } from '@/store/authStore';
import { ThemeToggle } from '@/components/ThemeProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  IconDashboard,
  IconReports,
  IconBlockers,
  IconMenu,
  IconClose,
  IconLogout,
  IconLogoMark,
} from '@/components/icons';
import { cn, getInitials } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Nav link config — icon + href + label in one place
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: ROUTES.dashboard, label: 'Dashboard', Icon: IconDashboard },
  { href: ROUTES.reports,   label: 'Reports',   Icon: IconReports   },
  { href: ROUTES.blockers,  label: 'Blockers',  Icon: IconBlockers  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// NavLink — active state driven by pathname prefix matching
// ─────────────────────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick?: () => void;
}

function NavLink({ href, label, Icon, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm transition-all duration-200',
        isActive
          ? 'bg-violet-500/[0.16] font-semibold'
          : 'font-medium hover:bg-violet-500/10',
      )}
      style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)' }}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout — app shell used by every authenticated page
// ─────────────────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const user = useAuthStore(selectUser);
  const logout = useAuthStore((s) => s.logout);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hydrate Zustand from localStorage on first mount
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-page)' }}>
      {/* ── Top navigation bar ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            href={ROUTES.dashboard}
            className="flex items-center gap-2.5 flex-shrink-0"
            aria-label="StandupSync home"
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0 w-[30px] h-[30px]"
              style={{ background: '#6D28D9' }}
            >
              <IconLogoMark size={16} />
            </div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              StandupSync
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* User chip */}
            {user && (
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="text-xs font-medium max-w-[120px] truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {user.name || user.email}
                </span>
              </div>
            )}

            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:text-red-500 px-3"
              aria-label="Log out"
            >
              <IconLogout className="w-4 h-4 mr-1.5" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </Button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen
                ? <IconClose className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                : <IconMenu  className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              }
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-3 pt-1 flex flex-col gap-1 border-t"
            style={{ borderColor: 'var(--nav-border)' }}
          >
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} {...item} onClick={closeMenu} />
            ))}
            {user && (
              <p
                className="px-3 py-2 text-xs font-medium rounded-xl mt-1"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
              >
                Signed in as {user.name || user.email}
              </p>
            )}
          </div>
        )}
      </nav>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
