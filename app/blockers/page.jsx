'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiCall, getUser } from '../../lib/api';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function BlockerIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function UserIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChatIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShieldCheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

// ─── Skeleton: Blockers List ──────────────────────────────────────────────────
function BlockersListSkeleton() {
  return (
    <div className="space-y-2 animate-pulse" aria-busy="true" aria-label="Loading blockers">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="app-card p-4" style={{ opacity: 1 - i * 0.1 }}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3.5 rounded-md" style={{ background: 'var(--border-card)', width: `${45 + (i * 13) % 30}%` }} />
                <div className="h-5 w-20 rounded-full shrink-0" style={{ background: 'var(--border-card)' }} />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 rounded-md" style={{ background: 'var(--border-card)' }} />
                <div className="h-3 w-3 rounded-full" style={{ background: 'var(--border-card)' }} />
                <div className="h-3 w-24 rounded-md" style={{ background: 'var(--border-card)' }} />
              </div>
            </div>
            <div className="h-5 w-14 rounded-full shrink-0" style={{ background: 'var(--border-card)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton: Blocker Detail (Slide-over) ────────────────────────────────────
function BlockerDetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading blocker details">
      <div>
        <div className="h-3 w-24 rounded-md mb-2" style={{ background: 'var(--border-card)' }} />
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-md" style={{ background: 'var(--border-card)' }} />
          <div className="h-3 w-4/5 rounded-md" style={{ background: 'var(--border-card)' }} />
        </div>
      </div>
      <div>
        <div className="h-3 w-20 rounded-md mb-2" style={{ background: 'var(--border-card)' }} />
        <div className="h-9 rounded-xl" style={{ background: 'var(--border-card)' }} />
      </div>
      <div>
        <div className="h-3 w-16 rounded-md mb-2" style={{ background: 'var(--border-card)' }} />
        <div className="h-8 w-28 rounded-full" style={{ background: 'var(--border-card)' }} />
      </div>
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
        <div className="h-3 w-20 rounded-md mb-3" style={{ background: 'var(--border-card)' }} />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full shrink-0" style={{ background: 'var(--border-card)' }} />
              <div className="flex-1 rounded-xl p-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                <div className="h-3 w-3/4 rounded-md mb-1.5" style={{ background: 'var(--border-card)' }} />
                <div className="h-3 w-1/2 rounded-md" style={{ background: 'var(--border-card)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG = {
  open:         { label: 'Open',         dot: 'bg-red-400',    pill: 'bg-red-500/15 text-red-500 border-red-500/30' },
  acknowledged: { label: 'Acknowledged', dot: 'bg-amber-400',  pill: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  in_progress:  { label: 'In Progress',  dot: 'bg-blue-400',   pill: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  resolved:     { label: 'Resolved',     dot: 'bg-green-400',  pill: 'bg-green-500/15 text-green-500 border-green-500/30' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, dot: 'bg-gray-400', pill: '' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Slide-over Panel ─────────────────────────────────────────────────────────
function SlideOver({ blocker, teamId, userRole, userId, onClose, onStatusChange }) {
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [resolveInstructions, setResolveInstructions] = useState('');
  const [resolving, setResolving] = useState(false);
  const [err, setErr] = useState('');
  const [members, setMembers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [assigning, setAssigning] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => { fetchDetail(); }, [blocker.id]);
  useEffect(() => { commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [detail?.comments]);

  useEffect(() => {
    // Fetch members for manager (assignment dropdown) OR for an assigned member (reassignment)
    // We load eagerly and filter once we know if current user is assigned
    apiCall(`/teams/${teamId}/members`).then((data) => {
      setMembers(Array.isArray(data) ? data.filter((m) => m.status === 'active') : []);
    }).catch(() => {});
  }, [teamId]);

  useEffect(() => {
    if (detail) setAssignedTo(detail.assigned_to || '');
  }, [detail?.assigned_to]);

  async function fetchDetail() {
    setDetailLoading(true);
    setErr('');
    try {
      const data = await apiCall(`/blockers/${teamId}/${blocker.id}`);
      setDetail(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await apiCall(`/blockers/${teamId}/${blocker.id}/comment`, 'POST', { comment: commentText.trim() });
      setCommentText('');
      await fetchDetail();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleStatusChange(newStatus) {
    setStatusUpdating(true);
    setErr('');
    try {
      await apiCall(`/blockers/${teamId}/${blocker.id}/status`, 'PATCH', { status: newStatus });
      await fetchDetail();
      onStatusChange();
    } catch (e) {
      setErr(e.message);
    } finally {
      setStatusUpdating(false);
    }
  }

  async function handleResolve(e) {
    e.preventDefault();
    setResolving(true);
    setErr('');
    try {
      await apiCall(`/blockers/${teamId}/${blocker.id}/resolve`, 'POST', { unblock_instructions: resolveInstructions.trim() });
      setResolveInstructions('');
      await fetchDetail();
      onStatusChange();
    } catch (e) {
      setErr(e.message);
    } finally {
      setResolving(false);
    }
  }

  async function handleAssign() {
    setAssigning(true);
    setErr('');
    try {
      await apiCall(`/blockers/${teamId}/${blocker.id}/assign`, 'PATCH', {
        assigned_to: assignedTo || null,
      });
      await fetchDetail();
      onStatusChange();
    } catch (e) {
      setErr(e.message);
    } finally {
      setAssigning(false);
    }
  }

  const isManager = userRole === 'manager';
  const isAssigned = detail?.assigned_to === userId;  // assigned member
  const canAssign = isManager || isAssigned;           // can reassign or unassign
  const canResolve = isManager || isAssigned;          // can mark resolved
  const isResolved = detail?.status === 'resolved';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] flex flex-col border-l"
        style={{ background: 'var(--bg-page)', borderColor: 'var(--border-card)' }}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between gap-3" style={{ borderColor: 'var(--border-card)' }}>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base leading-tight" style={{ color: 'var(--text-primary)' }}>{blocker.title}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {detail && <StatusBadge status={detail.status} />}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {blocker.user_name} · {formatDateTime(blocker.created_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none shrink-0 transition-colors hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {err && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm">{err}</div>
          )}

          {detailLoading && <BlockerDetailSkeleton />}

          {!detailLoading && detail && (
            <>
              {/* Description */}
              {detail.description && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{detail.description}</p>
                </div>
              )}

              {/* Assigned To */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Assigned To</p>
                {canAssign ? (
                  <div className="flex gap-2 items-center">
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="app-input flex-1 text-sm"
                    >
                      <option value="">— Unassigned —</option>
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssign}
                      disabled={assigning || assignedTo === (detail.assigned_to || '')}
                      className="text-sm px-3 py-1.5 rounded-xl font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }}
                    >
                      {assigning ? '…' : 'Save'}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: detail.assigned_to_name ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {detail.assigned_to_name || 'Unassigned'}
                  </p>
                )}
              </div>

              {/* Manager: Status Changer */}
              {isManager && !isResolved && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['open', 'acknowledged', 'in_progress'].map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      const isActive = detail.status === s;
                      return (
                        <button
                          key={s}
                          disabled={statusUpdating || isActive}
                          onClick={() => handleStatusChange(s)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                            isActive ? `${cfg.pill}` : 'hover:border-violet-500/40'
                          } disabled:opacity-50`}
                          style={!isActive ? { borderColor: 'var(--border-card)', color: 'var(--text-muted)' } : {}}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resolution box */}
              {isResolved && detail.resolution?.unblock_instructions && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-3.5 h-3.5" /> Resolved
                  </p>
                  <p className="text-sm text-green-400">{detail.resolution.unblock_instructions}</p>
                  {detail.resolved_at && (
                    <p className="text-xs text-green-600 mt-2">{formatDateTime(detail.resolved_at)}</p>
                  )}
                </div>
              )}

              {/* Comments */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
                  Comments ({(detail.comments || []).length})
                </p>
                <div className="space-y-2.5">
                  {(detail.comments || []).length === 0 ? (
                    <p className="text-sm rounded-xl px-4 py-3" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}>
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    (detail.comments || []).map((c) => (
                      <div
                        key={c.id}
                        className="text-sm rounded-xl p-3.5"
                        style={c.user_id === userId
                          ? { background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(139,92,246,0.3)' }
                          : { background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{c.user_name || c.user_email}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(c.created_at)}</span>
                        </div>
                        <p style={{ color: 'var(--text-primary)' }}>{c.comment}</p>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>

              {/* Manager: Resolve Form */}
              {canResolve && !isResolved && (
                <div className="border-t pt-4" style={{ borderColor: 'var(--border-card)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Mark as Resolved</p>
                  <form onSubmit={handleResolve} className="space-y-2">
                    <textarea
                      rows={3}
                      value={resolveInstructions}
                      onChange={(e) => setResolveInstructions(e.target.value)}
                      placeholder="Describe how this was resolved or what action to take..."
                      className="app-input resize-none"
                    />
                    <button
                      type="submit"
                      disabled={resolving || !resolveInstructions.trim()}
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      {resolving ? 'Resolving…' : 'Mark Resolved'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer: Add Comment */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="app-input flex-1"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="btn-primary px-4 disabled:opacity-50"
            >
              {submittingComment ? '…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Blockers Page Inner ──────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

function BlockersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTeamId = searchParams.get('team_id');
  const preselectedBlockerId = searchParams.get('blocker_id');

  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(preselectedTeamId || '');
  // If a specific blocker is requested via URL, show all statuses so it can be found
  const [statusFilter, setStatusFilter] = useState(preselectedBlockerId ? '' : 'open');
  const [blockers, setBlockers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [error, setError] = useState('');
  const [pendingBlockerId, setPendingBlockerId] = useState(preselectedBlockerId || '');

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeamId) fetchBlockers();
    else setBlockers([]);
  }, [selectedTeamId, statusFilter]);

  // Auto-open slide-over when navigated from Blocker Intelligence
  useEffect(() => {
    if (!pendingBlockerId || blockers.length === 0) return;
    const match = blockers.find((b) => String(b.id) === pendingBlockerId);
    if (match) {
      setSelectedBlocker(match);
      setPendingBlockerId('');
    }
  }, [blockers, pendingBlockerId]);

  async function fetchTeams() {
    try {
      const data = await apiCall('/teams/');
      const list = Array.isArray(data) ? data : [];
      setTeams(list);
      if (!selectedTeamId && list.length > 0) setSelectedTeamId(String(list[0].id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function fetchBlockers() {
    if (!selectedTeamId) return;
    setLoading(true);
    setError('');
    try {
      const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
      const data = await apiCall(`/blockers/${selectedTeamId}/list${qs}`);
      setBlockers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <BlockerIcon className="w-6 h-6 text-violet-400" />
            Blockers
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {user?.role === 'manager' ? 'Track and resolve team impediments' : 'Your blockers — created by you or assigned to you'}
          </p>
        </div>
        {user?.role === 'manager' && (
          <button
            onClick={() => router.push('/blockers/ai' + (selectedTeamId ? `?team_id=${selectedTeamId}` : ''))}
            className="flex items-center gap-2 text-sm font-semibold self-start sm:self-auto transition-all"
            style={{ padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(109,40,217,0.12))', border: '1px solid rgba(139,92,246,0.35)', color: '#c4b5fd' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(109,40,217,0.2))'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(109,40,217,0.12))'; }}
          >
            <span>✨</span>
            Blocker Intelligence
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Team selector */}
        <select
          value={selectedTeamId}
          onChange={(e) => { setSelectedTeamId(e.target.value); setSelectedBlocker(null); }}
          className="app-input sm:w-48"
        >
          {teams.length === 0 && <option value="">No teams</option>}
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name}</option>
          ))}
        </select>

        {/* Status filter tabs */}
        <div className="tab-strip overflow-x-auto">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setSelectedBlocker(null); }}
              className={`tab-item ${statusFilter === f.value ? 'active' : ''}`}
            >
              {f.value && STATUS_CONFIG[f.value] ? (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[f.value].dot}`} />
                  {f.label}
                </>
              ) : f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {!selectedTeamId && (
        <div className="app-card glow-card text-center py-14 text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a team to view blockers.
        </div>
      )}

      {selectedTeamId && loading && <BlockersListSkeleton />}

      {selectedTeamId && !loading && blockers.length === 0 && (
        <div className="app-card glow-card text-center py-14">
          <div className="flex justify-center mb-3 text-green-500"><CheckCircleIcon className="w-10 h-10" /></div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {statusFilter ? `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase() || statusFilter} blockers.` : 'No blockers found.'}
          </p>
        </div>
      )}

      {selectedTeamId && !loading && blockers.length > 0 && (
        <div className="space-y-2">
          {blockers.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBlocker(b)}
              className="w-full text-left app-card p-4 transition-all duration-200 group"
              style={b.status === 'resolved'
                ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)' }
                : {}}
              onMouseEnter={(e) => {
                if (b.status === 'resolved') {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(34,197,94,0.5)';
                } else {
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4)';
                }
              }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{b.title}</span>
                    <StatusBadge status={b.status} />
                    {user?.role === 'member' && b.assigned_to === user?.id && (
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(109,40,217,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.4)' }}>
                        Assigned to you
                      </span>
                    )}
                    {user?.role === 'member' && b.user_id === user?.id && (
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                        Created by you
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{b.user_name}</span>
                    {b.assigned_to_name && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          {b.assigned_to_name}
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>{formatDateTime(b.created_at)}</span>
                    {b.comment_count > 0 && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <ChatIcon className="w-3 h-3" />
                          {b.comment_count}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-lg leading-none transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--text-muted)' }}>›</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedBlocker && (
        <SlideOver
          blocker={selectedBlocker}
          teamId={selectedTeamId}
          userRole={user?.role}
          userId={user?.id}
          onClose={() => setSelectedBlocker(null)}
          onStatusChange={() => { fetchBlockers(); }}
        />
      )}
    </Layout>
  );
}

// ─── Export with Suspense ─────────────────────────────────────────────────────
export default function BlockersPage() {
  return (
    <Suspense>
      <BlockersPageInner />
    </Suspense>
  );
}


