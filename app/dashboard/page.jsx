'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiCall, getUser } from '../../lib/api';

// ─── Shared Utilities ─────────────────────────────────────────────────────────

// ─── Skeleton: Member Dashboard ───────────────────────────────────────────────
function MemberDashboardSkeleton() {
  return (
    <div className="space-y-5 max-w-xl" aria-busy="true" aria-label="Loading dashboard">
      <div className="app-card p-6 animate-pulse">
        <div className="h-4 w-44 rounded-md mb-5" style={{ background: 'var(--border-card)' }} />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--border-card)' }} />
          <div className="h-3 w-32 rounded-md" style={{ background: 'var(--border-card)' }} />
        </div>
        <div className="space-y-2.5">
          {[100, 80, 65].map((w, i) => (
            <div key={i} className="h-3 rounded-md" style={{ background: 'var(--border-card)', width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="app-card p-6 animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div className="h-4 w-36 rounded-md" style={{ background: 'var(--border-card)' }} />
          <div className="h-7 w-28 rounded-xl" style={{ background: 'var(--border-card)' }} />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-3 w-20 rounded-md" style={{ background: 'var(--border-card)' }} />
          <div className="h-3 w-20 rounded-md" style={{ background: 'var(--border-card)' }} />
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="h-7 rounded-md" style={{ background: 'var(--border-card)' }} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex gap-4" style={{ borderColor: 'var(--border-card)' }}>
          <div className="h-3 w-28 rounded-md" style={{ background: 'var(--border-card)' }} />
          <div className="h-3 w-20 rounded-md" style={{ background: 'var(--border-card)' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton: Manager Dashboard ──────────────────────────────────────────────
function ManagerDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading teams">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="app-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="h-4 rounded-md" style={{ background: 'var(--border-card)', width: `${45 + i * 12}%` }} />
              <div className="h-5 w-14 rounded-full" style={{ background: 'var(--border-card)' }} />
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded-md" style={{ background: 'var(--border-card)' }} />
                <div className="h-3 w-8 rounded-md" style={{ background: 'var(--border-card)' }} />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-10 rounded-md" style={{ background: 'var(--border-card)' }} />
                <div className="h-5 w-16 rounded-full" style={{ background: 'var(--border-card)' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-card)' }}>
              <div className="h-3 w-24 rounded-md" style={{ background: 'var(--border-card)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton: Team Detail Panel ──────────────────────────────────────────────
function TeamDetailPanelSkeleton() {
  return (
    <div className="app-card glow-card mt-2 p-6 animate-pulse" aria-busy="true" aria-label="Loading team details">
      <div className="flex items-center justify-between mb-5">
        <div className="h-4 w-40 rounded-md" style={{ background: 'var(--border-card)' }} />
        <div className="h-6 w-24 rounded-full" style={{ background: 'var(--border-card)' }} />
      </div>
      <div className="h-2 rounded-full mb-6" style={{ background: 'var(--border-card)' }}>
        <div className="h-2 rounded-full w-3/5" style={{ background: 'rgba(139,92,246,0.25)' }} />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div className="w-7 h-7 rounded-full shrink-0" style={{ background: 'var(--border-card)' }} />
            <div className="flex-1 h-3.5 rounded-md" style={{ background: 'var(--border-card)', width: `${50 + (i * 11) % 35}%` }} />
            <div className="h-5 w-16 rounded-full shrink-0" style={{ background: 'var(--border-card)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

// ─── Member Streak Helpers ────────────────────────────────────────────────────
function computeStreak(submittedDates) {
  if (!submittedDates.length) return 0;
  const set = new Set(submittedDates);
  const today = toISO(new Date());
  let cursor = new Date();
  if (!set.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (true) {
    const key = toISO(cursor);
    if (!set.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── Month Grid ───────────────────────────────────────────────────────────────
function MonthGrid({ checkinMap, selectedDate, onSelect }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ d, key });
  }

  return (
    <div>
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{monthName}</p>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} />;
          const { d, key } = cell;
          const submitted = !!checkinMap[key];
          const isToday = key === toISO(today);
          const isFuture = key > toISO(today);
          const isSelected = selectedDate === key;
          return (
            <button
              key={key}
              onClick={() => submitted ? onSelect(isSelected ? null : key) : null}
              disabled={!submitted}
              title={submitted ? 'Click to view check-in' : isFuture ? '' : 'No check-in'}
              className={[
                'aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-200',
                submitted
                  ? isSelected
                    ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-1 scale-105'
                    : 'bg-violet-500/80 text-white hover:bg-violet-500 cursor-pointer'
                  : isFuture
                    ? 'opacity-30 cursor-default'
                    : 'opacity-40 cursor-default',
                isToday && !submitted ? 'ring-2 ring-violet-400 ring-offset-1' : '',
              ].join(' ')}
              style={!submitted ? { background: 'var(--bg-card)', color: 'var(--text-muted)' } : {}}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week Row ─────────────────────────────────────────────────────────────────
function WeekRow({ checkinMap, selectedDate, onSelect }) {
  const today = new Date();
  const days = [];
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    days.push(d);
  }
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Week of {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
        {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const key = toISO(d);
          const submitted = !!checkinMap[key];
          const isToday = key === toISO(today);
          const isFuture = key > toISO(today);
          const isSelected = selectedDate === key;
          return (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{DAY_LABELS[i]}</span>
              <button
                onClick={() => submitted ? onSelect(isSelected ? null : key) : null}
                disabled={!submitted}
                className={[
                  'w-10 h-10 rounded-full text-sm font-semibold flex items-center justify-center transition-all duration-200',
                  submitted
                    ? isSelected
                      ? 'bg-violet-600 text-white ring-2 ring-violet-400 ring-offset-1 scale-110'
                      : 'bg-violet-500/80 text-white hover:bg-violet-500 cursor-pointer'
                    : '',
                  isToday && !submitted ? 'ring-2 ring-violet-400 ring-offset-1' : '',
                ].join(' ')}
                style={!submitted ? { background: 'var(--bg-card)', color: 'var(--text-muted)', opacity: isFuture ? 0.3 : 0.5 } : {}}
              >
                {d.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Checkin Detail Popover ───────────────────────────────────────────────────
function CheckinDetail({ entry, onClose, q1Label, q2Label, q3Label }) {
  const q1 = q1Label || 'Yesterday';
  const q2 = q2Label || 'Today';
  const q3 = q3Label || 'Blockers';
  const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className="mt-4 rounded-xl p-5 text-sm relative" style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
      <button
        onClick={onClose}
        className="absolute top-3 right-4 text-lg leading-none transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        &times;
      </button>
      <p className="font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{dateLabel}</p>
      <div className="space-y-2" style={{ color: 'var(--text-primary)' }}>
        <p><span className="font-medium">{q1}:</span> <span style={{ color: 'var(--text-muted)' }}>{entry.yesterday}</span></p>
        <p><span className="font-medium">{q2}:</span> <span style={{ color: 'var(--text-muted)' }}>{entry.today}</span></p>
        <p><span className="font-medium">{q3}:</span> <span style={{ color: 'var(--text-muted)' }}>{entry.blockers || 'None'}</span></p>
      </div>
      {entry.submitted_at && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Submitted at {formatTime(entry.submitted_at)}</p>
      )}
    </div>
  );
}

// ─── Member Dashboard ─────────────────────────────────────────────────────────
function MemberDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myCheckin, setMyCheckin] = useState(null);
  const [myBlockers, setMyBlockers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeamIdx, setSelectedTeamIdx] = useState(0);
  const [streakData, setStreakData] = useState([]);
  const [tab, setTab] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => { fetchMemberData(); }, []);

  async function fetchMemberData() {
    setLoading(true);
    try {
      const u = getUser();
      const [todayData, streakRaw, teamsData] = await Promise.all([
        apiCall('/checkin/my-today').catch(() => null),
        apiCall('/checkin/my-streak').catch(() => []),
        apiCall('/teams/').catch(() => []),
      ]);
      if (todayData) setMyCheckin(todayData);
      setStreakData(Array.isArray(streakRaw) ? streakRaw : []);
      const teamsList = Array.isArray(teamsData) ? teamsData : [];
      setTeams(teamsList);

      // Fetch active blockers across all teams for this member
      if (u?.id && teamsList.length > 0) {
        const blockersNested = await Promise.all(
          teamsList.map((t) =>
            apiCall(`/blockers/${t.id}/list?user_id=${u.id}`)
              .catch(() => [])
              .then((list) =>
                (Array.isArray(list) ? list : [])
                  .filter((b) => b.status !== 'resolved')
                  .map((b) => ({ ...b, team_name: t.name }))
              )
          )
        );
        setMyBlockers(blockersNested.flat());
      }
    } finally {
      setLoading(false);
    }
  }

  const checkinMap = useMemo(() => {
    const m = {};
    for (const entry of streakData) m[entry.date] = entry;
    return m;
  }, [streakData]);

  const streak = useMemo(() => computeStreak(Object.keys(checkinMap)), [checkinMap]);
  const selectedEntry = selectedDate ? checkinMap[selectedDate] : null;
  const teamName = teams[selectedTeamIdx]?.name || myCheckin?.team_name || 'My Dashboard';

  return (
    <Layout>
      <div className="ss-page">
      {/* Page header */}
      <div className="ss-page-head">
        <div>
          {teams.length > 1 ? (
            <select
              value={selectedTeamIdx}
              onChange={(e) => setSelectedTeamIdx(Number(e.target.value))}
              className="ss-page-title bg-transparent border-none focus:ring-0 outline-none cursor-pointer"
            >
              {teams.map((t, idx) => (
                <option key={t.id} value={idx}>{t.name}</option>
              ))}
            </select>
          ) : (
            <h1 className="ss-page-title">{teamName}</h1>
          )}
          <p className="ss-page-sub">{formatDate()}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ background: 'rgba(251,146,60,0.08)', borderColor: 'rgba(251,146,60,0.25)' }}>
            <span className="text-xl">🔥</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{streak} day streak</span>
          </div>
        )}
      </div>

      {loading && <MemberDashboardSkeleton />}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
          {/* Today's check-in card */}
          <div className="ss-card" style={{ padding: 24 }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Your Check-in Today</h2>
            {myCheckin?.submitted_at ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-green-500 dark:text-green-400 font-medium text-xs">Submitted at {formatTime(myCheckin.submitted_at)}</span>
                </div>
                {/* Dynamic answers (new system) */}
                {myCheckin.answers && myCheckin.answers.length > 0 ? (
                  <div className="space-y-1.5">
                    {myCheckin.answers.map((a, i) => {
                      if (a.is_blocker_type) {
                        if (!a.answer || !a.answer.trim()) return null;
                        return (
                          <p key={a.question_id} className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 text-amber-500">●</span>
                            <span className="text-amber-500">{a.answer}</span>
                          </p>
                        );
                      }
                      const icon = i === 0 ? '✓' : '⚡';
                      const iconColor = i === 0 ? '#4ade80' : '#a78bfa';
                      return (
                        <p key={a.question_id} className="flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                          <span className="mt-0.5 shrink-0 font-bold text-xs" style={{ color: iconColor }}>{icon}</span>
                          <span>{a.answer || <em style={{ opacity: 0.5 }}>—</em>}</span>
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  /* Legacy fixed-field fallback */
                  <>
                    <p style={{ color: 'var(--text-primary)' }}><span className="font-medium">{teams[selectedTeamIdx]?.q1_label || 'Yesterday'}:</span> <span style={{ color: 'var(--text-muted)' }}>{myCheckin.yesterday}</span></p>
                    <p style={{ color: 'var(--text-primary)' }}><span className="font-medium">{teams[selectedTeamIdx]?.q2_label || 'Today'}:</span> <span style={{ color: 'var(--text-muted)' }}>{myCheckin.today}</span></p>
                    <p style={{ color: 'var(--text-primary)' }}><span className="font-medium">{teams[selectedTeamIdx]?.q3_label || 'Blockers'}:</span> <span style={{ color: 'var(--text-muted)' }}>{myCheckin.blockers || 'None'}</span></p>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">⏰</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  No check-in yet today. You will receive an email with your daily check-in link every morning.
                </p>
              </div>
            )}
          </div>

          {/* Streak card */}
          <div className="ss-card" style={{ padding: 24 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Check-in Streak</h2>
              <div className="tab-strip">
              <button
                onClick={() => { setTab('month'); setSelectedDate(null); }}
                className={`tab-item ${tab === 'month' ? 'active' : ''}`}
              >Month</button>
              <button
                onClick={() => { setTab('week'); setSelectedDate(null); }}
                className={`tab-item ${tab === 'week' ? 'active' : ''}`}
              >Week</button>
            </div>
            </div>
            <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> Submitted</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded inline-block" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }} /> Missed</span>
            </div>
            {tab === 'month'
              ? <MonthGrid checkinMap={checkinMap} selectedDate={selectedDate} onSelect={setSelectedDate} />
              : <WeekRow checkinMap={checkinMap} selectedDate={selectedDate} onSelect={setSelectedDate} />
            }
            <div className="mt-4 flex gap-4 text-xs pt-4 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-card)' }}>
              <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{streakData.length}</span> total this year</span>
              {streak > 0 && <span><span className="text-orange-500 font-semibold">{streak}</span> day streak</span>}
            </div>
            {selectedEntry && <CheckinDetail entry={selectedEntry} onClose={() => setSelectedDate(null)} q1Label={teams[selectedTeamIdx]?.q1_label} q2Label={teams[selectedTeamIdx]?.q2_label} q3Label={teams[selectedTeamIdx]?.q3_label} />}
          </div>

          {/* My Active Blockers */}
          {myBlockers.length > 0 && (
            <div className="ss-card" style={{ padding: 24 }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>
                My Active Blockers
              </h2>
              <div className="space-y-2">
                {myBlockers.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-start justify-between gap-3 rounded-xl p-3.5"
                    style={b.status === 'resolved'
                      ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.28)' }
                      : { background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: b.status === 'resolved' ? '#22c55e' : 'var(--text-primary)' }}>{b.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{b.team_name}</span>
                        {b.comment_count > 0 && (
                          <>
                            <span>·</span>
                            <span>💬 {b.comment_count} comment{b.comment_count !== 1 ? 's' : ''}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/blockers?team_id=${b.team_id}`)}
                      className="shrink-0 text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
                      style={{ background: 'rgba(109,40,217,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}
                    >
                      View &amp; Reply →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </Layout>
  );
}

// ─── Manager: Team Card ───────────────────────────────────────────────────────
function TeamCard({ team, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full ss-card p-5 transition-all duration-200 ${selected ? 'ring-1 ring-violet-500' : ''}`}
      style={selected ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-base leading-tight pr-2" style={{ color: 'var(--text-primary)' }}>{team.name}</h3>
        <span className={`shrink-0 badge ${team.user_role === 'owner' ? 'bg-violet-500/20 text-violet-400' : 'text-xs'}`}
          style={team.user_role !== 'owner' ? { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' } : {}}>
          {team.user_role === 'owner' ? 'Owner' : 'Member'}
        </span>
      </div>
      <div className="space-y-1.5 text-sm">
        {[
          { label: 'Members', val: team.member_count },
          {
            label: 'Plan',
            val: (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                (team.plan || 'free') === 'starter'
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {(team.plan || 'free') === 'starter' ? '⚡ Starter' : 'Free'}
              </span>
            ),
          },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-center justify-between">
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{val}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t flex items-center" style={{ borderColor: 'var(--border-card)' }}>
        <span className="text-xs font-medium" style={{ color: selected ? '#a78bfa' : 'var(--text-muted)' }}>
          {selected ? '✓ Viewing details' : 'Click to view →'}
        </span>
      </div>
    </button>
  );
}

// ─── Manager: Team Detail Panel ───────────────────────────────────────────────
function TeamDetailPanel({ team, members, checkins, openBlockers, pendingInvites = [], blockerStatusMap = {}, loading, selectedDate }) {
  const router = useRouter();

  if (loading) {
    return <TeamDetailPanelSkeleton />;
  }

  const today = toISO(new Date());
  const isToday = selectedDate === today;

  // Build a map of user_id -> checkin for the selected date
  const checkinByUser = {};
  checkins.forEach((c) => { checkinByUser[c.user_id] = c; });

  // For today, use the checked_in_today flag from members; for past dates derive from checkins
  const submittedCount = isToday
    ? members.filter((m) => m.checked_in_today).length
    : Object.keys(checkinByUser).length;
  const totalCount = members.length + pendingInvites.length;

  function memberCheckedIn(m) {
    if (isToday) return m.checked_in_today;
    return !!checkinByUser[m.user_id];
  }

  function memberSubmittedAt(m) {
    if (isToday) return m.submitted_at;
    return checkinByUser[m.user_id]?.submitted_at ?? null;
  }

  const selectedDateLabel = isToday
    ? 'Today'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const progressPct = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  return (
    <div className="ss-card mt-2 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{team.name}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {openBlockers > 0 && (
            <button
              onClick={() => router.push(`/blockers?team_id=${team.id}`)}
              className="text-sm px-3 py-1.5 rounded-xl font-medium transition-all"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              ⚠️ {openBlockers} blocker{openBlockers !== 1 ? 's' : ''}
            </button>
          )}
          <button
            onClick={() => router.push(`/team?team_id=${team.id}`)}
            className="btn-primary text-sm"
          >
            Manage Team →
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Team Check-ins</span>
            <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>
              {submittedCount} / {totalCount} complete
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              }}
            />
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm mb-3">No members in this team yet.</p>
          <button
            onClick={() => router.push(`/team?team_id=${team.id}`)}
            className="text-sm text-violet-500 hover:text-violet-400 font-medium transition-colors"
          >
            Invite members →
          </button>
        </div>
      ) : (
        <>
          {/* Member status grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {members.map((m) => (
              <button
                key={m.user_id || m.id}
                onClick={() => router.push(`/dashboard/history/${team.id}/${m.user_id}?name=${encodeURIComponent(m.name || m.email)}`)}
                className="rounded-xl p-4 border transition-all text-left hover:scale-[1.03] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                style={m.checked_in_today
                  ? { background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }
                  : { background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }}
                title={`View ${m.name || m.email}'s check-in history`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${m.checked_in_today ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {m.name || m.email}
                  </div>
                </div>
                <div className="text-xs" style={{ color: m.checked_in_today ? '#4ade80' : '#f87171' }}>
                  {m.checked_in_today ? `CheckIn · ${formatTime(m.submitted_at)}` : 'Waiting…'}
                </div>
                <div className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>
                  View history →
                </div>
              </button>
            ))}
            {/* Pending invite cards */}
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl p-4 border transition-all"
                style={{ background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.25)' }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f59e0b' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#f59e0b' }} />
                  </span>
                  <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {inv.email}
                  </div>
                </div>
                <div className="text-xs" style={{ color: '#f59e0b' }}>Invitation Pending</div>
              </div>
            ))}
          </div>

          {/* Today's updates */}
          {checkins.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Today’s Updates</h3>
              <div className="space-y-2.5">
                {checkins.map((c) => (
                  <div key={c.id} className="rounded-xl p-4 text-sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.member_name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTime(c.submitted_at)}</span>
                    </div>
                    {/* Dynamic answers (new system) */}
                    {c.answers && c.answers.length > 0 ? (
                      <div className="space-y-2.5">
                        {c.answers.map((a, i) => {
                          if (a.is_blocker_type) {
                            if (!a.answer || !a.answer.trim()) return null;
                            const bStatus = blockerStatusMap[c.user_id];
                            const isCleared = bStatus && bStatus.hasResolved && !bStatus.hasOpen;
                            const blockerColor = isCleared ? '#22c55e' : '#f59e0b';
                            const labelColor = isCleared ? '#16a34a' : '#f59e0b';
                            return (
                              <div key={a.question_id}>
                                <p className="text-xs font-semibold mb-0.5" style={{ color: labelColor }}>{a.question_label}</p>
                                <p className="flex items-start gap-2">
                                  <span className="mt-0.5 shrink-0" style={{ color: blockerColor }}>●</span>
                                  <span style={{ color: blockerColor }}>{a.answer}</span>
                                </p>
                              </div>
                            );
                          }
                          const icon = i === 0 ? '✓' : '⚡';
                          const iconColor = i === 0 ? '#4ade80' : '#a78bfa';
                          return (
                            <div key={a.question_id}>
                              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{a.question_label}</p>
                              <p className="flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                <span className="mt-0.5 shrink-0 font-bold text-xs" style={{ color: iconColor }}>{icon}</span>
                                <span>{a.answer || <em style={{ opacity: 0.5 }}>—</em>}</span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Legacy fixed-field fallback */
                      <>
                        <p style={{ color: 'var(--text-muted)' }} className="mb-1"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{team.q1_label || 'Yesterday'}:</span> {c.yesterday}</p>
                        <p style={{ color: 'var(--text-muted)' }} className="mb-1"><span className="font-medium" style={{ color: 'var(--text-primary)' }}>{team.q2_label || 'Today'}:</span> {c.today}</p>
                        {c.blockers && (
                          <p className="mt-2 text-amber-500"><span className="font-medium">⚠️ {team.q3_label || 'Blocker'}:</span> {c.blockers}</p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-sm rounded-xl" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}>
              No check-ins submitted yet today.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────
function ManagerDashboard() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState({ members: [], checkins: [], openBlockers: 0, pendingInvites: [], blockerStatusMap: {} });
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamType, setNewTeamType] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()));

  useEffect(() => { fetchTeams(); }, []);

  async function fetchTeams() {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/teams/');
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCheckinsForDate(teamId, date) {
    const today = toISO(new Date());
    const endpoint = date === today
      ? `/checkin/${teamId}/today`
      : `/checkin/${teamId}/date/${date}`;
    return apiCall(endpoint).catch(() => []);
  }

  async function selectTeam(team) {
    if (selectedTeam?.id === team.id) { setSelectedTeam(null); return; }
    setSelectedTeam(team);
    setDetailLoading(true);
    try {
      const [membersData, checkinsData, blockersData, invitesData] = await Promise.all([
        apiCall(`/teams/${team.id}/members`).catch(() => []),
        fetchCheckinsForDate(team.id, selectedDate),
        apiCall(`/blockers/${team.id}/list`).catch(() => []),
        apiCall(`/teams/${team.id}/pending-invites`).catch(() => []),
      ]);
      const allBlockers = Array.isArray(blockersData) ? blockersData : [];
      const blockerStatusMap = {};
      allBlockers.forEach((b) => {
        if (!blockerStatusMap[b.user_id]) blockerStatusMap[b.user_id] = { hasOpen: false, hasResolved: false };
        if (b.status === 'resolved') blockerStatusMap[b.user_id].hasResolved = true;
        else blockerStatusMap[b.user_id].hasOpen = true;
      });
      setDetail({
        members: Array.isArray(membersData) ? membersData : [],
        checkins: Array.isArray(checkinsData) ? checkinsData : [],
        openBlockers: allBlockers.filter((b) => b.status !== 'resolved').length,
        pendingInvites: Array.isArray(invitesData) ? invitesData : [],
        blockerStatusMap,
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDateChange(newDate) {
    setSelectedDate(newDate);
    if (!selectedTeam) return;
    setDetailLoading(true);
    try {
      const checkinsData = await fetchCheckinsForDate(selectedTeam.id, newDate);
      setDetail((prev) => ({ ...prev, checkins: Array.isArray(checkinsData) ? checkinsData : [] }));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await apiCall('/teams/create', 'POST', { name: newTeamName.trim(), team_type: newTeamType || null });
      setNewTeamName('');
      setNewTeamType('');
      setShowCreate(false);
      await fetchTeams();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Layout>
      <div className="ss-page">
      {/* Page header */}
      <div className="ss-page-head">
        <div>
          <h1 className="ss-page-title">My Teams</h1>
          <p className="ss-page-sub">{formatDate()}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Date picker for team check-ins */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--text-muted)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
            </svg>
            <input
              type="date"
              value={selectedDate}
              max={toISO(new Date())}
              onChange={(e) => e.target.value && handleDateChange(e.target.value)}
              className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0"
              style={{ color: 'var(--text-primary)', minWidth: 130 }}
            />
          </div>
          <button
            onClick={() => router.push('/reports')}
            className="btn-ghost text-sm flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <rect x="18" y="3" width="3" height="18" rx="1" /><rect x="10.5" y="8" width="3" height="13" rx="1" /><rect x="3" y="13" width="3" height="8" rx="1" />
            </svg>
            Reports
          </button>
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="btn-ghost text-sm flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" />
            </svg>
            Billing
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary self-start sm:self-auto"
          >
            + New Team
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
          {(error.includes('Upgrade') || error.includes('upgrade')) && (
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="ml-3 text-violet-400 hover:text-violet-300 font-semibold underline"
            >
              Upgrade now →
            </button>
          )}
        </div>
      )}

      {/* Create team form */}
      {showCreate && (
        <div className="ss-card p-5">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Create New Team</h2>
          <form onSubmit={handleCreateTeam} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              autoFocus
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder='e.g. "Marketing" or "Operations"'
              className="app-input flex-1"
            />
            <select
              value={newTeamType}
              onChange={(e) => setNewTeamType(e.target.value)}
              className="app-input sm:w-44"
            >
              <option value="">Team Type</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
              <option value="operations">Operations</option>
              <option value="finance">Finance</option>
              <option value="legal">Legal</option>
              <option value="hr">HR</option>
              <option value="customer_success">Customer Success</option>
              <option value="research">Research</option>
              <option value="product">Product</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="btn-primary whitespace-nowrap">
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowCreate(false); setNewTeamName(''); }} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <ManagerDashboardSkeleton />}

      {/* Empty state */}
      {!loading && teams.length === 0 && (
        <div className="ss-card p-12 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Create your first team</h2>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Set up a team, invite members, and start tracking daily standup check-ins.
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            Create Team →
          </button>
        </div>
      )}

      {/* Team grid + detail */}
      {!loading && teams.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                selected={selectedTeam?.id === team.id}
                onClick={() => selectTeam(team)}
              />
            ))}
          </div>

          {selectedTeam && (
            <TeamDetailPanel
              team={selectedTeam}
              members={detail.members}
              checkins={detail.checkins}
              openBlockers={detail.openBlockers}
              pendingInvites={detail.pendingInvites}
              blockerStatusMap={detail.blockerStatusMap}
              loading={detailLoading}
            />
          )}
        </>
      )}
      </div>
    </Layout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }
    const u = getUser();
    setRole(u?.role || 'member');
  }, []);

  if (!role) return null;
  if (role === 'member') return <MemberDashboard />;
  return <ManagerDashboard />;
}


