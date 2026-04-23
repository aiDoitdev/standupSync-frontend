'use client';

import { m } from 'framer-motion';
import AnimatedSection from '@/components/ui/AnimatedSection.jsx';
import { transitions } from '@/lib/animations.js';

export default function CTASection() {
  return (
    <AnimatedSection className="py-24 px-6 bg-slate-900 text-center">
      <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
      <p className="text-slate-300 mb-10 text-lg max-w-xl mx-auto">
        Join thousands of teams already using StandupSync.
      </p>
      <m.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={transitions.spring}
        className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-lg"
      >
        Start for free
      </m.button>
    </AnimatedSection>
  );
}
