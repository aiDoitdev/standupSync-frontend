'use client';

import { m } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection.jsx';
import { transitions } from '@/lib/animations.js';

const steps = [
  {
    icon: '📧',
    number: '01',
    title: 'Invite Your Team',
    description:
      'Add team members with a single email. They join instantly via a magic link — no account setup, no app install required.',
    tag: 'Setup in 2 minutes',
    color: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/25',
  },
  {
    icon: '⚡',
    number: '02',
    title: 'AI Sends Morning Check-ins',
    description:
      'Every morning, each member receives 3 smart questions via email. Answering takes under 30 seconds from any device.',
    tag: '30-second responses',
    color: 'from-purple-500 to-fuchsia-600',
    glow: 'shadow-purple-500/25',
  },
  {
    icon: '🤖',
    number: '03',
    title: 'AI Analyzes & Summarizes',
    description:
      'StandupSync AI reads every response, flags blockers automatically, and delivers a crisp summary to your dashboard — no meeting needed.',
    tag: 'Zero meetings',
    color: 'from-fuchsia-500 to-pink-600',
    glow: 'shadow-fuchsia-500/25',
  },
];

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.6, ease: 'easeInOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, x: -32 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.2 + 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function HowItWorksSection() {
  return (
    <AnimatedSection
      id="how-it-works"
      className="py-24 px-6 bg-gradient-to-b from-[#0d0628] to-[#100535]"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-sm font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            How it Works
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            From invite to AI insights in 3 steps
          </h2>
          <p className="text-violet-300 text-lg max-w-xl mx-auto">
            Set up in 2 minutes. Your team runs its first AI-powered standup tomorrow morning — no app installs, no training required.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine line */}
          <m.div
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="absolute left-[27px] md:left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/60 via-purple-500/40 to-fuchsia-500/20 origin-top"
          />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <m.div
                key={step.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                className="relative flex gap-6 md:gap-10 items-start"
              >
                {/* Node on the timeline */}
                <div className="relative flex-shrink-0 z-10">
                  <div
                    className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-2xl md:text-4xl shadow-2xl ${step.glow} border border-white/10`}
                  >
                    {step.icon}
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0d0628] border-2 border-violet-500/60 flex items-center justify-center">
                    <span className="text-[10px] font-black text-violet-400">{i + 1}</span>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 group">
                  <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.07] hover:border-violet-500/30 transition-all duration-300">
                    {/* Step label */}
                    <span className="text-xs font-bold tracking-widest text-violet-500 uppercase mb-2 block">
                      Step {step.number}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-100 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-violet-300 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                    {/* Tag */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                      {step.tag}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
