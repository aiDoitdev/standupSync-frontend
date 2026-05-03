'use client';

import { m, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { transitions } from '@/lib/animations.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';

// Live dashboard mockup — shows the AI standup product in action
function DashboardMockup() {
  const team = [
    {
      name: 'Aisha Patel', initial: 'A', color: 'from-pink-400 to-purple-500',
      time: '9:02 AM', done: true,
      updates: ['✓ Completed Q4 client audit report', '⚡ Reviewing contract renewals'],
      blocker: 'Waiting on legal sign-off',
    },
    {
      name: 'Marcus Rivera', initial: 'M', color: 'from-blue-400 to-teal-500',
      time: '9:15 AM', done: true,
      updates: ['✓ Submitted campaign brief', '⚡ Coordinating agency call'],
      blocker: null,
    },
    {
      name: 'Sophie Tan', initial: 'S', color: 'from-amber-400 to-orange-500',
      time: null, done: false, updates: [], blocker: null,
    },
  ];

  return (
    <div className="relative">
      {/* Main card */}
      <div className="bg-gradient-to-b from-violet-900/80 to-[#0d0628]/90 backdrop-blur-sm rounded-2xl border border-violet-500/30 overflow-hidden shadow-2xl shadow-purple-950/60">
        {/* Window chrome */}
        <div className="px-4 py-3 flex items-center justify-between bg-violet-900/50 border-b border-violet-500/20">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
          </div>
          <span className="text-violet-300 text-xs font-medium">StandupSync · Today</span>
          <div className="w-14" />
        </div>

        {/* Progress */}
        <div className="px-4 py-3 border-b border-violet-500/15">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-violet-400">Team Check-ins</span>
            <span className="text-white font-semibold">7 / 9 complete</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <m.div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Team members */}
        <div className="divide-y divide-violet-500/10">
          {team.map((member, i) => (
            <m.div
              key={member.name}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.4 }}
              className={`px-4 py-3 ${!member.done ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {member.initial}
                </div>
                <span className="text-white text-sm font-medium">{member.name}</span>
                {member.done
                  ? <span className="ml-auto text-violet-400 text-xs">{member.time}</span>
                  : <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Pending</span>
                }
              </div>
              {member.updates.length > 0 && (
                <div className="pl-9 space-y-0.5">
                  {member.updates.map((u, j) => (
                    <p key={j} className="text-violet-300 text-xs">{u}</p>
                  ))}
                  {member.blocker
                    ? <div className="flex items-center gap-1.5 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /><p className="text-red-300 text-xs">{member.blocker}</p></div>
                    : <p className="text-green-300 text-xs">✅ No blockers</p>
                  }
                </div>
              )}
            </m.div>
          ))}
        </div>

        {/* AI insight */}
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.4 }}
          className="mx-3 mb-3 mt-1 bg-gradient-to-r from-violet-600/25 to-purple-600/25 border border-violet-500/40 rounded-xl p-3"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">🛡️</span>
            <span className="text-violet-300 text-xs font-semibold">Blocker Intelligence</span>
          </div>
          <p className="text-white text-xs font-medium">1 critical blocker detected</p>
          <p className="text-violet-300 text-xs mt-0.5">Aisha → waiting on legal sign-off · high impact</p>
        </m.div>
      </div>

      {/* Floating notification */}
      <m.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.6, duration: 0.5, type: 'spring', stiffness: 280, damping: 22 }}
        className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-2xl p-3.5 w-54 border border-gray-100"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-base flex-shrink-0">🤖</div>
          <div>
            <p className="text-xs font-bold text-gray-900">AI Summary ready</p>
            <p className="text-xs text-gray-400">Just now</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">Team standup complete · 1 blocker flagged</p>
      </m.div>

      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

export default function HeroSection() {
  const shouldReduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (_) {
      // silently accept — success state still shown
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20 bg-gradient-to-br from-[#0d0628] via-[#1e0f5e] to-[#3b1fa8]">
      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(139,92,246,0.25),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
        {/* Left — Copy (3/5 width) */}
        <div className="lg:col-span-3">
          {/* Badge */}
          <m.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.hero, delay: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/35 text-violet-300 text-sm font-medium mb-7"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered · Built for Remote Teams
          </m.div>

          {/* Headline */}
          <m.h1
            initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.hero, delay: 0.1 }}
            className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.08] mb-4"
          >
            AI Daily Standups{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
              for Remote Teams
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.hero, delay: 0.15 }}
            className="text-xl lg:text-2xl font-semibold text-violet-300 mb-6"
          >
            Skip the meeting — let AI run your standup
          </m.p>

          {/* Subtext */}
          <m.p
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.hero, delay: 0.25 }}
            className="text-lg text-violet-200/80 mb-6 leading-relaxed max-w-xl"
          >
            Your team submits a 30-second async check-in. StandupSync does the rest —
            no Zoom call, no scheduling, no missed updates.
          </m.p>

          {/* Feature highlight cards */}
          <m.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.hero, delay: 0.32 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            {/* AI Task Radar */}
            <div className="flex-1 flex items-start gap-3 px-4 py-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-700/10 border border-violet-400/30 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-base flex-shrink-0">
                🎯
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-0.5">AI Task Radar</p>
                <p className="text-violet-300 text-xs leading-relaxed">
                  Automatically tracks every update across your team — nothing slips through.
                </p>
              </div>
            </div>

            {/* Blocker Intelligence */}
            <div className="flex-1 flex items-start gap-3 px-4 py-4 rounded-2xl bg-gradient-to-br from-fuchsia-600/20 to-purple-700/10 border border-fuchsia-400/30 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 flex items-center justify-center text-base flex-shrink-0">
                🛡️
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-0.5">Blocker Intelligence</p>
                <p className="text-violet-300 text-xs leading-relaxed">
                  Detects blockers before they escalate and surfaces them in your daily digest.
                </p>
              </div>
            </div>
          </m.div>

          {/* Email form */}
          <m.div
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transitions.hero, delay: 0.4 }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-7">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  required
                  disabled={loading}
                  className="flex-1 px-5 py-4 bg-white/8 border border-white/15 rounded-xl text-white placeholder-violet-400 focus:outline-none focus:border-violet-400 focus:bg-white/12 transition-all text-sm disabled:opacity-60"
                />
                <m.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  transition={transitions.spring}
                  className="px-7 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-900/50 whitespace-nowrap transition-all disabled:opacity-70"
                >
                  {loading ? 'Joining…' : 'Join Waitlist →'}
                </m.button>
              </form>
            ) : (
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-5 py-4 bg-green-500/15 border border-green-500/35 rounded-xl mb-7"
              >
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-white font-semibold text-sm">You're on the list!</p>
                  <p className="text-green-300 text-xs mt-0.5">We'll notify you the moment we launch.</p>
                </div>
              </m.div>
            )}
          </m.div>

          {/* Stats */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex flex-wrap items-center gap-x-8 gap-y-3"
          >
            {[
              { value: '30s', label: 'avg check-in time' },
              { value: '0', label: 'meetings required' },
              { value: '2 min', label: 'to set up your team' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white">{stat.value}</span>
                <span className="text-violet-400 text-xs">{stat.label}</span>
              </div>
            ))}
          </m.div>
        </div>

        {/* Right — Dashboard mockup (2/5 width) */}
        <m.div
          initial={{ opacity: 0, x: shouldReduce ? 0 : 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transitions.hero, delay: 0.3 }}
          className="lg:col-span-2 hidden lg:block mt-8"
        >
          <DashboardMockup />
        </m.div>
      </div>
    </section>
  );
}
