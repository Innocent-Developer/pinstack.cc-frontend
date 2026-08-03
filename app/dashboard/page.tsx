'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SubmissionsManager from '../../components/SubmissionsManager';
import AccountVerificationPanel from '../../components/AccountVerificationPanel';
import AccountVerifiedTick from '../../components/AccountVerifiedTick';
import { clearAuth, getStoredUser, getToken, setAuth, StoredUser } from '../../lib/auth';
import { api } from '../../lib/api';
import type { Product } from '../../types';

type Tab = 'overview' | 'submissions' | 'verify';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [checking, setChecking] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [tab, setTab] = useState<Tab>('submissions');

  useEffect(() => {
    const boot = async () => {
      const stored = getStoredUser();
      const tok = getToken();
      if (!stored || !tok) {
        router.replace('/login?next=/dashboard');
        return;
      }
      try {
        const me = await api.getMe(tok);
        const nextUser: StoredUser = {
          id: me.user.id,
          name: me.user.name,
          email: me.user.email,
          isAccountVerified: !!me.user.isAccountVerified,
          accountType: me.user.accountType ?? null,
          companyName: me.user.companyName ?? null,
          slug: me.user.slug ?? null,
          avatarUrl: me.user.avatarUrl ?? null,
        };
        setAuth(tok, nextUser);
        setUser(nextUser);
        setToken(tok);
        const mine = await api.getMyProducts(tok);
        setProducts(mine.data || []);
      } catch {
        clearAuth();
        router.replace('/login?next=/dashboard');
        return;
      } finally {
        setChecking(false);
        setLoadingList(false);
      }
    };
    boot();
  }, [router]);

  const stats = useMemo(() => {
    const pending = products.filter((p) => p.status === 'pending').length;
    const approved = products.filter((p) => p.status === 'approved').length;
    const rejected = products.filter((p) => p.status === 'rejected').length;
    const views = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const clicks = products.reduce((sum, p) => sum + (p.websiteClickCount || 0), 0);
    return { pending, approved, rejected, views, clicks, total: products.length };
  }, [products]);

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (checking || !user || !token) {
    return (
      <div className="flex flex-col flex-1 min-h-dvh">
        <Header />
        <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-20">
          <div className="h-48 rounded-2xl bg-bgAlt animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  const firstName = user.name.split(' ')[0];

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_280px)]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-primary mb-1">Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight inline-flex items-center gap-2">
                Hi, {firstName}
                {user.isAccountVerified ? <AccountVerifiedTick size={22} /> : null}
              </h1>
              <p className="text-sm text-muted mt-1">{user.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 self-start lg:self-auto">
              <Link
                href="/dashboard/profile"
                className="px-4 py-2 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
              >
                Log out
              </button>
            </div>
          </div>

          <div className="flex gap-1 border-b border-borderC mb-7 overflow-x-auto -mx-1 px-1 scrollbar-none">
            {(
              [
                { key: 'submissions' as Tab, label: 'My submissions', count: stats.total },
                { key: 'verify' as Tab, label: 'Verify account' },
                { key: 'overview' as Tab, label: 'Overview' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                  tab === t.key ? 'text-primary' : 'text-muted hover:text-heading'
                }`}
              >
                {t.label}
                {'count' in t && t.count !== undefined ? (
                  <span className="ml-1.5 text-xs tabular-nums opacity-70">{t.count}</span>
                ) : null}
                {t.key === 'verify' && user.isAccountVerified ? (
                  <span className="ml-1.5 inline-block align-middle">
                    <AccountVerifiedTick size={12} />
                  </span>
                ) : null}
                {tab === t.key && (
                  <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {tab === 'submissions' ? (
            <SubmissionsManager
              products={products}
              loading={loadingList}
              onChanged={setProducts}
            />
          ) : tab === 'verify' ? (
            <AccountVerificationPanel
              token={token}
              defaultName={user.name}
              onVerifiedChange={(verified) => {
                setUser((u) => (u ? { ...u, isAccountVerified: verified } : u));
                const tok = getToken();
                const stored = getStoredUser();
                if (tok && stored) {
                  setAuth(tok, { ...stored, isAccountVerified: verified });
                }
              }}
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Listings', value: stats.total },
                  { label: 'Pending', value: stats.pending },
                  { label: 'Live', value: stats.approved },
                  { label: 'Views', value: stats.views },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-borderC bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <p className="text-2xl font-extrabold text-heading tabular-nums">{s.value}</p>
                    <p className="text-xs text-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {!user.isAccountVerified && (
                <button
                  type="button"
                  onClick={() => setTab('verify')}
                  className="w-full text-left rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 hover:border-emerald-400 transition"
                >
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Trust</p>
                  <h2 className="font-extrabold text-heading mb-1">Get your green verification tick</h2>
                  <p className="text-sm text-muted">
                    Free (up to 7 days) or $9 priority (under 24h). Verified accounts skip product
                    review.
                  </p>
                </button>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  href="/dashboard/profile"
                  className="rounded-2xl border border-borderC bg-white p-5 hover:border-primary/40 hover:shadow-sm transition"
                >
                  <p className="text-xs font-semibold text-primary mb-1">Profile</p>
                  <h2 className="font-extrabold text-heading mb-1">Edit your maker page</h2>
                  <p className="text-sm text-muted">
                    Personal info, bio, socials, and public profile URL.
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => setTab('submissions')}
                  className="text-left rounded-2xl border border-borderC bg-white p-5 hover:border-primary/40 hover:shadow-sm transition"
                >
                  <p className="text-xs font-semibold text-primary mb-1">Manage</p>
                  <h2 className="font-extrabold text-heading mb-1">Open submissions</h2>
                  <p className="text-sm text-muted">
                    View, edit, or delete your listings {stats.pending} pending review.
                  </p>
                </button>
                <Link
                  href="/dashboard/add-product"
                  className="sm:col-span-2 rounded-2xl border border-primary/25 bg-bgAlt p-5 hover:border-primary transition"
                >
                  <p className="text-xs font-semibold text-primary mb-1">Create</p>
                  <h2 className="font-extrabold text-heading mb-1">Add a product</h2>
                  <p className="text-sm text-muted">
                    {user.isAccountVerified
                      ? 'Verified account — new listings go live without pending review.'
                      : 'Multi-step form with AI assist, logo, and screenshots.'}
                  </p>
                </Link>
              </div>

              <div className="rounded-2xl border border-borderC bg-white p-5">
                <h2 className="font-extrabold text-heading mb-3">Quick links</h2>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/explore"
                    className="px-3.5 py-2 rounded-full text-xs font-semibold border border-borderC text-heading hover:bg-bgAlt"
                  >
                    Explore directory
                  </Link>
                  <Link
                    href="/categories"
                    className="px-3.5 py-2 rounded-full text-xs font-semibold border border-borderC text-heading hover:bg-bgAlt"
                  >
                    Categories
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-3.5 py-2 rounded-full text-xs font-semibold border border-borderC text-heading hover:bg-bgAlt"
                  >
                    Pricing
                  </Link>
                </div>
                <p className="text-xs text-muted mt-4">
                  Site clicks across your listings: {stats.clicks}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
