'use client';

import { m } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection.jsx';
import { staggerContainer, staggerItem } from '@/lib/animations.js';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1 team · up to 3 members',
      'Daily email check-ins',
      'Blocker tracking',
      '7-day check-in history',
      'Live team dashboard',
    ],
    cta: 'Get Started Free',
    ctaLink: '/signup',
    accent: false,
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    features: [
      'Unlimited teams · up to 15 members',
      'Daily email check-ins',
      '🎯 AI Task Radar',
      '🛡️ Blocker Intelligence',
      '30-day check-in history',
      'AI-written daily summaries',
      'Priority email support',
    ],
    cta: 'Start Free, Upgrade Later',
    ctaLink: '/signup',
    accent: true,
    badge: '⚡ Most Popular',
  },
];

export default function PricingSection() {
  return (
    <AnimatedSection
      id="pricing"
      className="py-24 px-6"
      style={{ background: '#0d0628' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-sm font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Simple Pricing
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Start free, scale when you&apos;re ready
          </h2>
          <p className="text-violet-300 text-lg max-w-xl mx-auto mb-3">
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>
          <p className="text-sm text-violet-500">
            Prices in USD · EUR auto-detected at checkout
          </p>
        </div>

        <m.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto"
        >
          {plans.map((plan) => (
            <m.div
              key={plan.name}
              variants={staggerItem}
              className={`p-8 rounded-2xl border-2 relative ${
                plan.accent
                  ? 'border-violet-500 shadow-lg shadow-violet-500/20'
                  : 'border-gray-700/50'
              }`}
              style={{ background: plan.accent ? 'rgba(109,40,217,0.15)' : 'rgba(255,255,255,0.03)' }}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-violet-600 text-white px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-bold mt-2 mb-1 text-white">{plan.name}</h3>
              <p className="text-4xl font-bold mb-1 text-white">
                {plan.price}
                <span className="text-base font-normal text-gray-400">
                  {' '}{plan.period}
                </span>
              </p>
              {plan.accent && (
                <p className="text-xs text-violet-400 mb-6">per team · billed monthly</p>
              )}
              {!plan.accent && <div className="mb-6" />}
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => {
                  const isAI = f.startsWith('🎯') || f.startsWith('🛡️');
                  return (
                    <li key={f} className={`text-sm flex gap-2 items-start ${isAI ? 'text-violet-200 font-medium' : 'text-gray-300'}`}>
                      {isAI
                        ? <span className="shrink-0 mt-px">{f.slice(0, 2)}</span>
                        : <span className="text-violet-400 shrink-0 mt-px">✓</span>
                      }
                      {isAI ? f.slice(2).trim() : f}
                    </li>
                  );
                })}
              </ul>
              <a
                href={plan.ctaLink}
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-all ${
                  plan.accent
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'border border-gray-600 text-gray-300 hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </a>
            </m.div>
          ))}
        </m.div>

        <p className="text-center text-sm text-gray-500 mt-10">
          Need more than 15 members? <a href="mailto:support@standopsync.com" className="text-violet-400 hover:underline">Contact us</a> for custom plans.
        </p>
      </div>
    </AnimatedSection>
  );
}
