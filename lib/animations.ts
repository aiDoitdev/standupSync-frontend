import type { Variants, Transition } from 'framer-motion';

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
};

export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export const transitions = {
  hero:   { duration: 0.65, ease: 'easeOut' } satisfies Transition,
  reveal: { duration: 0.55, ease: 'easeOut' } satisfies Transition,
  fast:   { duration: 0.2,  ease: 'easeOut' } satisfies Transition,
  spring: { type: 'spring', stiffness: 300, damping: 22 } satisfies Transition,
};
