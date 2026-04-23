'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCall, saveAuth } from '../../lib/api';
import { ThemeToggle } from '@/components/ThemeProvider';

const STEPS = [
  { icon: '1', label: 'Create your account' },
  { icon: '2', label: 'Set up your team' },
  { icon: '3', label: 'Invite members' },
];

const RESEND_COOLDOWN = 60; // seconds

export default function SignupPage() {
  const router = useRouter();

  // Step 1 form state
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // Step 2 state
  const [step, setStep] = useState(1); // 1 | 2
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Resend cooldown
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(countdownRef.current);
  }, []);

  function startResendCountdown() {
    setResendCountdown(RESEND_COOLDOWN);
    countdownRef.current = setInterval(() => {
      setResendCountdown((s) => {
        if (s <= 1) { clearInterval(countdownRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  // ── Step 1: send OTP ────────────────────────────────────────────────────
  async function handleSendOTP(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await apiCall('/auth/signup/send-otp', 'POST', form);
      setOtpDigits(['', '', '', '', '', '']);
      setStep(2);
      startResendCountdown();
      // Auto-focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: resend OTP ──────────────────────────────────────────────────
  async function handleResend() {
    if (resendCountdown > 0) return;
    setError('');
    setLoading(true);
    try {
      await apiCall('/auth/signup/send-otp', 'POST', form);
      setOtpDigits(['', '', '', '', '', '']);
      startResendCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────
  async function handleVerifyOTP(e) {
    e.preventDefault();
    const otp_code = otpDigits.join('');
    if (otp_code.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await apiCall('/auth/signup/verify-otp', 'POST', { ...form, otp_code });
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

  // ── OTP digit input helpers ─────────────────────────────────────────────
  function handleOtpChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    otpRefs.current[lastFilled]?.focus();
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden bg-gradient-to-br from-[#0d0628] via-[#1a0845] to-[#0d0628]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-violet-800/25 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/50">
              <span className="text-white text-lg font-bold">⚡</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">StandupSync</span>
          </Link>

          <div className="my-auto">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Ship faster with<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">zero meeting overhead.</span>
            </h1>
            <p className="text-violet-300 text-base leading-relaxed mb-10 max-w-sm">
              Set up in under 2 minutes. Your team starts checking in tomorrow morning — no training required.
            </p>

            {/* Setup steps */}
            <div className="space-y-5">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-purple-900/40">
                    {s.icon}
                  </div>
                  <span className="text-violet-200 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-violet-500/20">
            <div className="flex items-center gap-3 mb-2">
              {['J', 'M', 'P', 'A'].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#0d0628]"
                  style={{ background: ['#7c3aed','#2563eb','#d97706','#16a34a'][i], marginLeft: i > 0 ? '-8px' : '0' }}>
                  {l}
                </div>
              ))}
              <span className="text-violet-300 text-sm ml-1">500+ teams onboarded</span>
            </div>
            <p className="text-violet-400 text-xs">Free forever for small teams · No credit card required</p>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--nav-border)' }}>
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

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* ── Step 1: Account details ── */}
            {step === 1 && (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Get your team's standups running in minutes.</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="app-label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="app-input"
                    />
                  </div>
                  <div>
                    <label className="app-label">Work Email</label>
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
                      minLength={8}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Minimum 8 characters"
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
                        Sending code…
                      </>
                    ) : 'Send Verification Code →'}
                  </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="text-violet-500 hover:text-violet-400 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {/* ── Step 2: OTP verification ── */}
            {step === 2 && (
              <>
                <div className="mb-8">
                  <button
                    onClick={() => { setStep(1); setError(''); }}
                    className="flex items-center gap-1.5 text-sm mb-5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ← Back
                  </button>
                  <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Check your inbox</h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{form.email}</span>.
                    Enter it below to create your account.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  {/* OTP digit boxes */}
                  <div>
                    <label className="app-label mb-3 block">Verification code</label>
                    <div className="flex gap-3 justify-between" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (otpRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-colors"
                          style={{
                            background: 'var(--input-bg)',
                            borderColor: digit ? 'var(--accent)' : 'var(--input-border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length < 6}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying…
                      </>
                    ) : 'Verify & Create Account →'}
                  </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
                  Didn't receive a code?{' '}
                  <button
                    onClick={handleResend}
                    disabled={resendCountdown > 0 || loading}
                    className="font-semibold transition-colors disabled:opacity-50"
                    style={{ color: resendCountdown > 0 ? 'var(--text-muted)' : 'var(--accent)' }}
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                  </button>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

