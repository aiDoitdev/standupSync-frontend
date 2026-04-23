'use client';

export default function FooterSection() {
  return (
    <footer className="bg-[#07031a] border-t border-white/8 text-violet-400 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-9 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm shadow-lg shadow-purple-900/40">
                ⚡
              </div>
              <span className="text-white font-bold text-lg">StandupSync</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-3 text-violet-400/80">
              AI-powered async daily standups for remote teams. AI Task Radar tracks progress.
              Blocker Intelligence flags issues. Zero meetings needed.
            </p>
            <div className="flex gap-2 mb-5">
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">🎯 AI Task Radar</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">🛡️ Blocker Intelligence</span>
            </div>
            <p className="text-xs text-violet-600">
              © {new Date().getFullYear()} StandupSync. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#waitlist" className="hover:text-white transition-colors">Join Waitlist</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {['About', 'Blog', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-7 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-violet-600">
            Built with ❤️ for remote teams worldwide · <a href="mailto:support@standupsync.ai" className="hover:text-violet-400 transition-colors">support@standupsync.ai</a>
          </p>
          <div className="flex gap-5 text-sm">
            {[
              { label: 'Twitter', href: 'https://twitter.com/standupsync' },
              { label: 'LinkedIn', href: '#' },
              { label: 'GitHub', href: '#' },
            ].map((platform) => (
              <a key={platform.label} href={platform.href} rel="noopener noreferrer" className="hover:text-white transition-colors">
                {platform.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
