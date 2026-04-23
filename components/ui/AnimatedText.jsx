'use client';

import { m } from 'framer-motion';
import { transitions } from '@/lib/animations.js';
import { useReducedMotion } from 'framer-motion';

export default function AnimatedText({
  children,
  as: Tag = 'p',
  delay = 0,
  className,
}) {
  const shouldReduce = useReducedMotion();

  const animationProps = {
    initial: {
      opacity: 0,
      y: shouldReduce ? 0 : 30,
    },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: shouldReduce ? 0.01 : transitions.hero.duration,
      ease: transitions.hero.ease,
      delay: shouldReduce ? 0 : delay,
    },
    className,
  };

  switch (Tag) {
    case 'h1':
      return <m.h1 {...animationProps}>{children}</m.h1>;
    case 'h2':
      return <m.h2 {...animationProps}>{children}</m.h2>;
    case 'h3':
      return <m.h3 {...animationProps}>{children}</m.h3>;
    case 'span':
      return <m.span {...animationProps}>{children}</m.span>;
    case 'p':
    default:
      return <m.p {...animationProps}>{children}</m.p>;
  }
}
