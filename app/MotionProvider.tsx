'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

interface MotionProviderProps {
  children: React.ReactNode;
}

export default function MotionProvider({ children }: MotionProviderProps) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
