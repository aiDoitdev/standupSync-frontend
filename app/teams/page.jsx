'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiCall, getUser } from '../../lib/api';
import { ROUTES } from '../../lib/constants';

// ─── Utilities ────────────────────────────────────────────────────────────────

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Team Avatar ──────────────────────────────────────────────────────────────

function TeamAvatar({ name, size = 32 }) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = ((name.charCodeAt(i) + ((hash << 5) - hash)) | 0);
  const hue = Math.abs(hash) % 360;
  const initials = name
    ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
        background: `oklch(0.88 0.10 ${hue})`,
        color: `oklch(0.40 0.15 ${hue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.36, fontWeight: 700, letterSpacing: '-0.02em',
      }}
    >
      {initials}
    </div>
  );
}

// ─── Status dot ──────────────────────────────────────────────────────────────

function CheckinBar({ value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 550, color, minWidth: 32, textAlign: 'right' }}>{pct}%</span>
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TeamsSkeleton() {
  return (
    <div className="ss-card" style={{ overflow: 'hidden' }} aria-busy="true" aria-label="Loading teams">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            borderBottom: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-subtle)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: 13, borderRadius: 6, background: 'var(--bg-subtle)', marginBottom: 7 }} />
            <div style={{ width: '25%', height: 11, borderRadius: 6, background: 'var(--bg-subtle)' }} />
          </div>
          <div style={{ width: 120, height: 10, borderRadius: 6, background: 'var(--bg-subtle)' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Plan badge ──────────────────────────────────────────────────────────────

function PlanBadge({ plan }) {
  const cfg = {
    starter: { label: 'Starter', color: 'var(--accent-fg)', bg: 'var(--accent-soft)' },
    pro:     { label: 'Pro',     color: 'oklch(0.60 0.18 75)', bg: 'oklch(0.95 0.06 75)' },
    free:    { label: 'Free',    color: 'var(--fg-subtle)',    bg: 'var(--bg-subtle)'    },
  }[plan || 'free'] || { label: plan, color: 'var(--fg-subtle)', bg: 'var(--bg-subtle)' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 5,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── TeamsPage ────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamType, setNewTeamType] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()));
  const [checkinCounts, setCheckinCounts] = useState({});
  const user = typeof window !== 'undefined' ? getUser() : null;

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/teams/');
      const list = Array.isArray(data) ? data : [];
      setTeams(list);
      // Fetch today's check-in counts for each team
      const counts = {};
      await Promise.all(
        list.map(async (t) => {
          try {
            const checkins = await apiCall(`/checkin/${t.id}/today`);
            counts[t.id] = Array.isArray(checkins) ? checkins.length : 0;
          } catch {
            counts[t.id] = 0;
          }
        })
      );
      setCheckinCounts(counts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers = teams.reduce((s, t) => s + (t.member_count || 0), 0);
  const totalCheckins = Object.values(checkinCounts).reduce((s, n) => s + n, 0);
  const avgCheckinRate = teams.length > 0
    ? Math.round(teams.reduce((s, t) => {
        const mc = t.member_count || 0;
        const cc = checkinCounts[t.id] || 0;
        return s + (mc > 0 ? cc / mc : 0);
      }, 0) / teams.length * 100)
    : 0;

  return (
    <Layout>
      <div className="ss-page">

        {/* Page header */}
        <div className="ss-page-head">
          <div>
            <h1 className="ss-page-title">Teams</h1>
            <p className="ss-page-sub">{formatDate()}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="ss-btn accent"
              onClick={() => setShowCreate(!showCreate)}
            >
              + New Team
            </button>
          </div>
        </div>

        {/* Stats row */}
        {!loading && teams.length > 0 && (
          <div className="ss-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="ss-stat">
              <div className="ss-stat-label">Teams</div>
              <div className="ss-stat-value">{teams.length}</div>
              <div className="ss-stat-sub">total teams</div>
            </div>
            <div className="ss-stat">
              <div className="ss-stat-label">Members</div>
              <div className="ss-stat-value">{totalMembers}</div>
              <div className="ss-stat-sub">across all teams</div>
            </div>
            <div className="ss-stat">
              <div className="ss-stat-label">Check-ins Today</div>
              <div className="ss-stat-value">{totalCheckins}</div>
              <div className="ss-stat-sub">submitted today</div>
            </div>
            <div className="ss-stat">
              <div className="ss-stat-label">Avg Rate</div>
              <div className="ss-stat-value" style={{ color: avgCheckinRate >= 80 ? 'var(--success)' : avgCheckinRate >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                {avgCheckinRate}%
              </div>
              <div className="ss-stat-sub">completion rate</div>
            </div>
          </div>
        )}

        {/* Create team form */}
        {showCreate && (
          <div className="ss-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--fg)' }}>Create New Team</h2>
            <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <input
                type="text"
                required
                autoFocus
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder='e.g. "Marketing" or "Engineering"'
                className="app-input"
                style={{ flex: '1 1 200px', minWidth: 0 }}
              />
              <select
                value={newTeamType}
                onChange={(e) => setNewTeamType(e.target.value)}
                className="app-input"
                style={{ flex: '0 1 160px' }}
              >
                <option value="">Team Type</option>
                <option value="engineering">Engineering</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="finance">Finance</option>
                <option value="product">Product</option>
                <option value="hr">HR</option>
                <option value="customer_success">Customer Success</option>
                <option value="research">Research</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={creating} className="ss-btn accent">
                  {creating ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  className="ss-btn ghost"
                  onClick={() => { setShowCreate(false); setNewTeamName(''); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid oklch(0.60 0.20 25 / 0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Teams list */}
        {loading ? (
          <TeamsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="ss-card" style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--fg)' }}>
              {search ? 'No teams match your search' : 'Create your first team'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg-muted)', maxWidth: 360, margin: '0 auto 20px' }}>
              {search
                ? 'Try a different search term or clear the filter.'
                : 'Set up a team, invite members, and start tracking daily standup check-ins.'}
            </p>
            {!search && (
              <button className="ss-btn accent" onClick={() => setShowCreate(true)}>
                Create Team →
              </button>
            )}
          </div>
        ) : (
          <div className="ss-card" style={{ overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px 110px 160px 100px 80px',
              gap: 12,
              padding: '10px 20px',
              borderBottom: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--fg-subtle)',
            }}>
              <span>Team</span>
              <span>Members</span>
              <span>Check-ins</span>
              <span style={{ paddingLeft: 8 }}>Rate (today)</span>
              <span>Plan</span>
              <span>Role</span>
            </div>

            {/* Table rows */}
            {filtered.map((team) => {
              const mc = team.member_count || 0;
              const cc = checkinCounts[team.id] || 0;
              return (
                <div
                  key={team.id}
                  onClick={() => router.push(ROUTES.dashboard + '?team_id=' + team.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 90px 110px 160px 100px 80px',
                    gap: 12,
                    padding: '13px 20px',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                >
                  {/* Team name + avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <TeamAvatar name={team.name} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 550, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {team.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--fg-subtle)', textTransform: 'capitalize' }}>
                        {team.team_type || 'team'}
                      </div>
                    </div>
                  </div>

                  {/* Members */}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>{mc}</span>

                  {/* Check-ins today */}
                  <span style={{ fontSize: 13, color: 'var(--fg-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {cc} / {mc}
                  </span>

                  {/* Progress bar */}
                  <CheckinBar value={cc} total={mc} />

                  {/* Plan */}
                  <PlanBadge plan={team.plan} />

                  {/* Role */}
                  <span style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                    color: team.user_role === 'owner' ? 'var(--accent-fg)' : 'var(--fg-muted)',
                  }}>
                    {team.user_role || 'member'}
                  </span>
                </div>
              );
            })}

            {/* Footer */}
            <div style={{
              padding: '10px 20px',
              fontSize: 12,
              color: 'var(--fg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>Showing {filtered.length} of {teams.length} teams</span>
              <button
                className="ss-btn ghost sm"
                onClick={() => router.push(ROUTES.dashboard)}
              >
                Manage teams →
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        {teams.length > 3 && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative', maxWidth: 320 }}>
              <svg
                width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams…"
                className="app-input"
                style={{ paddingLeft: 32, fontSize: 13 }}
              />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
