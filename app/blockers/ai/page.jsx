'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { apiCall, getUser } from '../../../lib/api';

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Member avatar ────────────────────────────────────────────────────────────
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

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children, accent }) {
  return (
    <div className="app-card glow-card p-6">
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

// ─── Date helpers ─────────────────────────────────────────────────────────────
const CHART_COLORS = { violet: '#8b5cf6', green: '#4ade80', amber: '#fbbf24', red: '#f87171', blue: '#60a5fa' };

function toISODate(d) { return d.toISOString().slice(0, 10); }
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

function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
  const today = toISODate(new Date());
  const minDate = getMinDate();
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>From</span>
      <input type="date" value={startDate} max={endDate} min={minDate} onChange={(e) => onStartChange(e.target.value)} className="app-input text-sm font-medium" style={{ width: 'auto', minWidth: 140 }} />
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>To</span>
      <input type="date" value={endDate} max={today} min={startDate} onChange={(e) => onEndChange(e.target.value)} className="app-input text-sm font-medium" style={{ width: 'auto', minWidth: 140 }} />
    </div>
  );
}

// ─── Month helpers ────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function buildMonthOptions() {
  const now = new Date();
  const options = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` });
  }
  return options;
}

// ─── Upgrade CTA ──────────────────────────────────────────────────────────────
function UpgradeCTA({ onBilling }) {
  return (
    <div className="app-card glow-card p-12 text-center max-w-lg mx-auto mt-8">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Blocker Intelligence is a Starter feature</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        See live blocked cost, monthly rollups per member, and blocker trends with the Starter plan.
      </p>
      <button onClick={onBilling} className="btn-primary w-full">Upgrade to Starter — $19/mo →</button>
    </div>
  );
}

// ─── Blocker Intelligence View ────────────────────────────────────────────────
function BlockerIntelligenceView({ teamId, startDate, endDate }) {
  const router = useRouter();
  const [blockedData, setBlockedData] = useState(null);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [blockedError, setBlockedError] = useState('');
  const [tick, setTick] = useState(0);
  const monthOptions = buildMonthOptions();
  const currentMonthOption = monthOptions[monthOptions.length - 1];
  const [selectedYear, setSelectedYear] = useState(currentMonthOption.year);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthOption.month);
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState('');

  useEffect(() => {
    if (!teamId) return;
    setBlockedLoading(true);
    setBlockedError('');
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    apiCall(`/reports/${teamId}/blocked-cost?${params.toString()}`)
      .then(setBlockedData)
      .catch((err) => setBlockedError(err.message))
      .finally(() => setBlockedLoading(false));
  }, [teamId, startDate, endDate]);

  useEffect(() => {
    if (!blockedData) return;
    const hasLive = blockedData.active_blockers.some((b) => b.hourly_rate_usd != null);
    if (!hasLive) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [blockedData]);

  useEffect(() => {
    if (!teamId) return;
    setMonthlyLoading(true);
    setMonthlyError('');
    setMonthlyData(null);
    apiCall(`/reports/${teamId}/monthly-cost?year=${selectedYear}&month=${selectedMonth}`)
      .then(setMonthlyData)
      .catch((err) => setMonthlyError(err.message))
      .finally(() => setMonthlyLoading(false));
  }, [teamId, selectedYear, selectedMonth]);

  function computeLiveCost(b) {
    if (b.hourly_rate_usd == null) return null;
    const hoursOpen = (Date.now() - new Date(b.created_at_iso)) / 3_600_000;
    return b.hourly_rate_usd * hoursOpen;
  }

  const fmtCost = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (blockedLoading) return <Spinner />;
  if (blockedError) {
    if (blockedError.toLowerCase().includes('upgrade') || blockedError.toLowerCase().includes('starter')) {
      return <UpgradeCTA onBilling={() => router.push(`/dashboard/billing?team_id=${teamId}`)} />;
    }
    return <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mt-4">{blockedError}</div>;
  }
  if (!blockedData) return null;

  const liveTotalCost = blockedData.active_blockers.reduce((sum, b) => sum + (computeLiveCost(b) ?? 0), 0);

  return (
    <div className="space-y-6">
      <Section title="🚧 Blocker Intelligence">
        {blockedData.active_blockers.length === 0 ? (
          <div className="rounded-xl px-5 py-4 text-sm flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <span className="text-lg">✅</span>
            <span style={{ color: '#86efac' }}>No open blockers right now. Your team is unblocked and shipping!</span>
          </div>
        ) : (
          <>
            {(blockedData.summary.resolved_last_30d > 0 || blockedData.summary.avg_resolution_label != null) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {blockedData.summary.resolved_last_30d > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                    ✓ {blockedData.summary.resolved_last_30d} resolved in period
                  </span>
                )}
                {blockedData.summary.avg_resolution_label != null && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
                    ⏱ Avg resolution: {blockedData.summary.avg_resolution_label}
                  </span>
                )}
              </div>
            )}
            <div className="overflow-x-auto rounded-xl mb-5" style={{ border: '1px solid var(--border-card)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(139,92,246,0.05)', borderBottom: '1px solid var(--border-card)' }}>
                    {['Member','Blocker','Status','Days Open','Reported','Blocked Cost (USD)'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blockedData.active_blockers.map((b, idx) => {
                    const liveCost = computeLiveCost(b);
                    return (
                      <tr key={b.blocker_id} onClick={() => router.push(`/blockers?team_id=${teamId}&blocker_id=${b.blocker_id}`)} className="cursor-pointer transition-colors"
                        style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border-card)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
                          <div className="flex items-center gap-2"><MemberAvatar name={b.reporter_name} size={28} /><span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{b.reporter_name}</span></div>
                        </td>
                        <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--text-primary)', maxWidth: '220px' }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.title}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap"><BlockerStatusBadge status={b.status} /></td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md"
                            style={{ color: b.hours_open >= 72 ? CHART_COLORS.red : b.hours_open >= 24 ? CHART_COLORS.amber : 'var(--text-primary)', background: b.hours_open >= 72 ? 'rgba(239,68,68,0.1)' : b.hours_open >= 24 ? 'rgba(251,191,36,0.1)' : 'rgba(139,92,246,0.08)' }}>
                            {b.duration_label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{b.created_at}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-extrabold font-mono" style={{ color: liveCost != null ? CHART_COLORS.amber : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                            {liveCost != null ? fmtCost(liveCost) : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {liveTotalCost > 0 && (
              <div className="rounded-2xl flex flex-wrap items-center justify-between gap-4" style={{ background: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.22)', padding: '18px 22px', marginTop: 16 }}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 0 3px rgba(239,68,68,0.2)', animation: 'livePulse 1.5s ease-in-out infinite' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#f87171' }}>Live Blocked Cost — Ticking Now</span>
                  </div>
                  <div className="font-extrabold font-mono leading-none mb-1.5" style={{ fontSize: 30, color: '#fca5a5', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                    {fmtCost(liveTotalCost)} <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.7 }}>USD</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(252,165,165,0.75)' }}>
                    Across {blockedData.summary.active_count} active blocker{blockedData.summary.active_count !== 1 ? 's' : ''}. Resolving them today stops this meter.
                  </p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); router.push(`/blockers?team_id=${teamId}`); }} className="shrink-0 text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
                  style={{ padding: '10px 18px', background: 'var(--bg-card)', color: '#fca5a5', border: '1.5px solid rgba(239,68,68,0.32)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; }}>
                  Go to Blockers board
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            )}
          </>
        )}
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          * Blocked cost = hours open × hourly rate. This is real, ongoing lost productivity.
        </p>
      </Section>

      <Section title="📅 Monthly Blocked Cost">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Select month</span>
          <select className="app-input text-sm font-semibold" style={{ width: 'auto', minWidth: '165px' }} value={`${selectedYear}-${selectedMonth}`}
            onChange={(e) => { const [y, m] = e.target.value.split('-').map(Number); setSelectedYear(y); setSelectedMonth(m); }}>
            {monthOptions.map((o) => <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>{o.label}</option>)}
          </select>
        </div>
        {monthlyLoading && <Spinner />}
        {monthlyError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{monthlyError}</div>}
        {!monthlyLoading && monthlyData && (
          monthlyData.blocker_count === 0 ? (
            <div className="rounded-xl px-5 py-4 text-sm flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <span className="text-lg">✅</span>
              <span style={{ color: '#86efac' }}>No blocker cost recorded for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}.</span>
            </div>
          ) : (
            <>
              <div className="rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.04) 100%)', border: '1px solid rgba(251,191,36,0.28)' }}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-0.5">💸</span>
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#fbbf24' }}>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(251,191,36,0.15)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.3)' }}>
                        {monthlyData.blocker_count} blocker{monthlyData.blocker_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold font-mono leading-none mb-2" style={{ color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>{fmtCost(monthlyData.total_cost_usd)} USD</div>
                    <p className="text-xs" style={{ color: 'rgba(251,191,36,0.6)' }}>Lost to blockers active in this month · only hours within month boundaries are counted</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border-card)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'rgba(139,92,246,0.05)', borderBottom: '1px solid var(--border-card)' }}>
                      {['Member','Blockers','Count','Cost (USD)'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.members.map((m, i) => (
                      <tr key={i} className="transition-colors" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-card)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><MemberAvatar name={m.member_name} size={28} /><span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.member_name}</span></div></td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {(m.blockers || []).map((blk) => (
                              <button key={blk.id} onClick={() => router.push(`/blockers?team_id=${teamId}&blocker_id=${blk.id}`)} className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all text-left"
                                style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.28)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.22)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.28)'; }}
                                title={blk.title}>{blk.title}</button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{m.blocker_count}</td>
                        <td className="px-4 py-4 whitespace-nowrap"><span className="text-sm font-extrabold font-mono" style={{ color: CHART_COLORS.amber, fontVariantNumeric: 'tabular-nums' }}>{fmtCost(m.cost_usd)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
        )}
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          * Only hours a blocker was active within the selected month are counted.
        </p>
      </Section>
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
function BlockerIntelligencePageContent() {
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
    if (!isManager) {
      setTeamsLoading(false);
      return;
    }
    apiCall('/teams/')
      .then((data) => {
        const owned = (Array.isArray(data) ? data : []).filter((t) => t.user_role === 'owner');
        setTeams(owned);
        if (!selectedTeamId && owned.length > 0) setSelectedTeamId(owned[0].id);
      })
      .catch(() => {})
      .finally(() => setTeamsLoading(false));
  }, []);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  if (!isManager) {
    return (
      <Layout>
        <div className="app-card glow-card p-12 text-center max-w-lg mx-auto mt-8">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Manager-only area</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Blocker Intelligence is visible to team owners. Ask your manager to share insights with you.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-bold" style={{ fontSize: 26, letterSpacing: '-0.03em', lineHeight: 1.2, color: 'var(--text-primary)' }}>Blocker Intelligence</h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>Live blocked cost and monthly rollups per member</p>
          </div>
          <button onClick={() => router.push('/blockers' + (selectedTeamId ? `?team_id=${selectedTeamId}` : ''))}
            className="flex items-center gap-2 text-sm font-medium self-start sm:self-auto transition-all"
            style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2L4 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Blockers board
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
          <span className="text-xs font-bold uppercase tracking-wider shrink-0" style={{ color: 'var(--text-muted)' }}>Date Range</span>
          <DateRangePicker startDate={startDate} endDate={endDate} onStartChange={setStartDate} onEndChange={setEndDate} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{formatDateRangeLabel(startDate, endDate)}</span>
        </div>
      </div>

      {teamsLoading ? (
        <Spinner />
      ) : teams.length === 0 ? (
        <div className="app-card glow-card p-12 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>You don&apos;t own any teams yet.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary text-sm">Go to Dashboard</button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block mb-1.5" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }} htmlFor="team-select">Select Team</label>
            <div className="relative" style={{ display: 'inline-block', minWidth: 280 }}>
              <select id="team-select" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="app-input font-medium appearance-none pr-9" style={{ fontSize: 13.5, minWidth: 280 }}>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}{t.plan === 'starter' ? '  •  Starter' : ''}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>

          {selectedTeamId && (
            <BlockerIntelligenceView
              key={selectedTeamId}
              teamId={selectedTeamId}
              startDate={startDate}
              endDate={endDate}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default function BlockerIntelligencePage() {
  return (
    <Suspense>
      <BlockerIntelligencePageContent />
    </Suspense>
  );
}
