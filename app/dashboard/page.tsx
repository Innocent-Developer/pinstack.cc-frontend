'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SubmissionsManager from '../../components/SubmissionsManager';
import { clearAuth, getStoredUser, getToken, StoredUser } from '../../lib/auth';
import { api } from '../../lib/api';
import type { Product } from '../../types';

type Tab = 'overview' | 'submissions';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [checking, setChecking] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [tab, setTab] = useState<Tab>('submissions');

  useEffect(() => {
    const boot = async () => {
      const stored = getStoredUser();
      const token = getToken();
      if (!stored || !token) {
        router.replace('/login?next=/dashboard');
        return;
      }
      try {
        const me = await api.getMe(token);
        setUser(me.user);
        const mine = await api.getMyProducts(token);
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

  if (checking || !user) {
    return (
      <>
        <Header />
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-20">
          <div className="h-48 rounded-2xl bg-bgAlt animate-pulse" />
        </main>
        <Footer />
      </>
    );
  }

  const firstName = user.name.split(' ')[0];

  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_280px)]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-primary mb-1">Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
                Hi, {firstName}
              </h1>
              <p className="text-sm text-muted mt-1">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="self-start lg:self-auto px-4 py-2 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
            >
              Log out
            </button>
          </div>

          {/* Google-like tab bar */}
          <div className="flex gap-1 border-b border-borderC mb-7 overflow-x-auto -mx-1 px-1 scrollbar-none">
            {(
              [
                { key: 'submissions' as Tab, label: 'My submissions', count: stats.total },
                { key: 'overview' as Tab, label: 'Overview' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`relative px-4 py-3 text-sm font-semibold transition ${
                  tab === t.key ? 'text-primary' : 'text-muted hover:text-heading'
                }`}
              >
                {t.label}
                {'count' in t && t.count !== undefined ? (
                  <span className="ml-1.5 text-xs tabular-nums opacity-70">{t.count}</span>
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

              <div className="grid sm:grid-cols-2 gap-3">
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
                  className="rounded-2xl border border-primary/25 bg-bgAlt p-5 hover:border-primary transition"
                >
                  <p className="text-xs font-semibold text-primary mb-1">Create</p>
                  <h2 className="font-extrabold text-heading mb-1">Add a product</h2>
                  <p className="text-sm text-muted">
                    Multi-step form with AI assist, logo, and screenshots.
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
    </>
  );
}
