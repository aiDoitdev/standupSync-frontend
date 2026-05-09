'use client';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../components/Layout';
import { apiCall, getUser } from '../../lib/api';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function Spinner({ sm }) {
  return (
    <div className={`flex items-center justify-center ${sm ? 'py-4' : 'py-16'}`}>
      <div className={`border-violet-500 border-t-transparent rounded-full animate-spin ${sm ? 'w-5 h-5 border-2' : 'w-8 h-8 border-2'}`} />
    </div>
  );
}

// ─── Questions Skeleton ────────────────────────────────────────────────────────
function QuestionsSkeleton() {
  return (
    <div className="space-y-2 mb-4" aria-busy="true" aria-label="Loading questions">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl px-4 py-3 animate-pulse"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
        >
          {/* drag handle placeholder */}
          <div className="w-4 h-4 rounded shrink-0" style={{ background: 'var(--border-card)' }} />
          {/* index number */}
          <div className="w-4 h-3 rounded" style={{ background: 'var(--border-card)' }} />
          {/* label */}
          <div className="flex-1 h-3.5 rounded-md" style={{ background: 'var(--border-card)', width: `${55 + (i * 9) % 30}%` }} />
          {/* action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-6 rounded-lg" style={{ background: 'var(--border-card)' }} />
            <div className="w-7 h-6 rounded-lg" style={{ background: 'var(--border-card)' }} />
            <div className="w-7 h-6 rounded-lg" style={{ background: 'var(--border-card)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sortable Question Item ────────────────────────────────────────────────────
function SortableQuestionItem({ q, idx, onUpdate, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : q.enabled ? 1 : 0.5,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: 'var(--bg-card)', border: `1px solid ${isDragging ? 'rgba(139,92,246,0.5)' : 'var(--border-card)'}` }}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-shadow ${
        isDragging ? 'shadow-lg shadow-violet-500/20' : ''
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5 transition-colors hover:text-violet-400 focus:outline-none"
        style={{ color: 'var(--text-muted)', touchAction: 'none' }}
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="3" r="1.2" />
          <circle cx="10" cy="3" r="1.2" />
          <circle cx="4" cy="7" r="1.2" />
          <circle cx="10" cy="7" r="1.2" />
          <circle cx="4" cy="11" r="1.2" />
          <circle cx="10" cy="11" r="1.2" />
        </svg>
      </button>

      <span className="text-xs font-bold w-5 text-center shrink-0" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
      <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{q.label}</span>

      {q.is_blocker_type && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          🚧 Blocker
        </span>
      )}

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Toggle enabled */}
        <button
          type="button"
          title={q.enabled ? 'Disable' : 'Enable'}
          onClick={() => onUpdate(q.id, { enabled: !q.enabled })}
          className="text-xs px-2 py-1 rounded-lg transition-colors"
          style={{
            background: q.enabled ? 'rgba(34,197,94,0.15)' : 'var(--bg-page)',
            color: q.enabled ? '#22c55e' : 'var(--text-muted)',
            border: '1px solid var(--border-card)',
          }}
        >
          {q.enabled ? 'On' : 'Off'}
        </button>
        {/* Toggle blocker */}
        <button
          type="button"
          title={q.is_blocker_type ? 'Unmark blocker' : 'Mark as blocker question'}
          onClick={() => onUpdate(q.id, { is_blocker_type: !q.is_blocker_type })}
          className="text-xs px-2 py-1 rounded-lg transition-colors"
          style={{ background: 'var(--bg-page)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
        >
          🚧
        </button>
        {/* Delete */}
        <button
          type="button"
          title="Delete question"
          onClick={() => onDelete(q.id)}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:text-red-400"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function formatTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}



// ─── Team Page Inner ──────────────────────────────────────────────────────────
function TeamPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('team_id');

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteEmails, setInviteEmails] = useState([]);
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  const [pendingInvites, setPendingInvites] = useState([]);



  const [sendingAll, setSendingAll] = useState(false);
  const [sendingOne, setSendingOne] = useState(null);
  const [sendMsg, setSendMsg] = useState('');

  // Team settings state (Issue 3: team type only)
  const [settingsTeamType, setSettingsTeamType] = useState('');
  const [settingsCustomTeamType, setSettingsCustomTeamType] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Dynamic questions state (Issue 4)
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionsMsg, setQuestionsMsg] = useState('');
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Per-member states (Issues 1 & 2)
  const [memberRates, setMemberRates] = useState({});
  const [memberTz, setMemberTz] = useState({});
  const [memberSendTime, setMemberSendTime] = useState({});
  const [memberCurrency, setMemberCurrency] = useState({});
  const [savingMember, setSavingMember] = useState(null);
  const [memberMsg, setMemberMsg] = useState({});

  useEffect(() => {
    const u = getUser();
    if (!u) { router.replace('/login'); return; }
    if (u.role !== 'manager') { router.replace('/dashboard'); return; }
    if (!teamId) { router.replace('/dashboard'); return; }
    fetchTeamData();
  }, [teamId]);

  const PREDEFINED_TYPES = ['engineering', 'design', 'marketing', 'sales', 'operations', 'finance', 'legal', 'hr', 'customer_success', 'research', 'product'];

  useEffect(() => {
    if (!team) return;
    const storedType = team.team_type || '';
    if (storedType && !PREDEFINED_TYPES.includes(storedType)) {
      setSettingsTeamType('other');
      setSettingsCustomTeamType(storedType);
    } else {
      setSettingsTeamType(storedType);
      setSettingsCustomTeamType('');
    }
  }, [team]);

  // Fetch questions when teamId is available
  useEffect(() => {
    if (!teamId) return;
    fetchQuestions();
  }, [teamId]);

  useEffect(() => {
    const rates = {};
    const tzMap = {};
    const stMap = {};
    const curMap = {};
    members.forEach((m) => {
      const uid = m.user_id || m.id;
      rates[uid] = m.hourly_rate != null ? String(m.hourly_rate) : '';
      tzMap[uid] = m.timezone || 'Asia/Kolkata';
      stMap[uid] = m.send_time || '09:00';
      curMap[uid] = m.currency || 'INR';
    });
    setMemberRates(rates);
    setMemberTz(tzMap);
    setMemberSendTime(stMap);
    setMemberCurrency(curMap);
  }, [members]);

  async function fetchTeamData() {
    setLoading(true);
    setError('');
    try {
      const [teamData, membersData, invitesData] = await Promise.all([
        apiCall(`/teams/${teamId}`),
        apiCall(`/teams/${teamId}/members`),
        apiCall(`/teams/${teamId}/pending-invites`).catch(() => []),
      ]);
      setTeam(teamData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setPendingInvites(Array.isArray(invitesData) ? invitesData : []);
    } catch (err) {
      const msg = err.message || '';
      // Surface a friendlier message for network-level failures
      setError(
        msg.toLowerCase().includes('networkerror') || msg.toLowerCase().includes('failed to fetch')
          ? 'Unable to reach the server. Please check your connection or try again.'
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestions() {
    setQuestionsLoading(true);
    try {
      const data = await apiCall(`/teams/${teamId}/questions`);
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  }

  function handleInviteKeyDown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (pendingInvites.some((inv) => inv.email.toLowerCase() === email)) {
      setInviteMsg('This email already has a pending invite.');
      return;
    }
    const isFreePlan = team?.plan !== 'starter';
    if (isFreePlan && pendingInvites.length + inviteEmails.length >= 1) {
      setInviteMsg('__UPGRADE__');
      return;
    }
    if (!inviteEmails.includes(email)) {
      setInviteEmails((prev) => [...prev, email]);
      setInviteMsg('');
    }
    setInviteEmail('');
  }

  function removeInviteEmail(email) {
    setInviteEmails((prev) => prev.filter((e) => e !== email));
  }

  async function handleSendInviteAll(e) {
    e.preventDefault();
    if (inviteEmails.length === 0) return;
    setInviting(true);
    setInviteMsg('');
    try {
      const result = await apiCall(`/teams/${teamId}/invite`, 'POST', { emails: inviteEmails });
      setInviteEmails([]);
      await fetchTeamData();
      if (result.sent > 0) {
        setInviteMsg('✓ Invites sent!');
      } else if (result.skipped?.length > 0) {
        const reasons = [...new Set(result.skipped.map((s) => s.reason))].join('; ');
        setInviteMsg(`No invites sent — ${reasons}.`);
      } else {
        setInviteMsg('No invites were sent.');
      }
    } catch (err) {
      const msg = typeof err.message === 'string' ? err.message : '';
      if (msg.includes('Upgrade') || msg.includes('upgrade') || msg.includes('402')) {
        setInviteMsg('__UPGRADE__');
      } else {
        setInviteMsg(msg || 'Failed to send invites');
      }
    } finally {
      setInviting(false);
    }
  }

  async function handleRevokeInvite(inviteId) {
    try {
      await apiCall(`/teams/${teamId}/pending-invites/${inviteId}`, 'DELETE');
      setPendingInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    } catch (err) {
      setError(err.message || 'Failed to revoke invite');
    }
  }

  async function handleRemoveMember(userId) {
    if (!confirm('Remove this member from the team?')) return;
    try {
      await apiCall(`/teams/${teamId}/member/${userId}`, 'DELETE');
      await fetchTeamData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendAll() {
    setSendingAll(true);
    setSendMsg('');
    try {
      await apiCall(`/checkin/${teamId}/send-now/all`, 'POST');
      setSendMsg('✓ Check-in emails sent to all members!');
    } catch (err) {
      setSendMsg(err.message);
    } finally {
      setSendingAll(false);
    }
  }

  async function handleSendOne(userId) {
    setSendingOne(userId);
    setSendMsg('');
    try {
      await apiCall(`/checkin/${teamId}/send-now/${userId}`, 'POST');
      setSendMsg('✓ Check-in email sent!');
    } catch (err) {
      setSendMsg(err.message);
    } finally {
      setSendingOne(null);
    }
  }

  function handleViewHistory(member) {
    const uid = member.user_id || member.id;
    const name = member.name || member.email;
    router.push(`/dashboard/history/${teamId}/${uid}?name=${encodeURIComponent(name)}`);
  }

  async function handleSaveMember(userId) {
    setSavingMember(userId);
    try {
      const rate = memberRates[userId];
      await apiCall(`/teams/${teamId}/member/${userId}`, 'PUT', {
        hourly_rate: rate !== '' && rate != null ? parseFloat(rate) : null,
        timezone: memberTz[userId] || 'Asia/Kolkata',
        send_time: memberSendTime[userId] || '09:00',
        currency: memberCurrency[userId] || 'INR',
      });
      setMemberMsg((prev) => ({ ...prev, [userId]: '✓' }));
      setTimeout(() => setMemberMsg((prev) => ({ ...prev, [userId]: '' })), 2000);
    } catch (err) {
      setMemberMsg((prev) => ({ ...prev, [userId]: '!' }));
    } finally {
      setSavingMember(null);
    }
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg('');
    const actualTeamType = settingsTeamType === 'other' ? settingsCustomTeamType.trim() : settingsTeamType;
    try {
      await apiCall(`/teams/${teamId}`, 'PUT', {
        name: team.name,
        team_type: actualTeamType || null,
      });
      setSettingsMsg('✓ Settings saved!');
      await fetchTeamData();
    } catch (err) {
      setSettingsMsg(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    if (!newQuestionLabel.trim()) return;
    setAddingQuestion(true);
    setQuestionsMsg('');
    try {
      await apiCall(`/teams/${teamId}/questions`, 'POST', { label: newQuestionLabel.trim() });
      setNewQuestionLabel('');
      setQuestionsMsg('✓ Question added!');
      await fetchQuestions();
    } catch (err) {
      setQuestionsMsg(err.message || 'Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  }

  async function handleUpdateQuestion(questionId, patch) {
    try {
      await apiCall(`/teams/${teamId}/questions/${questionId}`, 'PUT', patch);
      await fetchQuestions();
    } catch (err) {
      setQuestionsMsg(err.message || 'Failed to update question');
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!confirm('Delete this question?')) return;
    try {
      await apiCall(`/teams/${teamId}/questions/${questionId}`, 'DELETE');
      await fetchQuestions();
    } catch (err) {
      setQuestionsMsg(err.message || 'Failed to delete question');
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({ ...q, order_index: idx }));

    setQuestions(reordered); // optimistic
    setReordering(true);
    try {
      await Promise.all(
        reordered
          .filter((q, idx) => questions[idx]?.id !== q.id) // only changed positions
          .map((q) => apiCall(`/teams/${teamId}/questions/${q.id}`, 'PUT', { order_index: q.order_index }))
      );
    } catch {
      setQuestionsMsg('Failed to save new order');
      await fetchQuestions(); // revert on failure
    } finally {
      setReordering(false);
    }
  }

  if (!teamId) return null;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-violet-400"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Dashboard
        </button>
        {team && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{team.name}</h1>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {loading && <Spinner />}

      {!loading && team && (
        <div className="space-y-5">
          {/* Team metadata */}
          <div className="app-card glow-card p-5 flex flex-wrap gap-6 text-sm">
            {[
              { label: 'Plan', val: <span className="capitalize">{team.plan}</span> },
              { label: 'Members', val: members.length },
            ].map(({ label, val }) => (
              <div key={label}>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Team Settings */}
          <div className="app-card glow-card p-5">
            <h2 className="section-header">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
              Team Settings
            </h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Team Type — Issue 3: label fixed to "Custom Team Type" */}
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Team Type</label>
                  <select value={settingsTeamType} onChange={(e) => setSettingsTeamType(e.target.value)} className="app-input w-full sm:w-48">
                    <option value="">General</option>
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
                    <option value="other">Other…</option>
                  </select>
                </div>
                {settingsTeamType === 'other' && (
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Custom Team Type</label>
                    <input
                      type="text"
                      value={settingsCustomTeamType}
                      onChange={(e) => setSettingsCustomTeamType(e.target.value)}
                      className="app-input w-48"
                      placeholder="e.g. Data Science"
                      maxLength={80}
                    />
                  </div>
                )}
                <button type="submit" disabled={savingSettings} className="btn-primary whitespace-nowrap">
                  {savingSettings ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
              {settingsMsg && (
                <p className={`text-sm font-medium ${settingsMsg.startsWith('✓') ? 'text-green-500' : 'text-red-500'}`}>{settingsMsg}</p>
              )}
            </form>
          </div>

          {/* Standup Questions — Issue 4: configurable questions */}
          <div className="app-card glow-card p-5">
            <h2 className="section-header">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Standup Questions
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Configure the questions members answer each day. Mark a question as "blocker" to auto-create a Blocker record when answered.
            </p>

            {questionsLoading ? (
              <QuestionsSkeleton />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 mb-4">
                    {questions.map((q, idx) => (
                      <SortableQuestionItem
                        key={q.id}
                        q={q}
                        idx={idx}
                        onUpdate={handleUpdateQuestion}
                        onDelete={handleDeleteQuestion}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            {reordering && (
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Saving new order…</p>
            )}

            {/* Add new question */}
            <form onSubmit={handleAddQuestion} className="flex gap-2 mt-2">
              <input
                type="text"
                value={newQuestionLabel}
                onChange={(e) => setNewQuestionLabel(e.target.value)}
                placeholder="New question label…"
                className="app-input flex-1 text-sm"
                maxLength={300}
              />
              <button type="submit" disabled={addingQuestion || !newQuestionLabel.trim()} className="btn-primary whitespace-nowrap text-sm">
                {addingQuestion ? 'Adding…' : '+ Add'}
              </button>
            </form>
            {questionsMsg && (
              <p className={`mt-2 text-sm font-medium ${questionsMsg.startsWith('✓') ? 'text-green-500' : 'text-red-500'}`}>{questionsMsg}</p>
            )}
          </div>

          {/* Invite member */}
          <div className="app-card glow-card p-5">
            <h2 className="section-header">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Invite Member
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={handleInviteKeyDown}
                placeholder="Type email and press Enter to add"
                className="app-input flex-1"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="app-input sm:w-36"
              >
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </select>
              <button
                onClick={handleSendInviteAll}
                disabled={inviting || inviteEmails.length === 0}
                className="btn-primary whitespace-nowrap disabled:opacity-50"
              >
                {inviting ? 'Sending…' : `Send Invite${inviteEmails.length > 1 ? ' All' : ''}${inviteEmails.length > 0 ? ` (${inviteEmails.length})` : ''}`}
              </button>
            </div>
            {/* Chip list */}
            {inviteEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {inviteEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', color: 'var(--text-primary)' }}
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeInviteEmail(email)}
                      className="ml-0.5 text-violet-400 hover:text-red-400 transition-colors leading-none"
                      aria-label={`Remove ${email}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            {inviteMsg && inviteMsg !== '__UPGRADE__' && (
              <p className={`mt-3 text-sm font-medium ${inviteMsg.startsWith('✓') ? 'text-green-500' : 'text-red-500'}`}>
                {inviteMsg}
              </p>
            )}
            {inviteMsg === '__UPGRADE__' && (
              <div className="mt-3 rounded-xl p-4" style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <p className="text-sm font-semibold text-violet-400 mb-1">Member limit reached</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                  Free plan allows 1 invited member (2 people total including you). Upgrade to Starter ($19/mo) for unlimited members and teams.
                </p>
                <button
                  onClick={() => router.push(`/dashboard/billing?team_id=${teamId}`)}
                  className="btn-primary text-sm"
                >
                  Upgrade to Starter →
                </button>
              </div>
            )}
          </div>

          {/* Manual trigger */}
          <div className="app-card glow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="section-header mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Manual Check-in Trigger
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Send check-in emails outside the scheduled time</p>
              </div>
              <button
                onClick={handleSendAll}
                disabled={sendingAll}
                className="btn-primary"
              >
                {sendingAll ? 'Sending…' : 'Send to All'}
              </button>
            </div>
            {sendMsg && (
              <p className={`text-sm font-medium ${sendMsg.startsWith('✓') ? 'text-green-500' : 'text-red-500'}`}>{sendMsg}</p>
            )}
          </div>

          {/* Members table */}
          <div className="app-card glow-card overflow-hidden">
            <div className="p-5 border-b" style={{ borderColor: 'var(--border-card)' }}>
              <h2 className="section-header mb-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Members ({members.length + pendingInvites.length})
              </h2>
            </div>
            {members.length === 0 && pendingInvites.length === 0 ? (
              <div className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No members yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase tracking-wide" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-card)' }}>
                    <tr>
                      {['Name', 'Email', 'Role', 'Today', 'Timezone', 'Send Time', 'Currency', 'Hourly Rate', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-semibold tracking-wider" style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => {
                      const uid = m.user_id || m.id;
                      return (
                        <tr
                          key={uid}
                          className="transition-colors"
                          style={{ borderTop: i > 0 ? `1px solid var(--border-card)` : undefined }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td className="px-4 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>{m.name || '—'}</td>
                          <td className="px-4 py-3.5" style={{ color: 'var(--text-muted)' }}>{m.email}</td>
                          <td className="px-4 py-3.5">
                            <span className={`badge ${m.role === 'owner' || m.team_role === 'manager' ? 'bg-violet-500/20 text-violet-400' : ''}`}
                              style={!(m.role === 'owner' || m.team_role === 'manager') ? { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' } : {}}>
                              {m.role || m.team_role || 'member'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`badge ${m.checked_in_today ? 'bg-green-500/15 text-green-500' : ''}`}
                              style={!m.checked_in_today ? { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' } : {}}>
                              {m.checked_in_today ? '✓ Done' : 'Pending'}
                            </span>
                          </td>
                          {/* Issues 1 & 2: Per-member timezone, send_time, currency */}
                          <td className="px-4 py-3.5">
                            <select
                              value={memberTz[uid] || 'Asia/Kolkata'}
                              onChange={(e) => setMemberTz((prev) => ({ ...prev, [uid]: e.target.value }))}
                              className="app-input text-xs py-1 w-44"
                            >
                              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                              <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                              <option value="Australia/Perth">Australia/Perth (AWST)</option>
                              <option value="America/New_York">America/New_York (ET)</option>
                              <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                              <option value="America/Chicago">America/Chicago (CT)</option>
                              <option value="America/Denver">America/Denver (MT)</option>
                              <option value="Europe/London">Europe/London (GMT/BST)</option>
                              <option value="Europe/Paris">Europe/Paris (CET)</option>
                              <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                              <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                              <option value="UTC">UTC</option>
                            </select>
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              type="time"
                              value={memberSendTime[uid] || '09:00'}
                              onChange={(e) => setMemberSendTime((prev) => ({ ...prev, [uid]: e.target.value }))}
                              className="app-input text-xs py-1 w-28"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <select
                              value={memberCurrency[uid] || 'INR'}
                              onChange={(e) => setMemberCurrency((prev) => ({ ...prev, [uid]: e.target.value }))}
                              className="app-input text-xs py-1 w-20"
                            >
                              <option value="INR">INR</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                              <option value="AUD">AUD</option>
                              <option value="CAD">CAD</option>
                              <option value="SGD">SGD</option>
                              <option value="AED">AED</option>
                            </select>
                          </td>
                          <td className="px-4 py-3.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={memberRates[uid] ?? ''}
                              onChange={(e) => setMemberRates((prev) => ({ ...prev, [uid]: e.target.value }))}
                              className="app-input w-20 text-sm py-1"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 justify-end">
                              {/* Save per-member settings */}
                              <button
                                type="button"
                                onClick={() => handleSaveMember(uid)}
                                disabled={savingMember === uid}
                                className="btn-ghost text-xs px-2 py-1 disabled:opacity-50"
                                title="Save member settings"
                              >
                                {savingMember === uid ? '…' : memberMsg[uid] || 'Save'}
                              </button>
                              <button
                                onClick={() => handleViewHistory(m)}
                                className="text-xs text-violet-500 hover:text-violet-400 font-medium transition-colors"
                              >
                                History
                              </button>
                              <button
                                onClick={() => handleSendOne(uid)}
                                disabled={sendingOne === uid}
                                className="btn-ghost text-xs px-2.5 py-1 disabled:opacity-50"
                              >
                                {sendingOne === uid ? 'Sending…' : 'Send'}
                              </button>
                              <button
                                onClick={() => handleRemoveMember(uid)}
                                className="text-xs text-red-500 hover:text-red-400 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Pending invite rows */}
                    {pendingInvites.map((inv, i) => (
                      <tr
                        key={inv.id}
                        className="transition-colors"
                        style={{ borderTop: `1px solid var(--border-card)`, opacity: 0.75 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Name */}
                        <td className="px-4 py-3.5 font-medium text-sm" style={{ color: 'var(--text-muted)' }}>—</td>
                        {/* Email */}
                        <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--text-primary)' }}>{inv.email}</td>
                        {/* Role — spans visually with the invite status badge */}
                        <td className="px-4 py-3.5" colSpan={2}>
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.35)' }}
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#f59e0b' }} />
                              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#f59e0b' }} />
                            </span>
                            Team Invitation Pending
                          </span>
                        </td>
                        {/* Empty cells for Timezone / Send Time / Currency / Rate */}
                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>—</td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>—</td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>—</td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-muted)' }}>—</td>
                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="text-xs text-red-500 hover:text-red-400 transition-colors"
                              title="Revoke invitation"
                            >
                              Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History modal */}

    </Layout>
  );
}

// ─── Export with Suspense ─────────────────────────────────────────────────────
export default function TeamPage() {
  return (
    <Suspense>
      <TeamPageInner />
    </Suspense>
  );
}


