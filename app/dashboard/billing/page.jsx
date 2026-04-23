'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { apiCall, getUser } from '../../../lib/api';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 team', '1 invited member per team', 'Daily email check-ins', 'Blocker tracking', '7-day history'],
  },
  starter: {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    features: ['Unlimited teams', 'Unlimited members/team', 'Daily email check-ins', 'Full blocker workflow', '30-day history', 'Priority support'],
  },
};

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    statusParam === 'success' ? 'Your upgrade was successful! Welcome to Starter. All your teams now have Starter access.' : ''
  );

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push('/login'); return; }
    fetchBilling();
  }, []);

  async function fetchBilling() {
    try {
      const data = await apiCall('/billing/status');
      setBilling(data);
    } catch (err) {
      setBilling({ plan: 'free', plan_status: 'active' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setUpgrading(true);
    setError('');
    try {
      const data = await apiCall('/billing/checkout', 'POST');
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.message);
      setUpgrading(false);
    }
  }

  async function handleManageSubscription() {
    setError('');
    try {
      const data = await apiCall('/billing/portal', 'POST');
      window.location.href = data.portal_url;
    } catch (err) {
      setError(err.message);
    }
  }

  const currentPlan = billing?.plan || 'free';
  const planInfo = PLAN_FEATURES[currentPlan] || PLAN_FEATURES.free;
  const isStarter = currentPlan === 'starter';
  const isPastDue = billing?.plan_status === 'past_due';

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Billing & Plan</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your account subscription</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="btn-ghost text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dashboard
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
        )}

        {/* Past due warning */}
        {isPastDue && (
          <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>
            ⚠️ Your last payment failed. Please update your payment method to keep your Starter plan.
          </div>
        )}

        {loading ? <Spinner /> : (
          <div className="space-y-6">
            {/* Current plan card */}
            <div className="app-card glow-card p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{planInfo.name} Plan</h2>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isStarter ? 'bg-violet-500/20 text-violet-400' : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      {isStarter ? '⚡ Active' : 'Current'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {planInfo.price}<span className="text-sm font-normal" style={{ color: 'var(--text-muted)' }}> {planInfo.period}</span>
                  </p>
                  {isStarter && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Applies to all teams you manage
                    </p>
                  )}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {planInfo.features.map((f) => (
                  <li key={f} className="text-sm flex gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="text-violet-400 shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>

              {/* Action buttons */}
              {isStarter ? (
                <button onClick={handleManageSubscription} className="btn-ghost text-sm w-full">
                  Manage Subscription →
                </button>
              ) : (
                <button onClick={handleUpgrade} disabled={upgrading} className="btn-primary w-full">
                  {upgrading ? 'Redirecting to checkout…' : 'Upgrade Account to Starter — $19/mo'}
                </button>
              )}
            </div>

            {/* Comparison table (show when on free) */}
            {!isStarter && (
              <div className="app-card p-6">
                <h3 className="section-header">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  Why upgrade?
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { feature: 'Teams', free: '1 team', starter: 'Unlimited teams' },
                    { feature: 'Members per team', free: '1 invited member', starter: 'Unlimited members' },
                    { feature: 'Check-in history', free: '7 days', starter: '30 days' },
                    { feature: 'Reports & Analytics', free: '—', starter: 'Full access' },
                    { feature: 'Support', free: 'Community', starter: 'Priority email' },
                  ].map((row) => (
                    <div key={row.feature} className="grid grid-cols-3 gap-4 py-2.5 border-b" style={{ borderColor: 'var(--border-card)' }}>
                      <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{row.feature}</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.free}</span>
                      <span className="text-sm text-violet-500 dark:text-violet-400 font-semibold">{row.starter}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<Layout><div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div></Layout>}>
      <BillingContent />
    </Suspense>
  );
}
