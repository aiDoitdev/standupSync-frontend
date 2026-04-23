'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCall, saveAuth } from '../../lib/api';
import { ThemeToggle } from '@/components/ThemeProvider';

const FEATURES = [
  { icon: '⚡', text: 'Automated daily check-ins via email' },
  { icon: '🤖', text: 'AI-powered blocker detection' },
  { icon: '📊', text: 'Real-time team progress dashboard' },
  { icon: '🔔', text: 'Instant manager alerts for blockers' },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/auth/login', 'POST', form);
      saveAuth(data.access_token, {
        id: data.user_id,
        name: data.name,
        role: data.role,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden bg-gradient-to-br from-[#0d0628] via-[#1a0845] to-[#0d0628]">
        {/* Purple mesh blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-700/20 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-800/25 blur-3xl" />
          <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/50">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">StandupSync</span>
          </Link>

          {/* Main copy */}
          <div className="my-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-xs font-medium">Trusted by 500+ engineering teams</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Your team's pulse,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">every single day.</span>
            </h1>
            <p className="text-violet-300 text-base leading-relaxed mb-10 max-w-sm">
              Replace chaotic Slack threads with structured async standups. Know exactly who's blocked before it becomes a problem.
            </p>

            {/* Features list */}
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/25 border border-violet-500/30 flex items-center justify-center flex-shrink-0 text-base">
                    {f.icon}
                  </div>
                  <span className="text-violet-200 text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-auto pt-8 border-t border-violet-500/20">
            <p className="text-violet-200 text-sm italic leading-relaxed mb-3">
              "StandupSync cut our morning slack noise by 80%. Our managers know who's blocked before the coffee's done."
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">S</div>
              <div>
                <p className="text-white text-xs font-semibold">Sarah Chen</p>
                <p className="text-violet-400 text-xs">Engineering Manager, Acme Corp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--nav-border)' }}>
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">⚡</span>
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>StandupSync</span>
          </Link>
          <div className="lg:ml-auto flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Form center */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to your StandupSync dashboard.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="app-label">Email address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@company.com"
                  className="app-input"
                />
              </div>
              <div>
                <label className="app-label">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  className="app-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign in →'}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-violet-500 hover:text-violet-400 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

