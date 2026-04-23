'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { transitions } from '@/lib/animations.js';

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full px-4 pt-4">
      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex justify-between items-center shadow-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/40">
              <span className="text-white text-sm font-bold">⚡</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">StandupSync</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: 'Features', href: '#features' },
              { label: 'How it Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-violet-300 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <m.a
            href="#waitlist"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={transitions.spring}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
          >
            Join Waitlist →
          </m.a>
        </div>
      </div>
    </nav>
  );
}
