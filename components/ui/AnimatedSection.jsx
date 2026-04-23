'use client';

import { m } from 'framer-motion';
import { scrollReveal, transitions } from '@/lib/animations.js';
import { useReducedMotion } from 'framer-motion';

export default function AnimatedSection({
  children,
  className,
  delay = 0,
  id,
}) {
  const shouldReduce = useReducedMotion();

  return (
    <m.section
      id={id}
      variants={scrollReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: shouldReduce ? 0.01 : transitions.reveal.duration,
        ease: transitions.reveal.ease,
        delay: shouldReduce ? 0 : delay,
      }}
      className={className}
    >
      {children}
    </m.section>
  );
}
