'use client';
import { useEffect, useState } from 'react';
import { apiCall } from '../../../lib/api';
import { ThemeToggle } from '@/components/ThemeProvider';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const QUESTION_ICONS = ['✅', '🎯', '🚧', '💡', '📋', '🔍'];

export default function CheckinPage({ params }) {
  const { token } = params;
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState('');
  // answers keyed by question_id
  const [answers, setAnswers] = useState({});
  // blockerActive keyed by question_id (for blocker-type questions with yes/no toggle)
  const [blockerActive, setBlockerActive] = useState({});
  // Cost Intelligence: hours confirmation
  const [hoursConfirmed, setHoursConfirmed] = useState(false);
  const [hoursInput, setHoursInput] = useState(8);
  const [hoursConfirming, setHoursConfirming] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiCall(`/checkin/${token}`);
        setInfo(data);
        if (data.already_submitted) setSubmitted(true);
        if (data.hours_confirmation_needed) setHoursInput(data.hours_per_day || 8);
        // Initialize answer state for each question
        const init = {};
        const blockerInit = {};
        (data.questions || []).forEach((q) => {
          init[q.id] = '';
          if (q.is_blocker_type) blockerInit[q.id] = false;
        });
        setAnswers(init);
        setBlockerActive(blockerInit);
      } catch {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    const questions = info?.questions || [];

    // Validate required questions
    const unanswered = questions.filter(
      (q) => q.required && !q.is_blocker_type && !(answers[q.id] || '').trim()
    );
    if (unanswered.length > 0) {
      setError('Please answer all required questions.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      // Silently confirm hours alongside submission if not yet confirmed
      if (info?.hours_confirmation_needed && !hoursConfirmed) {
        try {
          await apiCall(`/checkin/${token}/confirm-hours`, 'POST', { hours_per_day: Number(hoursInput) });
          setHoursConfirmed(true);
        } catch (_) {
          // Non-blocking — don't fail the check-in if hours confirm fails
        }
      }
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          // For blocker-type questions: only submit answer if toggled yes
          answer: q.is_blocker_type
            ? (blockerActive[q.id] ? (answers[q.id] || '') : '')
            : (answers[q.id] || ''),
        })),
      };
      await apiCall(`/checkin/${token}`, 'POST', payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <Spinner />
      </div>
    );
  }

  /* ── Invalid ── */
  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-page)' }}>
        <div className="app-card glow-card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Link Invalid or Expired</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            This check-in link is invalid or has expired. Check-in links are valid for 24 hours.
            Ask your manager to re-send the check-in email.
          </p>
        </div>
      </div>
    );
  }

  /* ── Submitted ── */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-page)' }}>
        <div className="app-card glow-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-5 shadow-xl shadow-purple-900/30">
            🎉
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {info?.already_submitted ? 'Already checked in today!' : 'All done!'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {info?.already_submitted
              ? 'Great work! Your manager can already see your update.'
              : 'Your update has been sent to your manager. Have a productive day! 🚀'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-500 dark:text-green-400 text-xs font-medium">Check-in submitted</span>
          </div>
        </div>
      </div>
    );
  }

  const questions = info?.questions || [];

  /* ── Form ── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 backdrop-blur-xl border-b" style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>StandupSync</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header card */}
        <div className="app-card glow-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-purple-900/30">
              ☀️
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Good morning, {info?.member_name}!
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {info?.team_name} · Daily Check-in · {info?.date}
              </p>
            </div>
          </div>
        </div>

        {/* Hours confirmation banner — shown when manager has set hourly_rate but member hasn't confirmed hours yet */}
        {info?.hours_confirmation_needed && !hoursConfirmed && (
          <div className="rounded-xl px-5 py-4 mb-5 border" style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.35)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⏱️</span>
              <span className="text-sm font-semibold" style={{ color: '#fbbf24' }}>Quick: confirm your working hours</span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              Your manager tracks team costs. How many hours do you work per day?
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                className="w-20 rounded-lg px-3 py-2 text-sm font-semibold text-center"
                style={{ background: 'var(--bg-card)', border: '1px solid rgba(251,191,36,0.4)', color: 'var(--text-primary)' }}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>hours / day</span>
              <button
                type="button"
                disabled={hoursConfirming}
                onClick={async () => {
                  const hrs = Number(hoursInput);
                  if (hrs < 0.5 || hrs > 24) return;
                  setHoursConfirming(true);
                  try {
                    await apiCall(`/checkin/${token}/confirm-hours`, 'POST', { hours_per_day: hrs });
                    setHoursConfirmed(true);
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setHoursConfirming(false);
                  }
                }}
                className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}
              >
                {hoursConfirming ? '...' : '✓ Confirm'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.map((q, idx) => {
            const icon = QUESTION_ICONS[idx] || '📌';
            if (q.is_blocker_type) {
              return (
                <div key={q.id} className="app-card glow-card p-5">
                  <div className="flex items-center gap-2 font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="text-lg">{icon}</span>
                    <span>{q.label}</span>
                    <span className="ml-auto text-xs font-normal" style={{ color: 'var(--text-muted)' }}>optional</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setBlockerActive((prev) => ({ ...prev, [q.id]: false }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        !blockerActive[q.id]
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-transparent border-violet-500/30 text-gray-400 hover:border-violet-500/60'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlockerActive((prev) => ({ ...prev, [q.id]: true }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                        blockerActive[q.id]
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-transparent border-violet-500/30 text-gray-400 hover:border-violet-500/60'
                      }`}
                    >
                      Yes
                    </button>
                  </div>
                  {blockerActive[q.id] && (
                    <textarea
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Describe the blocker…"
                      className="app-input resize-none"
                      style={{ minHeight: '80px' }}
                    />
                  )}
                </div>
              );
            }

            return (
              <div key={q.id} className="app-card glow-card p-5">
                <label className="flex items-center gap-2 font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">{icon}</span>
                  <span>{q.label}</span>
                  {!q.required && <span className="ml-auto text-xs font-normal" style={{ color: 'var(--text-muted)' }}>optional</span>}
                </label>
                <textarea
                  required={q.required}
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  placeholder="Share your update…"
                  className="app-input resize-none"
                  style={{ minHeight: '80px' }}
                />
              </div>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : 'Submit Check-in →'}
          </button>
        </form>
      </div>
    </div>
  );
}
