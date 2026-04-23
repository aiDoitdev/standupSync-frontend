'use client';
import { useEffect, useState } from 'react';
import { apiCall, saveAuth } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeProvider';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function JoinPage({ params }) {
  const { token } = params;
  const router = useRouter();
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [joined, setJoined] = useState(false);
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiCall(`/invite/${token}`);
        setInviteInfo(data);
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
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const data = await apiCall(`/invite/${token}/accept`, 'POST', form);
      saveAuth(data.access_token, {
        id: data.user_id,
        name: data.name,
        role: data.role,
      });
      setJoined(true);
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
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Invite Link Invalid</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            This invite link is invalid, already used, or has expired. Ask your manager to send a new invite.
          </p>
        </div>
      </div>
    );
  }

  /* ── Joined success ── */
  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-page)' }}>
        <div className="app-card glow-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-5 shadow-xl shadow-purple-900/30">
            🎉
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome aboard!</h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            You&apos;ve joined <strong className="text-violet-500">{inviteInfo?.team_name}</strong>.
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Your manager will send your first check-in email tomorrow morning.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  /* ── Join form (split-screen) ── */
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden bg-gradient-to-br from-[#0d0628] via-[#1a0845] to-[#0d0628]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-700/20 blur-3xl" />
          <div className="absolute bottom-[10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-purple-800/25 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/50">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">StandupSync</span>
          </Link>

          <div className="my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
              <span className="text-xl">👋</span>
              <span className="text-violet-300 text-xs font-medium">You&apos;ve been invited!</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">{inviteInfo?.team_name}</span>
            </h1>
            <p className="text-violet-300 text-base leading-relaxed mb-8 max-w-sm">
              You&apos;re joining a team that uses StandupSync for async daily standups. No more morning Slack noise.
            </p>

            <div className="space-y-3 max-w-xs">
              {['Receive daily check-in emails', 'Submit updates in 30 seconds', 'View your team\'s progress'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-violet-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-violet-500/20">
            <p className="text-violet-400 text-xs">Invited as: <span className="text-violet-300 font-medium">{inviteInfo?.email}</span></p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--nav-border)' }}>
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>StandupSync</span>
          </Link>
          <div className="lg:ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="lg:hidden mb-3">
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-violet-500/20 text-violet-500">
                  👋 You&apos;ve been invited to {inviteInfo?.team_name}
                </span>
              </div>
              <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Set up your account</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Joining as <span className="font-medium text-violet-500">{inviteInfo?.email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="app-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="app-input"
                />
              </div>
              <div>
                <label className="app-label">Choose a Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="app-input"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Joining…
                  </>
                ) : 'Join Team →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


