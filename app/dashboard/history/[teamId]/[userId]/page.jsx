'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Layout from '../../../../../components/Layout';
import { apiCall } from '../../../../../lib/api';

// ─── Utilities ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Build array of date strings [oldest … today] for the window
function buildDateWindow(days) {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(toISO(d));
  }
  return result; // ascending, oldest first
}

// ─── Calendar Grid (last 30 days) ────────────────────────────────────────────
function CalendarGrid({ dateWindow, checkinMap, selectedDate, onSelect }) {
  const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = toISO(new Date());

  // Pad start so grid aligns to correct weekday
  const firstDow = new Date(dateWindow[0] + 'T00:00:00').getDay();
  const cells = [
    ...Array(firstDow).fill(null),
    ...dateWindow,
  ];

  return (
    <div>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((key, i) => {
          if (!key) return <div key={`pad-${i}`} />;
          const submitted = !!checkinMap[key];
          const isToday = key === today;
          const isSelected = key === selectedDate;
          const dayNum = Number(key.slice(8));
          return (
            <button
              key={key}
              onClick={() => submitted ? onSelect(isSelected ? null : key) : null}
              disabled={!submitted}
              title={submitted ? formatFullDate(key) : 'No check-in'}
              className={[
                'aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-200',
                isSelected
                  ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-1 scale-105'
                  : submitted
                    ? 'bg-violet-500/80 text-white hover:bg-violet-500 cursor-pointer hover:scale-105'
                    : 'opacity-40 cursor-default',
                isToday && !submitted ? 'ring-2 ring-violet-400/60 ring-offset-1' : '',
              ].join(' ')}
              style={!submitted ? { background: 'var(--bg-card)', color: 'var(--text-muted)' } : {}}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week Strip (last 7 days) ─────────────────────────────────────────────────
function WeekStrip({ dateWindow, checkinMap, selectedDate, onSelect }) {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = toISO(new Date());

  return (
    <div className="grid grid-cols-7 gap-2">
      {dateWindow.map((key) => {
        const submitted = !!checkinMap[key];
        const isToday = key === today;
        const isSelected = key === selectedDate;
        const dow = new Date(key + 'T00:00:00').getDay();
        const dayNum = Number(key.slice(8));
        return (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{DAY_LABELS[dow]}</span>
            <button
              onClick={() => submitted ? onSelect(isSelected ? null : key) : null}
              disabled={!submitted}
              title={submitted ? formatFullDate(key) : 'No check-in'}
              className={[
                'w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200',
                isSelected
                  ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-1 scale-110'
                  : submitted
                    ? 'bg-violet-500/80 text-white hover:bg-violet-500 cursor-pointer'
                    : '',
                isToday && !submitted ? 'ring-2 ring-violet-400/60 ring-offset-1' : '',
              ].join(' ')}
              style={!submitted ? { background: 'var(--bg-card)', color: 'var(--text-muted)', opacity: 0.45 } : {}}
            >
              {dayNum}
            </button>
            {/* Dot indicator */}
            <div className={`w-1.5 h-1.5 rounded-full ${submitted ? 'bg-violet-400' : 'bg-transparent'}`} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Single Check-in Entry Card ───────────────────────────────────────────────
function CheckinCard({ entry, isHighlighted, cardRef }) {
  const dateLabel = formatFullDate(entry.date);
  const hasAnswers = entry.answers && entry.answers.length > 0;

  return (
    <div
      ref={cardRef}
      className={[
        'rounded-2xl p-5 text-sm transition-all duration-300',
        isHighlighted ? 'ring-2 ring-violet-400 scale-[1.01]' : '',
      ].join(' ')}
      style={isHighlighted
        ? { background: 'rgba(109,40,217,0.2)', border: '1px solid rgba(139,92,246,0.5)' }
        : { background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{dateLabel}</span>
        </div>
        {entry.submitted_at && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
            {formatTime(entry.submitted_at)}
          </span>
        )}
      </div>

      {/* Answers */}
      {hasAnswers ? (
        <div className="space-y-3">
          {entry.answers.map((a, i) => {
            if (a.is_blocker_type) {
              if (!a.answer || !a.answer.trim()) return null;
              return (
                <div key={a.question_id} className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>{a.question_label}</p>
                  <p className="flex items-start gap-2" style={{ color: '#fbbf24' }}>
                    <span className="mt-0.5 shrink-0">●</span>
                    <span>{a.answer}</span>
                  </p>
                </div>
              );
            }
            const iconColor = i === 0 ? '#4ade80' : '#a78bfa';
            const icon = i === 0 ? '✓' : '⚡';
            return (
              <div key={a.question_id}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{a.question_label}</p>
                <p className="flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: iconColor }}>{icon}</span>
                  <span>{a.answer || <em style={{ opacity: 0.5 }}>—</em>}</span>
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* Legacy fallback */
        <div className="space-y-2.5" style={{ color: 'var(--text-muted)' }}>
          {entry.yesterday && (
            <p><span className="font-medium" style={{ color: 'var(--text-primary)' }}>Yesterday: </span>{entry.yesterday}</p>
          )}
          {entry.today && (
            <p><span className="font-medium" style={{ color: 'var(--text-primary)' }}>Today: </span>{entry.today}</p>
          )}
          {entry.blockers && (
            <div className="rounded-xl p-3 mt-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>Blockers</p>
              <p style={{ color: '#fbbf24' }}>● {entry.blockers}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Free Plan Upgrade Banner ─────────────────────────────────────────────────
function UpgradeBanner({ teamId }) {
  const router = useRouter();
  return (
    <div
      className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
    >
      <div>
        <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
          🔒 30-day history is a Starter feature
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Upgrade to Starter to unlock full 30-day check-in history for all team members.
        </p>
      </div>
      <button
        onClick={() => router.push(`/dashboard/billing?team_id=${teamId}`)}
        className="shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: '#fff' }}
      >
        Upgrade →
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MemberHistoryPage() {
  const router = useRouter();
  const { teamId, userId } = useParams();
  const searchParams = useSearchParams();
  const memberName = searchParams.get('name') || 'Member';

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const cardRefs = useRef({});

  const isPaid = team?.plan === 'starter' && team?.plan_status === 'active';
  const days = isPaid ? 30 : 7;

  useEffect(() => {
    if (!teamId || !userId) return;
    loadData();
  }, [teamId, userId]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [teamsData, historyData] = await Promise.all([
        apiCall('/teams/').catch(() => []),
        // Fetch with the max days; backend enforces plan limits
        apiCall(`/checkin/${teamId}/history/${userId}?days=30`).catch(() => []),
      ]);
      const found = Array.isArray(teamsData) ? teamsData.find((t) => t.id === teamId) : null;
      setTeam(found || null);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const checkinMap = useMemo(() => {
    const m = {};
    history.forEach((entry) => { m[entry.date] = entry; });
    return m;
  }, [history]);

  // Date window: after team loads, recompute
  const dateWindow = useMemo(() => buildDateWindow(days), [days]);

  const submittedCount = history.length;
  const completionRate = days > 0 ? Math.round((submittedCount / days) * 100) : 0;

  // Scroll selected card into view
  useEffect(() => {
    if (selectedDate && cardRefs.current[selectedDate]) {
      cardRefs.current[selectedDate].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDate]);

  const periodLabel = isPaid ? 'Last 30 Days' : 'Last 7 Days';

  return (
    <Layout>
      {/* Back navigation */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors hover:opacity-80 btn-ghost py-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </button>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }}
          >
            {memberName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{memberName}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Check-in history · {team?.name || ''}
            </p>
          </div>
        </div>
        {/* Plan badge */}
        {team && (
          <span
            className="self-start text-xs font-semibold px-3 py-1 rounded-full"
            style={isPaid
              ? { background: 'rgba(109,40,217,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.35)' }
              : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
          >
            {isPaid ? '⚡ Starter' : 'Free Plan'}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {loading && <Spinner />}

      {!loading && (
        <div className="space-y-6 max-w-2xl">

          {/* Calendar card */}
          <div className="app-card glow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="section-header mb-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  {periodLabel}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Click a highlighted day to jump to that check-in
                </p>
              </div>
              {/* Stats pill */}
              <div
                className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  <span className="font-bold" style={{ color: '#a78bfa' }}>{submittedCount}</span>
                  <span className="ml-1">/ {days}</span>
                </span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: completionRate >= 70 ? 'rgba(34,197,94,0.12)' : completionRate >= 40 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
                    color: completionRate >= 70 ? '#4ade80' : completionRate >= 40 ? '#fbbf24' : '#f87171',
                  }}
                >
                  {completionRate}%
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-violet-500 inline-block" />
                Submitted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded inline-block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }} />
                Missed
              </span>
            </div>

            {/* Calendar or week strip */}
            {isPaid
              ? <CalendarGrid dateWindow={dateWindow} checkinMap={checkinMap} selectedDate={selectedDate} onSelect={setSelectedDate} />
              : <WeekStrip dateWindow={dateWindow} checkinMap={checkinMap} selectedDate={selectedDate} onSelect={setSelectedDate} />
            }

            {/* Completion bar */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
              <div className="flex items-center justify-between mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>Completion rate</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{completionRate}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${completionRate}%`,
                    background: completionRate >= 70
                      ? 'linear-gradient(90deg,#22c55e,#4ade80)'
                      : completionRate >= 40
                        ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                        : 'linear-gradient(90deg,#ef4444,#f87171)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Upgrade banner (free plan only) */}
          {!isPaid && team && (
            <UpgradeBanner teamId={teamId} />
          )}

          {/* Timeline */}
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Check-in Timeline
            </h2>

            {history.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
              >
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No check-ins found in this period.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <CheckinCard
                    key={entry.date}
                    entry={entry}
                    isHighlighted={selectedDate === entry.date}
                    cardRef={(el) => { cardRefs.current[entry.date] = el; }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
