'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { apiCall, getUser } from '../../../lib/api';

// ─── Small shared helpers (kept in-file to avoid disturbing /reports) ─────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function MemberAvatar({ name, size = 36 }) {
  const initials = getInitials(name);
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = ((name.charCodeAt(i) + ((hash << 5) - hash)) | 0);
  const hue = Math.abs(hash) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `hsl(${hue} 55% 82%)`, color: `hsl(${hue} 65% 28%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, letterSpacing: '-0.02em',
    }}>{initials}</div>
  );
}

// ─── Score → color band (glass effect) ────────────────────────────────────────
function scoreBand(score) {
  const s = Number(score) || 0;
  if (s >= 80) return { label: 'High',   accent: '#10b981', tint: 'rgba(16,185,129,0.18)',  border: 'rgba(16,185,129,0.35)',  text: '#34d399' };
  if (s >= 50) return { label: 'Medium', accent: '#f59e0b', tint: 'rgba(245,158,11,0.18)',  border: 'rgba(245,158,11,0.35)',  text: '#fbbf24' };
  if (s >= 30) return { label: 'Low',    accent: '#3b82f6', tint: 'rgba(59,130,246,0.16)',  border: 'rgba(59,130,246,0.30)',  text: '#60a5fa' };
  return          { label: 'Minimal', accent: '#f43f5e', tint: 'rgba(244,63,94,0.14)',   border: 'rgba(244,63,94,0.28)',   text: '#fb7185' };
}

function tierBadge(tier) {
  if (tier === 'P1') return { bg: 'rgba(16,185,129,0.18)', color: '#34d399', border: 'rgba(16,185,129,0.35)', label: 'P1 · High' };
  if (tier === 'P2') return { bg: 'rgba(245,158,11,0.18)', color: '#fbbf24', border: 'rgba(245,158,11,0.35)', label: 'P2 · Medium' };
  return { bg: 'rgba(148,163,184,0.18)', color: '#94a3b8', border: 'rgba(148,163,184,0.32)', label: 'P3 · Manual' };
}

// ─── Month grouping ───────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function groupByMonth(runs) {
  const groups = new Map();
  for (const r of runs) {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups.has(key)) groups.set(key, { key, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, runs: [] });
    groups.get(key).runs.push(r);
  }
  return Array.from(groups.values()).sort((a, b) => b.key.localeCompare(a.key));
}

function formatRunDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ─── Donut (pure SVG — no recharts dependency for a single metric) ────────────
function ScoreDonut({ score, size = 160, stroke = 14 }) {
  const band = scoreBand(score);
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Number(score) || 0));
  const dash = (pct / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(148,163,184,0.15)" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={band.accent} strokeWidth={stroke} fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{pct}%</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: band.text, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{band.label}</div>
      </div>
    </div>
  );
}

// ─── Upgrade CTA (Starter-only feature) ──────────────────────────────────────
function UpgradeCTA({ onBilling }) {
  return (
    <div className="app-card glow-card p-12 text-center max-w-xl mx-auto mt-6">
      <div className="text-5xl mb-4">⚡️</div>
      <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ai Task Radar is a Starter feature</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Upgrade to let StandupSync analyse your team&rsquo;s check-ins every week
        and surface concrete automation opportunities — no button-pressing required.
      </p>
      <button onClick={onBilling} className="btn-primary w-full">Upgrade to Starter →</button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1) Schedule strip (cadence / day / time / timezone / enabled)
// ═════════════════════════════════════════════════════════════════════════════
const DOW_OPTIONS = [
  { v: 0, label: 'Monday' },   { v: 1, label: 'Tuesday' }, { v: 2, label: 'Wednesday' },
  { v: 3, label: 'Thursday' }, { v: 4, label: 'Friday' },  { v: 5, label: 'Saturday' }, { v: 6, label: 'Sunday' },
];
const CADENCE_OPTIONS = [
  { v: 'weekly',   label: 'Weekly' },
  { v: 'biweekly', label: 'Every 2 weeks' },
  { v: 'monthly',  label: 'Monthly' },
];
const COMMON_TZ = [
  'Asia/Kolkata','America/Los_Angeles','America/New_York','Europe/London','Europe/Berlin','Asia/Singapore','Asia/Tokyo','Australia/Sydney','UTC',
];

const CADENCE_WINDOW = { weekly: 7, biweekly: 14, monthly: 30 };

function ScheduleStrip({ teamId, onChange, onRunComplete }) {
  const [schedule, setSchedule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancel = false;
    apiCall(`/ai-task-radar/${teamId}/schedule`)
      .then((s) => { if (!cancel) setSchedule(s); })
      .catch((e) => { if (!cancel) setError(e.message); });
    return () => { cancel = true; };
  }, [teamId]);

  if (error) {
    return <div className="app-card p-5 text-sm" style={{ color: '#f87171' }}>Couldn&rsquo;t load schedule: {error}</div>;
  }
  if (!schedule) return <Spinner />;

  function field(patch) {
    setSchedule((s) => ({ ...s, ...patch }));
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const payload = {
        cadence: schedule.cadence,
        day_of_week: schedule.day_of_week,
        week_of_month: schedule.cadence === 'monthly' ? (schedule.week_of_month || 1) : null,
        run_time: schedule.run_time,
        timezone: schedule.timezone,
        enabled: schedule.enabled,
      };
      const next = await apiCall(`/ai-task-radar/${teamId}/schedule`, 'PUT', payload);
      setSchedule(next);
      setSaved(true);
      onChange?.(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function runNow() {
    setRunning(true); setError(''); setRunResult(null);
    try {
      const windowDays = CADENCE_WINDOW[schedule.cadence] ?? 7;
      const result = await apiCall(`/ai-task-radar/${teamId}/run`, 'POST', { window_days: windowDays });
      setRunResult(result);
      onRunComplete?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  const band = scoreBand(schedule.enabled ? 80 : 10);

  return (
    <div
      className="app-card p-5 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.04))',
        borderColor: 'rgba(139,92,246,0.25)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full" style={{ width: 3, height: 22, background: band.accent }} />
        <h3 className="font-bold" style={{ fontSize: 16, color: 'var(--text-primary)' }}>Schedule</h3>
        <span
          className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: band.tint, border: `1px solid ${band.border}`, color: band.text }}
        >
          {schedule.enabled ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Cadence</label>
          <select value={schedule.cadence} onChange={(e) => field({ cadence: e.target.value })} className="app-input mt-1 w-full">
            {CADENCE_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Day</label>
          <select value={schedule.day_of_week} onChange={(e) => field({ day_of_week: Number(e.target.value) })} className="app-input mt-1 w-full">
            {DOW_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
        </div>
        {schedule.cadence === 'monthly' && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Week of month</label>
            <select value={schedule.week_of_month || 1} onChange={(e) => field({ week_of_month: Number(e.target.value) })} className="app-input mt-1 w-full">
              <option value={1}>1st</option><option value={2}>2nd</option><option value={3}>3rd</option><option value={4}>4th</option>
            </select>
          </div>
        )}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Time</label>
          <input type="time" value={schedule.run_time} onChange={(e) => field({ run_time: e.target.value })} className="app-input mt-1 w-full" />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Timezone</label>
          <select value={schedule.timezone} onChange={(e) => field({ timezone: e.target.value })} className="app-input mt-1 w-full">
            {COMMON_TZ.includes(schedule.timezone) ? null : <option value={schedule.timezone}>{schedule.timezone}</option>}
            {COMMON_TZ.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-card)' }}>
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" checked={schedule.enabled} onChange={(e) => field({ enabled: e.target.checked })} />
          Enabled
        </label>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Next run: <strong style={{ color: 'var(--text-primary)' }}>{formatDateTime(schedule.next_run_at)}</strong>
          {schedule.last_run_at && <span className="ml-3">Last run: <strong style={{ color: 'var(--text-primary)' }}>{formatDateTime(schedule.last_run_at)}</strong></span>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {saved && <span className="text-xs" style={{ color: '#34d399' }}>✓ Saved</span>}
          {error && <span className="text-xs" style={{ color: '#f87171' }}>{error}</span>}
          <button onClick={save} disabled={saving} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
            {saving ? 'Saving…' : 'Save schedule'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-card)' }}>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Trigger an analysis immediately using the last {CADENCE_WINDOW[schedule.cadence] ?? 7} days of data.
        </div>
        <div className="ml-auto flex items-center gap-3">
          {runResult && (
            <span className="text-xs" style={{ color: '#34d399' }}>
              ✓ Run started — score {runResult.team_score ?? '…'}
            </span>
          )}
          <button
            onClick={runNow}
            disabled={running}
            className="btn-secondary"
            style={{ padding: '8px 18px', fontSize: 13 }}
          >
            {running ? 'Running…' : 'Run now'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2) Integrations stub
// ═════════════════════════════════════════════════════════════════════════════
const INTEGRATION_META = {
  jira:   { icon: '/icons/jira.svg',   desc: 'Pull recurring ticket patterns from your Jira board.' },
  linear: { icon: '/icons/linear.svg', desc: 'Ingest cycle issues to surface repeated engineering toil.' },
  notion: { icon: '/icons/notion.svg', desc: 'Scan meeting notes for manual reporting patterns.' },
  sheets: { icon: '/icons/sheets.svg', desc: 'Sync task updates and blockers directly to your Google Sheet.' },
};

function IntegrationsPanel({ teamId }) {
  const [providers, setProviders] = useState(null);
  useEffect(() => {
    let cancel = false;
    apiCall(`/ai-task-radar/${teamId}/integrations`)
      .then((p) => { if (!cancel) setProviders(p); })
      .catch(() => { if (!cancel) setProviders([]); });
    return () => { cancel = true; };
  }, [teamId]);

  if (providers === null) return null;

  return (
    <div className="app-card p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full" style={{ width: 3, height: 22, background: '#8b5cf6' }} />
        <h3 className="font-bold" style={{ fontSize: 16, color: 'var(--text-primary)' }}>External sources</h3>
        <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(148,163,184,0.18)', color: '#94a3b8' }}>
          Coming soon
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {providers.map((p) => {
          const meta = INTEGRATION_META[p.provider] || { icon: null, desc: '' };
          return (
            <div
              key={p.provider}
              className="rounded-xl p-4 transition-all"
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                opacity: p.status === 'coming_soon' ? 0.78 : 1,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {meta.icon ? (
                  <img src={meta.icon} alt={p.label} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
                ) : (
                  <span style={{ fontSize: 20 }}>🔌</span>
                )}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: p.status === 'coming_soon' ? '#94a3b8' : '#34d399' }}>
                  {p.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)', lineHeight: 1.45 }}>{meta.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3) History list (grouped by month)
// ═════════════════════════════════════════════════════════════════════════════
function HistoryList({ teamId, onSelect }) {
  const [runs, setRuns] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    apiCall(`/ai-task-radar/${teamId}/history`)
      .then((r) => { if (!cancel) setRuns(r); })
      .catch((e) => { if (!cancel) setError(e.message); });
    return () => { cancel = true; };
  }, [teamId]);

  if (error) return <div className="app-card p-5 text-sm" style={{ color: '#f87171' }}>{error}</div>;
  if (runs === null) return <Spinner />;

  if (runs.length === 0) {
    return (
      <div className="app-card p-10 text-center">
        <div className="text-4xl mb-3">📡</div>
        <h3 className="font-semibold" style={{ fontSize: 16, color: 'var(--text-primary)' }}>No analyses yet</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Enable the schedule above — your first report will run immediately.
        </p>
      </div>
    );
  }

  const groups = groupByMonth(runs);

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.key}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>{g.label}</h3>
            <div className="flex-1 h-px" style={{ background: 'var(--border-card)' }} />
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{g.runs.length} report{g.runs.length === 1 ? '' : 's'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {g.runs.map((r) => {
              const band = scoreBand(r.team_score || 0);
              return (
                <button
                  key={r.id}
                  onClick={() => onSelect(r)}
                  className="text-left app-card p-4 transition-all hover:scale-[1.01]"
                  style={{ borderColor: band.border }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl flex items-center justify-center font-bold"
                         style={{ width: 54, height: 54, background: band.tint, color: band.text, border: `1px solid ${band.border}` }}>
                      {r.is_empty ? '—' : `${r.team_score || 0}%`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatRunDate(r.created_at)}</span>
                        {r.trigger && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                style={{ background: 'rgba(148,163,184,0.14)', color: '#94a3b8' }}>
                            {r.trigger === 'scheduled' ? 'auto' : r.trigger}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {r.is_empty ? 'No check-in data in this window.' : (r.summary_text || 'Analysis complete.')}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span>{r.member_count || 0} member{r.member_count === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span>{r.task_count || 0} task{r.task_count === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span>{r.window_days}d window</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4) Team overview (detail view of a single run)
// ═════════════════════════════════════════════════════════════════════════════
function TaskCard({ task }) {
  const badge = tierBadge(task.tier);
  const band = scoreBand(task.automation_score);
  return (
    <div
      className="rounded-xl p-4 backdrop-blur-xl"
      style={{ background: 'var(--bg-card)', border: `1px solid ${band.border}` }}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg flex items-center justify-center font-bold shrink-0"
             style={{ width: 46, height: 46, background: band.tint, color: band.text, border: `1px solid ${band.border}` }}>
          {task.automation_score}%
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
              {badge.label}
            </span>
            {task.assigned_name && (
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Assigned to <strong style={{ color: 'var(--text-primary)' }}>{task.assigned_name}</strong></span>
            )}
          </div>
          <h4 className="font-semibold mt-1" style={{ color: 'var(--text-primary)', fontSize: 15 }}>{task.task_title}</h4>
          {task.task_description && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{task.task_description}</p>
          )}

          {/* P1 — suggested tools with prompts */}
          {task.tier === 'P1' && Array.isArray(task.suggested_tools) && task.suggested_tools.length > 0 && (
            <div className="mt-3 space-y-2">
              {task.suggested_tools.map((tool, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color: '#34d399' }}>🛠️ {tool.name}</span>
                  </div>
                  {tool.prompt && (
                    <pre className="text-xs mt-1 whitespace-pre-wrap font-mono" style={{ color: 'var(--text-secondary)' }}>{tool.prompt}</pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* P2 — general suggestion */}
          {task.tier === 'P2' && task.general_suggestion && (
            <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>💡 {task.general_suggestion}</p>
            </div>
          )}

          {/* P3 — workflow */}
          {task.tier === 'P3' && task.suggested_workflow && (
            <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <p className="text-xs whitespace-pre-wrap" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>📋 {task.suggested_workflow}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PersonCard({ member, onClick }) {
  const band = scoreBand(member.member_score);
  return (
    <button
      onClick={onClick}
      className="text-left app-card p-4 transition-all hover:scale-[1.015] backdrop-blur-xl"
      style={{ borderColor: band.border, background: `linear-gradient(135deg, ${band.tint}, transparent)` }}
    >
      <div className="flex items-center gap-3">
        <MemberAvatar name={member.name} size={42} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{member.name}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{member.task_count} task{member.task_count === 1 ? '' : 's'}</div>
        </div>
        <div className="text-right">
          <div className="font-bold" style={{ fontSize: 22, color: band.text, letterSpacing: '-0.02em' }}>{member.member_score}%</div>
          <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: band.text }}>{band.label}</div>
        </div>
      </div>
    </button>
  );
}

function AnalysisDetail({ teamId, analysisId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [memberKey, setMemberKey] = useState(null); // null = all, otherwise filters
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    let cancel = false;
    apiCall(`/ai-task-radar/${teamId}/analyses/${analysisId}`)
      .then((d) => { if (!cancel) setDetail(d); })
      .catch((e) => { if (!cancel) setError(e.message); });
    return () => { cancel = true; };
  }, [teamId, analysisId]);

  const filteredTasks = useMemo(() => {
    if (!detail) return [];
    if (!memberKey) return detail.tasks;
    return detail.tasks.filter((t) => (t.user_id && t.user_id === memberKey) || t.assigned_name === memberKey);
  }, [memberKey, detail]);

  if (error) return <div className="app-card p-5 text-sm" style={{ color: '#f87171' }}>{error}</div>;
  if (!detail) return <Spinner />;

  const band = scoreBand(detail.team_score || 0);
  const activeMember = memberKey
    ? detail.members.find((m) => (m.user_id && m.user_id === memberKey) || m.name === memberKey)
    : null;

  return (
    <div className="space-y-6">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onBack} className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M8 2L4 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          All reports
        </button>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>· {formatRunDate(detail.created_at)}</span>
        {memberKey && activeMember && (
          <>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>·</span>
            <button onClick={() => setMemberKey(null)} className="text-sm font-semibold" style={{ color: '#a78bfa' }}>
              {activeMember.name}
            </button>
          </>
        )}
      </div>

      {/* Empty-run banner */}
      {detail.is_empty && (
        <div className="rounded-xl p-5 backdrop-blur-xl"
             style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <h3 className="font-semibold" style={{ color: '#fbbf24' }}>No data in this window</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            No one submitted check-ins during this period — so there&rsquo;s nothing for Ai Task Radar to analyse yet.
            Encourage your team to complete their daily stand-ups and the next scheduled run will light this up.
          </p>
        </div>
      )}

      {/* Team overview header */}
      {!detail.is_empty && (
        <div
          className="app-card p-6 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${band.tint}, transparent 65%)`,
            borderColor: band.border,
          }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <ScoreDonut score={detail.team_score || 0} size={170} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: band.tint, color: band.text, border: `1px solid ${band.border}` }}>
                  Team automation score
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ background: 'rgba(148,163,184,0.14)', color: '#94a3b8' }}>
                  {detail.window_days}d window · {detail.trigger}
                </span>
              </div>
              <h2 className="font-bold mb-2" style={{ fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {formatRunDate(detail.created_at)} overview
              </h2>
              {detail.summary_text && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>{detail.summary_text}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{detail.member_count || detail.members.length} members</span>
                <span>·</span>
                <span>{detail.task_count || detail.tasks.length} tasks surfaced</span>
              </div>
              <button
                onClick={() => { setShowAllTasks((v) => !v); setMemberKey(null); }}
                className="mt-4 text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}
              >
                {showAllTasks ? 'Hide tasks' : 'See all tasks →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All-team task list (opened from Team card) */}
      {!detail.is_empty && showAllTasks && !memberKey && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="app-card p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No tasks surfaced this week.</div>
          ) : filteredTasks.map((t, i) => (
            <div key={t.id}>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Task {i + 1}{t.assigned_name ? ` — Assigned to ${t.assigned_name}` : ''} · <span style={{ color: scoreBand(t.automation_score).text }}>{t.automation_score}%</span>
              </div>
              <TaskCard task={t} />
            </div>
          ))}
        </div>
      )}

      {/* Person filter task list */}
      {!detail.is_empty && memberKey && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-2">
            {activeMember && <MemberAvatar name={activeMember.name} size={40} />}
            <div className="flex-1">
              <h3 className="font-bold" style={{ fontSize: 18, color: 'var(--text-primary)' }}>{activeMember?.name || 'Member'}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {filteredTasks.length} task{filteredTasks.length === 1 ? '' : 's'} · member score {activeMember?.member_score ?? 0}%
              </p>
            </div>
          </div>
          {filteredTasks.map((t, i) => (
            <div key={t.id}>
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Task {i + 1} · <span style={{ color: scoreBand(t.automation_score).text }}>{t.automation_score}%</span>
              </div>
              <TaskCard task={t} />
            </div>
          ))}
        </div>
      )}

      {/* Person cards grid */}
      {!detail.is_empty && !memberKey && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--text-muted)' }}>Per-member automation potential</h3>
          {detail.members.length === 0 ? (
            <div className="app-card p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No per-member breakdown available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {detail.members.map((m) => (
                <PersonCard
                  key={(m.user_id || m.name)}
                  member={m}
                  onClick={() => { setMemberKey(m.user_id || m.name); setShowAllTasks(false); }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Page shell
// ═════════════════════════════════════════════════════════════════════════════
function AiTaskRadarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTeamId = searchParams.get('team_id');
  const [user] = useState(() => getUser());

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(paramTeamId || '');
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [planBlocked, setPlanBlocked] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  const isManager = user?.role === 'manager';

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (!isManager) { setTeamsLoading(false); return; }
    apiCall('/teams/')
      .then((data) => {
        const owned = (Array.isArray(data) ? data : []).filter((t) => t.user_role === 'owner');
        setTeams(owned);
        if (!selectedTeamId && owned.length > 0) setSelectedTeamId(owned[0].id);
      })
      .catch(() => {})
      .finally(() => setTeamsLoading(false));
  }, []);

  // Detect Starter-plan gate after first schedule fetch — we bubble a signal up.
  useEffect(() => {
    if (!selectedTeamId) return;
    setPlanBlocked(false);
    apiCall(`/ai-task-radar/${selectedTeamId}/schedule`).catch((e) => {
      if (/starter/i.test(e.message || '')) setPlanBlocked(true);
    });
  }, [selectedTeamId]);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  if (!user) return null;

  if (!isManager) {
    return (
      <Layout>
        <div className="app-card p-12 text-center max-w-lg mx-auto mt-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="font-semibold" style={{ fontSize: 18, color: 'var(--text-primary)' }}>Manager access only</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Ai Task Radar is available to team managers.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-xl"
                style={{ background: 'rgba(139,92,246,0.18)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)' }}
              >
                AI
              </span>
              <h1 className="font-bold" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                Ai Task Radar
              </h1>
            </div>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Weekly AI analysis of your team&rsquo;s check-ins — surfaces recurring tasks and ranks their automation potential.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => router.push(`/reports${selectedTeamId ? `?team_id=${selectedTeamId}` : ''}`)}
              className="flex items-center gap-2 text-sm font-medium transition-all"
              style={{ padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border-card)', background: 'var(--bg-card)', color: 'var(--text-muted)' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2L4 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Reports
            </button>
          </div>
        </div>
      </div>

      {teamsLoading ? (
        <Spinner />
      ) : teams.length === 0 ? (
        <div className="app-card p-10 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold" style={{ fontSize: 17, color: 'var(--text-primary)' }}>No teams yet</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Create a team from the dashboard to unlock Ai Task Radar.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Team picker */}
          <div className="flex items-center gap-3 flex-wrap">
            <label htmlFor="team-select" className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Team</label>
            <select
              id="team-select"
              value={selectedTeamId}
              onChange={(e) => { setSelectedTeamId(e.target.value); setSelectedRunId(null); }}
              className="app-input font-medium appearance-none pr-9"
              style={{ fontSize: 13.5, minWidth: 240 }}
            >
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            {selectedTeam && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Plan: <strong style={{ color: 'var(--text-primary)' }}>{selectedTeam.plan}</strong>
              </span>
            )}
          </div>

          {planBlocked ? (
            <UpgradeCTA onBilling={() => router.push(`/dashboard/billing?team_id=${selectedTeamId}`)} />
          ) : selectedTeamId ? (
            selectedRunId ? (
              <AnalysisDetail
                teamId={selectedTeamId}
                analysisId={selectedRunId}
                onBack={() => setSelectedRunId(null)}
              />
            ) : (
              <>
                <ScheduleStrip teamId={selectedTeamId} onChange={() => {}} onRunComplete={() => setHistoryKey((k) => k + 1)} />
                <IntegrationsPanel teamId={selectedTeamId} />
                <div>
                  <h3 className="font-bold mb-3" style={{ fontSize: 16, color: 'var(--text-primary)' }}>Report history</h3>
                  <HistoryList key={historyKey} teamId={selectedTeamId} onSelect={(r) => setSelectedRunId(r.id)} />
                </div>
              </>
            )
          ) : null}
        </div>
      )}
    </Layout>
  );
}

export default function AiTaskRadarPage() {
  return (
    <Suspense fallback={<Layout><Spinner /></Layout>}>
      <AiTaskRadarContent />
    </Suspense>
  );
}
