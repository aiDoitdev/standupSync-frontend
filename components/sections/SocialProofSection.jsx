'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection.jsx';

/* ─── Original testimonial section commented out — product not launched yet ──
   Uncomment and replace the export below once real testimonials are collected.

const testimonials = [
  { quote: '...', name: 'David Park', role: 'Engineering Manager', company: 'Stripe', ... },
  ...
];
const companies = ['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Loom'];
─────────────────────────────────────────────────────────────────────────────── */

export default function SocialProofSection() {
  return (
    <AnimatedSection
      id="testimonials"
      className="py-24 px-6 bg-gradient-to-b from-[#100535] to-[#0d0628] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-sm font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Built for the new way of work
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            The async standup your remote team{' '}
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-purple-300 bg-clip-text text-transparent">
              actually wants ✨
            </span>
          </h2>
          <p className="text-violet-300 text-lg max-w-2xl mx-auto">
            No more 9 AM Zoom calls. AI Task Radar tracks progress, Blocker Intelligence flags issues
            — your team gets clarity without the meeting tax.
          </p>
        </div>

        {/* Image showcase */}
        <m.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mx-auto max-w-4xl"
        >
          {/* Glow behind image */}
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-purple-500/25 to-fuchsia-600/20 rounded-3xl blur-2xl" />

          {/* Image card */}
          <div className="relative rounded-2xl overflow-hidden border border-violet-500/30 shadow-2xl shadow-purple-950/60">
            <Image
              src="/standup-teams.png"
              alt="Daily standup for remote teams — StandupSync"
              width={1280}
              height={720}
              priority
              className="w-full h-auto object-cover"
            />
            {/* Subtle gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d0628]/80 to-transparent" />
          </div>
        </m.div>

        {/* Vibe pills */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {[
            { emoji: '🎯', text: 'AI Task Radar' },
            { emoji: '🛡️', text: 'Blocker Intelligence' },
            { emoji: '⚡', text: 'No more 45-min calls' },
            { emoji: '🌍', text: 'Async across timezones' },
            { emoji: '🚫', text: 'Zero meeting fatigue' },
          ].map((pill) => (
            <span
              key={pill.text}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-violet-500/20 text-violet-200 text-sm font-medium hover:bg-white/[0.09] hover:border-violet-400/40 transition-all cursor-default"
            >
              <span>{pill.emoji}</span>
              {pill.text}
            </span>
          ))}
        </m.div>
      </div>
    </AnimatedSection>
  );
}
