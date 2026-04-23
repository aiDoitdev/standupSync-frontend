'use client';

import { m } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection.jsx';
import { staggerContainer, staggerItem } from '@/lib/animations.js';

const features = [
  {
    icon: '🎯',
    title: 'AI Task Radar',
    desc: 'Automatically tracks every task mentioned across all check-ins. AI maps progress, detects stalled work, and surfaces what needs attention — before it becomes a problem.',
    highlight: true,
    badge: 'New',
  },
  {
    icon: '🛡️',
    title: 'Blocker Intelligence',
    desc: 'Goes beyond simple flagging — AI understands blocker severity, impact on team velocity, and recommends the right person to resolve each issue automatically.',
    highlight: true,
    badge: 'New',
  },
  {
    icon: '⚡',
    title: '30-Second Check-ins',
    desc: 'No meetings, no chat threads, no back-and-forth. Team members answer 3 focused questions in under 30 seconds via email.',
    highlight: false,
  },
  {
    icon: '📊',
    title: 'Live Team Dashboard',
    desc: "See who's checked in, who's blocked, and your team's overall pulse — all in one real-time dashboard.",
    highlight: false,
  },
  {
    icon: '📝',
    title: 'AI-Written Summaries',
    desc: 'Get a clean, scannable daily digest every morning — written by AI, zero effort required from you.',
    highlight: false,
  },
  {
    icon: '🌍',
    title: 'Async & Timezone-Friendly',
    desc: "Distributed teams across continents? No problem. Daily updates happen on everyone's local schedule, asynchronously.",
    highlight: false,
  },
];

export default function FeaturesSection() {
  return (
    <AnimatedSection
      id="features"
      className="py-24 px-6 bg-gradient-to-b from-[#100535] via-[#160840] to-[#100535]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-sm font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            AI-Powered Features
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Everything your team needs — powered by AI
          </h2>
          <p className="text-violet-300 text-lg max-w-2xl mx-auto">
            Not a generic meeting tool. StandupSync is purpose-built with AI Task Radar and Blocker
            Intelligence — so your team gets clarity and velocity without the overhead of meetings.
          </p>
        </div>

        {/* Feature grid */}
        <m.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 list-none m-0 p-0"
        >
          {features.map((f) => (
            <m.li
              key={f.title}
              variants={staggerItem}
              className={`group p-6 rounded-2xl border transition-all cursor-default relative overflow-hidden ${
                f.highlight
                  ? 'bg-gradient-to-br from-violet-600/25 to-purple-700/15 border-violet-500/50 shadow-xl shadow-violet-950/40'
                  : 'bg-white/[0.04] border-white/8 hover:bg-white/[0.07] hover:border-violet-500/25'
              }`}
            >
              {f.highlight && (
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 pointer-events-none" />
              )}
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{f.icon}</span>
                {f.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 tracking-wide uppercase">
                    {f.badge}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 text-white group-hover:text-violet-100 transition-colors">
                {f.title}
              </h3>
              <p className="text-violet-300 text-sm leading-relaxed">{f.desc}</p>
              {f.highlight && (
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-violet-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  AI-powered
                </div>
              )}
            </m.li>
          ))}
        </m.ul>
      </div>
    </AnimatedSection>
  );
}
