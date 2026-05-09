'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiCall, getUser } from '../../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconSearch({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconCash({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path strokeLinecap="round" d="M6 6v-.01M18 18v-.01" />
    </svg>
  );
}
function IconDiamond({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 5-8 15L4 7l8-5z" />
      <path strokeLinecap="round" d="M4 7h16" />
    </svg>
  );
}
function IconCheckBadge({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}
function IconClock({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconBarChart({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="18" y="3" width="3" height="18" rx="1" />
      <rect x="10.5" y="8" width="3" height="13" rx="1" />
      <rect x="3" y="13" width="3" height="8" rx="1" />
    </svg>
  );
}
function IconBolt({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
// ─── Utilities ────────────────────────────────────────────────────────────────

// ─── Skeleton: Teams Selector Loading ─────────────────────────────────────────
function TeamsLoadingSkeleton() {
  return (
    <div className="animate-pulse mb-6" aria-busy="true" aria-label="Loading teams">
      <div className="h-3 w-24 rounded-md mb-2" style={{ background: 'var(--border-card)' }} />
      <div className="h-10 rounded-xl" style={{ background: 'var(--border-card)', width: 280 }} />
    </div>
  );
}

// ─── Skeleton: Manager Reports Content ────────────────────────────────────────
function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading reports">
      <div className="flex gap-1 p-1 w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 11 }}>
        <div className="h-8 w-24 rounded-lg" style={{ background: 'var(--border-card)' }} />
        <div className="h-8 w-32 rounded-lg" style={{ background: 'var(--border-card)' }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="w-8 h-8 rounded-lg mb-3" style={{ background: 'var(--border-card)' }} />
            <div className="h-6 w-12 rounded-md mb-1.5" style={{ background: 'var(--border-card)' }} />
            <div className="h-3 w-20 rounded-md" style={{ background: 'var(--border-card)' }} />
          </div>
        ))}
      </div>
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
        <div className="h-4 w-48 rounded-md mb-4" style={{ background: 'var(--border-card)' }} />
        <div className="h-48 rounded-xl" style={{ background: 'var(--border-card)' }} />
      </div>
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
        <div className="h-4 w-56 rounded-md mb-4" style={{ background: 'var(--border-card)' }} />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-3 w-4 rounded-sm" style={{ background: 'var(--border-card)' }} />
              <div className="h-3 rounded-md flex-1" style={{ background: 'var(--border-card)', maxWidth: `${50 + i * 10}%` }} />
              <div className="h-3 w-10 rounded-md" style={{ background: 'var(--border-card)' }} />
              <div className="h-3 w-8 rounded-md" style={{ background: 'var(--border-card)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton: Member Reports Content ─────────────────────────────────────────
function MemberReportsSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse" aria-busy="true" aria-label="Loading your stats">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="w-8 h-8 rounded-lg mb-3" style={{ background: 'var(--border-card)' }} />
            <div className="h-6 w-10 rounded-md mb-1.5" style={{ background: 'var(--border-card)' }} />
            <div className="h-3 w-20 rounded-md" style={{ background: 'var(--border-card)' }} />
          </div>
        ))}
      </div>
      <div className="rounded-xl px-5 py-4" style={{ background: 'rgba(109,40,217,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full" style={{ background: 'var(--border-card)' }} />
          <div className="space-y-1.5">
            <div className="h-3.5 w-52 rounded-md" style={{ background: 'var(--border-card)' }} />
            <div className="h-3 w-36 rounded-md" style={{ background: 'var(--border-card)' }} />
          </div>
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
        <div className="h-4 w-44 rounded-md mb-4" style={{ background: 'var(--border-card)' }} />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-lg" style={{ background: 'var(--border-card)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function MemberAvatar({ name, size = 30 }) {
  const initials = getInitials(name);
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = ((name.charCodeAt(i) + ((hash << 5) - hash)) | 0);
  const hue = Math.abs(hash) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue} 55% 87%)`,
      color: `hsl(${hue} 65% 30%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.37, fontWeight: 700, letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, sub, iconBg, iconColor, highlight, accentColor }) {
  const isEmoji = typeof icon === 'string';
  return (
    <div
      className="app-card p-5 flex flex-col"
      style={highlight ? { borderColor: 'rgba(139,92,246,0.4)', boxShadow: '0 0 0 1px rgba(139,92,246,0.18), 0 4px 24px rgba(109,40,217,0.14)' } : {}}
    >
      <div
        className="stat-icon-box"
        style={{ background: iconBg || 'rgba(139,92,246,0.1)', color: iconColor || '#7c3aed', fontSize: isEmoji ? '1.2rem' : undefined, lineHeight: isEmoji ? 1 : undefined }}
      >
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color: accentColor || 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

const CHART_COLORS = {
  violet: '#8b5cf6',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
  blue: '#60a5fa',
};

const customTooltipStyle = {
  background: 'var(--bg-card, #1e1b2e)',
  border: '1px solid rgba(139,92,246,0.3)',
  borderRadius: 10,
  color: 'var(--text-primary, #fff)',
  fontSize: 13,
};

// ─── Date range helpers ───────────────────────────────────────────────────────
function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 29);
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

function getMinDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return toISODate(d);
}

function formatDateRangeLabel(startDate, endDate) {
  const s = new Date(startDate + 'T00:00:00');
  const e = new Date(endDate + 'T00:00:00');
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
  const today = toISODate(new Date());
  const minDate = getMinDate();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>From</span>
      <input
        type="date"
        value={startDate}
        max={endDate}
        min={minDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="app-input text-sm font-medium"
        style={{ width: 'auto', minWidth: 140 }}
      />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>To</span>
      <input
        type="date"
        value={endDate}
        max={today}
        min={startDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="app-input text-sm font-medium"
        style={{ width: 'auto', minWidth: 140 }}
      />
    </div>
  );
}

// ─── Upgrade CTA ──────────────────────────────────────────────────────────────
function UpgradeCTA({ onBilling }) {
  return (
    <div className="ss-card p-12 text-center max-w-lg mx-auto mt-8">
      <div className="text-5xl mb-4">📊</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Reports are a Starter feature
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Unlock check-in analytics, member consistency leaderboards, blocker
        trends, and weekly report history with the Starter plan.
      </p>
      <ul className="text-left space-y-2 mb-8 inline-block">
        {[
          '📈 Daily & weekly check-in rates',
          '🏆 Member streak leaderboard',
          '🚧 Blocker open vs resolved trends',
          '⏰ Submission time heatmap',
          '📋 Weekly report history',
        ].map((f) => (
          <li key={f} className="text-sm flex gap-2" style={{ color: 'var(--text-muted)' }}>
            <span className="text-violet-400 shrink-0">✓</span> {f}
          </li>
        ))}
      </ul>
      <button onClick={onBilling} className="btn-primary w-full">
        Upgrade to Starter — $19/mo →
      </button>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children, accent }) {
  return (
    <div className="ss-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="shrink-0 rounded-full" style={{ width: 3, height: 22, background: accent || '#6D28D9' }} />
        <h2 className="font-bold" style={{ fontSize: 17, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Blocker status badge ─────────────────────────────────────────────────────
const BLOCKER_STATUS = {
  open:         { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', label: 'Open',         dot: true },
  acknowledged: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'Acknowledged', dot: true },
  in_progress:  { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', label: 'In Progress',  dot: true },
  resolved:     { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: 'Resolved',     dot: false },
};
function BlockerStatusBadge({ status }) {
  const s = BLOCKER_STATUS[status] || BLOCKER_STATUS.open;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />}
      {s.label}
    </span>
  );
}

// ─── Manager Reports View ─────────────────────────────────────────────────────
function ManagerReports({ teamId, teamName, startDate, endDate, onBillingRedirect }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState('');

  useEffect(() => {
    if (!teamId) return;
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    apiCall(`/reports/${teamId}/summary?${params.toString()}`)
      .then(setData)
      .catch((err) => {
        if (err.message?.toLowerCase().includes('upgrade') || err.message?.toLowerCase().includes('starter')) {
          setError('upgrade');
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [teamId, startDate, endDate]);

  useEffect(() => {
    if (!teamId) return;
    setTrendLoading(true);
    setTrendError('');
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    apiCall(`/reports/${teamId}/participation-trend?${params.toString()}`)
      .then(setTrendData)
      .catch((err) => setTrendError(err.message))
      .finally(() => setTrendLoading(false));
  }, [teamId, startDate, endDate]);

  if (loading) return <ReportsSkeleton />;
  if (error === 'upgrade') return <UpgradeCTA onBilling={onBillingRedirect} />;
  if (error) return <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mt-4">{error}</div>;
  if (!data) return null;

  const { overview, daily_rates, member_stats, blocker_trends, submission_times, weekly_summaries, period_days } = data;

  const dailyChart = daily_rates.map((d) => ({
    ...d,
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const weeklyChart = blocker_trends.map((w) => ({
    ...w,
    label: new Date(w.week + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const submissionChart = submission_times.map((s) => ({
    ...s,
    label: `${String(s.hour).padStart(2, '0')}:00`,
  }));

  const periodLabel = `${period_days}d`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={<IconBarChart />} iconBg="rgba(109,40,217,0.1)" iconColor="#7c3aed" label="Members" value={overview.total_members} />
          <StatCard icon={<IconCheckBadge />} iconBg="rgba(34,197,94,0.12)" iconColor="#22c55e" label={`Check-ins (${periodLabel})`} value={overview.total_checkins} />
          <StatCard icon={<IconSearch />} iconBg="rgba(96,165,250,0.12)" iconColor="#60a5fa" label="Avg Rate" value={`${overview.avg_checkin_rate}%`} />
          <StatCard icon={<IconBolt />} iconBg="rgba(251,146,60,0.12)" iconColor="#fb923c" label="Avg Streak" value={`${overview.avg_streak}d`} />
          <StatCard icon={<IconDiamond />} iconBg="rgba(248,113,113,0.12)" iconColor="#f87171" label="Open Blockers" value={overview.open_blockers} />
          <StatCard icon={<IconCheckBadge />} iconBg="rgba(34,197,94,0.1)" iconColor="#4ade80" label="Resolved" value={overview.resolved_blockers} />
        </div>

        <Section title={`📅 Daily Check-in Rate (${formatDateRangeLabel(startDate, endDate)})`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyChart} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} interval={Math.max(0, Math.floor(dailyChart.length / 10) - 1)} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [`${v}%`, 'Check-in Rate']} labelFormatter={(l) => `Date: ${l}`} />
              <Bar dataKey="rate" fill={CHART_COLORS.violet} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="🏆 Member Consistency Leaderboard">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="tbl-head pr-4">#</th>
                  <th className="tbl-head pr-4">Member</th>
                  <th className="tbl-head pr-4">Check-ins</th>
                  <th className="tbl-head pr-4">Rate</th>
                  <th className="tbl-head pr-4">Streak</th>
                  <th className="tbl-head">Avg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-card)' }}>
                {member_stats.map((m, idx) => (
                  <tr key={m.user_id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="py-3 pr-4 font-bold" style={{ color: idx === 0 ? '#fbbf24' : 'var(--text-muted)' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</td>
                    <td className="py-3 pr-4" style={{ color: 'var(--text-muted)' }}>{m.checkins}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(m.rate, 100)}%`, maxWidth: 80, minWidth: 4, background: m.rate >= 80 ? CHART_COLORS.green : m.rate >= 50 ? CHART_COLORS.amber : CHART_COLORS.red }} />
                        <span className="text-xs font-semibold" style={{ color: m.rate >= 80 ? CHART_COLORS.green : m.rate >= 50 ? CHART_COLORS.amber : CHART_COLORS.red }}>{m.rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {m.streak > 0 ? <span className="flex items-center gap-1 text-xs font-semibold text-orange-400">🔥 {m.streak}d</span> : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{m.avg_time ? `⏰ ${m.avg_time}` : '—'}</td>
                  </tr>
                ))}
                {member_stats.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No check-in data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title={`🚧 Blocker Trends (${formatDateRangeLabel(startDate, endDate)})`}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyChart} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
              <Line type="monotone" dataKey="opened" name="Opened" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.amber }} />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke={CHART_COLORS.green} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.green }} />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section title="📉 Participation Trend (4 Windows)">
          {trendLoading && <div className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>Calculating trends…</div>}
          {trendError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{trendError}</div>}
          {!trendLoading && !trendError && trendData && (
            <>
              {trendData.at_risk_count > 0 && (
                <div className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <span className="text-lg">⚠️</span>
                  <span style={{ color: '#fca5a5' }}>
                    <strong>{trendData.at_risk_count} member{trendData.at_risk_count !== 1 ? 's' : ''}</strong> at risk — declining check-in rate below 50% in recent period.
                  </span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="tbl-head pr-4">Member</th>
                      {trendData.members[0]?.week_labels?.map((label, i) => (
                        <th key={i} className="tbl-head pr-4">
                          {i === 3 ? <span style={{ color: '#a78bfa' }}>Latest ({label})</span> : label}
                        </th>
                      ))}
                      <th className="tbl-head">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border-card)' }}>
                    {trendData.members.map((m) => {
                      const trendColor = m.trend === 'declining' ? CHART_COLORS.red : m.trend === 'improving' ? CHART_COLORS.green : CHART_COLORS.amber;
                      const trendIcon = m.trend === 'declining' ? '↘' : m.trend === 'improving' ? '↗' : '→';
                      return (
                        <tr key={m.user_id} className="hover:bg-white/[0.025] transition-colors">
                          <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {m.name}
                            {m.at_risk && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>At Risk</span>}
                          </td>
                          {m.weekly_rates.map((rate, i) => (
                            <td key={i} className="py-3 pr-4">
                              <div className="flex flex-col gap-1 min-w-[56px]">
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(rate, 100)}%`, background: rate >= 80 ? CHART_COLORS.green : rate >= 50 ? CHART_COLORS.amber : CHART_COLORS.red }} />
                                </div>
                                <span className="text-xs font-semibold" style={{ color: rate >= 80 ? CHART_COLORS.green : rate >= 50 ? CHART_COLORS.amber : CHART_COLORS.red }}>{rate}%</span>
                              </div>
                            </td>
                          ))}
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${trendColor}1a`, color: trendColor }}>
                              {trendIcon} {m.trend.charAt(0).toUpperCase() + m.trend.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                * Trend based on check-in rate across 4 equal windows of the selected period. "At Risk" = declining trend AND latest window below 50%.
              </p>
            </>
          )}
        </Section>

        {submissionChart.length > 0 && (
          <Section title="⏰ Submission Time Distribution">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={submissionChart} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [v, 'Submissions']} />
                <Bar dataKey="count" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        )}

        <Section title="📋 Weekly Report History">
          <div className="space-y-3">
            {weekly_summaries.slice().reverse().map((w) => {
              const weekLabel = new Date(w.week_start + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const weekEndLabel = new Date(w.week_end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const rateColor = w.checkin_rate >= 80 ? CHART_COLORS.green : w.checkin_rate >= 50 ? CHART_COLORS.amber : CHART_COLORS.red;
              return (
                <div key={w.week_start} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-5 py-4 hover:bg-white/[0.02] transition-colors"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Week of {weekLabel} – {weekEndLabel}</p>
                    {w.top_member && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>⭐ Top member: <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{w.top_member}</span></p>}
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)', maxWidth: 200 }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(w.checkin_rate, 100)}%`, background: rateColor }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-center">
                      <p className="font-bold text-base" style={{ color: rateColor }}>{w.checkin_rate}%</p>
                      <p style={{ color: 'var(--text-muted)' }}>Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{w.total_checkins}</p>
                      <p style={{ color: 'var(--text-muted)' }}>Check-ins</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {weekly_summaries.length === 0 && <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No weekly data yet.</p>}
          </div>
        </Section>
    </div>
  );
}

// ─── Member Reports View ──────────────────────────────────────────────────────
function MemberReports({ startDate, endDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    apiCall(`/reports/my-stats?${params.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  if (loading) return <MemberReportsSkeleton />;
  if (error) return <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mt-4">{error}</div>;
  if (!data) return null;

  const { total_checkins, checkin_rate, current_streak, longest_streak, avg_submission_time, daily_checkins, submission_times, period_days } = data;

  const submissionChart = submission_times.map((s) => ({
    ...s,
    label: `${String(s.hour).padStart(2, '0')}:00`,
  }));

  const periodLabel = `${period_days}d`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<IconCheckBadge />} iconBg="rgba(34,197,94,0.12)" iconColor="#22c55e" label={`Check-ins (${periodLabel})`} value={total_checkins} />
        <StatCard icon={<IconBarChart />} iconBg="rgba(96,165,250,0.12)" iconColor="#60a5fa" label="Rate" value={`${checkin_rate}%`} />
        <StatCard icon={<IconBolt />} iconBg="rgba(251,146,60,0.12)" iconColor="#fb923c" label="Current Streak" value={`${current_streak}d`} />
        <StatCard icon={<IconSearch />} iconBg="rgba(109,40,217,0.1)" iconColor="#7c3aed" label="Best Streak" value={`${longest_streak}d`} />
      </div>

      {avg_submission_time && (
        <div className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm" style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>You typically check in around {avg_submission_time}</p>
            <p style={{ color: 'var(--text-muted)' }}>Based on {formatDateRangeLabel(startDate, endDate)}</p>
          </div>
        </div>
      )}

      <Section title={`📅 Check-ins (${formatDateRangeLabel(startDate, endDate)})`}>
        {daily_checkins.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data for this period yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {daily_checkins.map((d) => {
              const day = Number(d.date.slice(8));
              const monthLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
              return (
                <div key={d.date} title={d.date} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                  style={d.submitted ? { background: 'rgba(139,92,246,0.8)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)', opacity: 0.5 }}>
                  {day}
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> Submitted</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }} /> Missed</span>
        </div>
      </Section>

      {submissionChart.length > 0 && (
        <Section title="⏰ When You Check In">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={submissionChart} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v) => [v, 'Submissions']} />
              <Bar dataKey="count" fill={CHART_COLORS.violet} radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}
    </div>
  );
}

// ─── Reports Page Content ─────────────────────────────────────────────────────
function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTeamId = searchParams.get('team_id');

  const [user] = useState(() => getUser());
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(paramTeamId || '');
  const [teamsLoading, setTeamsLoading] = useState(true);

  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);

  const isManager = user?.role === 'manager';

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (isManager) {
      apiCall('/teams/')
        .then((data) => {
          const owned = (Array.isArray(data) ? data : []).filter((t) => t.user_role === 'owner');
          setTeams(owned);
          if (!selectedTeamId && owned.length > 0) setSelectedTeamId(owned[0].id);
        })
        .catch(() => {})
        .finally(() => setTeamsLoading(false));
    } else {
      setTeamsLoading(false);
    }
  }, []);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <Layout>
      <div className="ss-page">
      {/* Header */}
      <div className="ss-page-head">
        <div>
          <h1 className="ss-page-title">
            {isManager ? 'Team Reports' : 'My Reports'}
          </h1>
          <p className="ss-page-sub">
            {isManager ? 'Check-in analytics, cost visibility, and engagement health' : 'Your personal check-in analytics'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isManager && selectedTeamId && (
            <button
              onClick={() => router.push(`/reports/ai?team_id=${selectedTeamId}`)}
              className="ss-btn accent"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Radar
            </button>
          )}
        </div>
      </div>

        {/* Date range picker */}
        <div className="ss-card flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-muted)' }}>Date Range</span>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {formatDateRangeLabel(startDate, endDate)}
          </span>
        </div>

      {/* Manager: team selector */}
      {isManager && (
        <>
          {teamsLoading ? (
            <TeamsLoadingSkeleton />
          ) : teams.length === 0 ? (
            <div className="ss-card p-12 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>You don&apos;t own any teams yet.</p>
              <button onClick={() => router.push('/dashboard')} className="btn-primary text-sm">Go to Dashboard</button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} htmlFor="team-select">
                  Select Team
                </label>
                <div className="relative" style={{ display: 'inline-block', minWidth: 280 }}>
                  <select id="team-select" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="app-input font-medium appearance-none pr-9" style={{ fontSize: 13.5, minWidth: 280 }}>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}{t.plan === 'starter' ? '  •  Starter' : ''}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              {selectedTeamId && (
                <ManagerReports
                  key={selectedTeamId}
                  teamId={selectedTeamId}
                  teamName={selectedTeam?.name || ''}
                  startDate={startDate}
                  endDate={endDate}
                  onBillingRedirect={() => router.push(`/dashboard/billing?team_id=${selectedTeamId}`)}
                />
              )}
            </>
          )}
        </>
      )}

      {!isManager && <MemberReports startDate={startDate} endDate={endDate} />}
      </div>
    </Layout>
  );
}

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsContent />
    </Suspense>
  );
}
