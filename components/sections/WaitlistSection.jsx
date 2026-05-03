'use client';

import { m } from 'framer-motion';
import { useState, useEffect } from 'react';
import AnimatedSection from '@/components/ui/AnimatedSection.jsx';
import { transitions } from '@/lib/animations.js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(null);

  // Fetch live subscriber count on mount
  useEffect(() => {
    fetch(`${API_URL}/waitlist/count`)
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {}); // silently fail — UI falls back gracefully
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Something went wrong');
      setCount(data.count);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedSection
      id="waitlist"
      className="py-28 px-6 relative overflow-hidden bg-gradient-to-b from-[#0d0628] via-[#1e0f5e] to-[#0d0628]"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Badge */}
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/35 text-violet-300 text-sm font-medium mb-7"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Now accepting early access
        </m.div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
          Get early access to{' '}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
            AI Standups
          </span>
        </h2>

        <p className="text-violet-300 text-lg leading-relaxed mb-4 max-w-lg mx-auto">
          Join hundreds of remote teams already on the waitlist. Be first to unlock{' '}
          <strong className="text-white font-semibold">AI Task Radar</strong> and{' '}
          <strong className="text-white font-semibold">Blocker Intelligence</strong>.
        </p>
        <p className="text-violet-400 text-sm mb-8">
          No meetings. No Slack noise. Just AI clarity.
        </p>

        {/* Form */}
        {!submitted ? (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                disabled={loading}
                className="flex-1 px-5 py-4 bg-white border border-white/15 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-400 transition-all text-sm disabled:opacity-60"
              />
              <m.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                transition={transitions.spring}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-950/60 whitespace-nowrap transition-all disabled:opacity-70"
              >
                {loading ? 'Joining…' : 'Join Waitlist →'}
              </m.button>
            </form>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          </>
        ) : (
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={transitions.spring}
            className="flex items-center justify-center gap-4 px-6 py-5 bg-green-500/15 border border-green-500/35 rounded-2xl max-w-lg mx-auto mb-7"
          >
            <span className="text-3xl">🎉</span>
            <div className="text-left">
              <p className="text-white font-bold">You're on the list!</p>
              <p className="text-green-300 text-sm mt-0.5">We'll email you the moment early access opens.</p>
            </div>
          </m.div>
        )}

        {/* Live subscriber count */}
        {count !== null && (
          <m.div
            key={count}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-violet-500/20 text-violet-300 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-bold text-white">{count}+</span> teams already on the waitlist
            </span>
          </m.div>
        )}

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6 text-violet-400 text-sm">
          <span className="flex items-center gap-1.5">
            <span>🔒</span> No spam, ever
          </span>
          <span className="flex items-center gap-1.5">
            <span>🚀</span> First to access AI Task Radar
          </span>
          <span className="flex items-center gap-1.5">
            <span>🎁</span> Early access perks
          </span>
        </div>
      </div>
    </AnimatedSection>
  );
}
