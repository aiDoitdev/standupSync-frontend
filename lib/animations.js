export const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
};

// Scroll-reveal — use with whileInView
export const scrollReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

// Stagger container — wraps a list of child items
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

// Stagger child item — must be used with staggerContainer
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

// Timing presets
export const transitions = {
  hero: { duration: 0.65, ease: 'easeOut' },
  reveal: { duration: 0.55, ease: 'easeOut' },
  fast: { duration: 0.2, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 22 },
};
