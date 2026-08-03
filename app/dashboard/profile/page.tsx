'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import AccountVerifiedTick from '../../../components/AccountVerifiedTick';
import { clearAuth, getStoredUser, getToken, setAuth, StoredUser } from '../../../lib/auth';
import { api } from '../../../lib/api';
import { siteConfig } from '../../../config/site';
import type { AuthUser, Product } from '../../../types';

type Section = 'personal' | 'public' | 'products' | 'trust';

const emptyProfile = {
  name: '',
  bio: '',
  website: '',
  country: '',
  avatarUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  slug: '',
  accountType: 'personal' as 'personal' | 'company',
  companyName: '',
};

export default function DashboardProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [form, setForm] = useState(emptyProfile);
  const [products, setProducts] = useState<Product[]>([]);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>('personal');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boot = async () => {
      const stored = getStoredUser();
      const tok = getToken();
      if (!stored || !tok) {
        router.replace('/login?next=/dashboard/profile');
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
        setProfile(me.user);
        setForm({
          name: me.user.name || '',
          bio: me.user.bio || '',
          website: me.user.website || '',
          country: me.user.country || '',
          avatarUrl: me.user.avatarUrl || '',
          linkedinUrl: me.user.linkedinUrl || '',
          twitterUrl: me.user.twitterUrl || '',
          slug: me.user.slug || '',
          accountType: me.user.accountType === 'company' ? 'company' : 'personal',
          companyName: me.user.companyName || '',
        });
        const mine = await api.getMyProducts(tok);
        setProducts(mine.data || []);
      } catch {
        clearAuth();
        router.replace('/login?next=/dashboard/profile');
        return;
      } finally {
        setChecking(false);
      }
    };
    boot();
  }, [router]);

  const stats = useMemo(() => {
    const pending = products.filter((p) => p.status === 'pending').length;
    const live = products.filter((p) => p.status === 'approved').length;
    const views = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const upvotes = products.reduce((sum, p) => sum + (p.upvoteCount || 0), 0);
    return { pending, live, views, upvotes, total: products.length };
  }, [products]);

  const publicUrl = form.slug
    ? `${siteConfig.url}/makers/${form.slug}`
    : profile?.slug
      ? `${siteConfig.url}/makers/${profile.slug}`
      : null;

  const setField = (key: keyof typeof emptyProfile, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
    setError(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.updateMyProfile(token, {
        name: form.name.trim(),
        bio: form.bio.trim(),
        website: form.website.trim(),
        country: form.country.trim(),
        avatarUrl: form.avatarUrl.trim(),
        linkedinUrl: form.linkedinUrl.trim(),
        twitterUrl: form.twitterUrl.trim(),
        slug: form.slug.trim(),
        accountType: form.accountType,
        companyName: form.companyName.trim(),
      });
      setProfile(res.user);
      setForm((f) => ({
        ...f,
        name: res.user.name || '',
        bio: res.user.bio || '',
        website: res.user.website || '',
        country: res.user.country || '',
        avatarUrl: res.user.avatarUrl || '',
        linkedinUrl: res.user.linkedinUrl || '',
        twitterUrl: res.user.twitterUrl || '',
        slug: res.user.slug || '',
        accountType: res.user.accountType === 'company' ? 'company' : 'personal',
        companyName: res.user.companyName || '',
      }));
      const nextUser: StoredUser = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        isAccountVerified: !!res.user.isAccountVerified,
        accountType: res.user.accountType ?? null,
        companyName: res.user.companyName ?? null,
        slug: res.user.slug ?? null,
        avatarUrl: res.user.avatarUrl ?? null,
      };
      setAuth(token, nextUser);
      setUser(nextUser);
      setMessage('Profile saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file: File | null) => {
    if (!file || !token) return;
    if (file.size > 1_000_000) {
      setError('Avatar must be 1 MB or smaller');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const uploaded = await api.uploadImages(token, { logo: file });
      if (uploaded.logoUrl) {
        setField('avatarUrl', uploaded.logoUrl);
        setMessage('Avatar uploaded — click Save to publish');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
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

  const sections: { key: Section; label: string }[] = [
    { key: 'personal', label: 'Personal' },
    { key: 'public', label: 'Public page' },
    { key: 'products', label: 'Products' },
    { key: 'trust', label: 'Trust' },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_280px)]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-primary mb-1">
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <span className="text-muted mx-1.5">/</span>
                Profile
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight inline-flex items-center gap-2">
                Your profile
                {user.isAccountVerified ? <AccountVerifiedTick size={22} /> : null}
              </h1>
              <p className="text-sm text-muted mt-1">
                Edit personal details, public maker page, and review your listings.
              </p>
            </div>
            {publicUrl ? (
              <Link
                href={`/makers/${form.slug || profile?.slug}`}
                target="_blank"
                className="self-start lg:self-auto px-4 py-2 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
              >
                View public page
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
            {[
              { label: 'Listings', value: stats.total },
              { label: 'Live', value: stats.live },
              { label: 'Views', value: stats.views },
              { label: 'Upvotes', value: stats.upvotes },
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

          <div className="flex gap-1 border-b border-borderC mb-7 overflow-x-auto -mx-1 px-1 scrollbar-none">
            {sections.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSection(t.key)}
                className={`relative px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                  section === t.key ? 'text-primary' : 'text-muted hover:text-heading'
                }`}
              >
                {t.label}
                {section === t.key && (
                  <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {(message || error) && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                error
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {error || message}
            </div>
          )}

          {section === 'personal' || section === 'public' ? (
            <form onSubmit={handleSave} className="space-y-6">
              {section === 'personal' ? (
                <>
                  <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
                    <h2 className="font-extrabold text-heading mb-1">Personal info</h2>
                    <p className="text-sm text-muted mb-5">
                      Shown on your maker page and next to products you list.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 mb-6">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-bgAlt border border-borderC shrink-0">
                        {form.avatarUrl ? (
                          <Image
                            src={form.avatarUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-muted">
                            {(form.name || user.name).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-muted mb-1.5">
                          Avatar
                        </label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          disabled={uploading}
                          onChange={(e) => handleAvatar(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-body file:mr-3 file:rounded-full file:border-0 file:bg-bgAlt file:px-3 file:py-1.5 file:text-xs file:font-semibold"
                        />
                        <p className="text-xs text-muted mt-1.5">PNG/JPG/WebP, max 1 MB</p>
                        <input
                          type="url"
                          value={form.avatarUrl}
                          onChange={(e) => setField('avatarUrl', e.target.value)}
                          placeholder="Or paste image URL"
                          className="mt-3 w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block sm:col-span-2">
                        <span className="block text-xs font-semibold text-muted mb-1.5">
                          Display name
                        </span>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setField('name', e.target.value)}
                          className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-muted mb-1.5">
                          Email
                        </span>
                        <input
                          disabled
                          value={user.email}
                          className="w-full rounded-xl border border-borderC bg-bgAlt px-3 py-2.5 text-sm text-muted"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-xs font-semibold text-muted mb-1.5">
                          Country
                        </span>
                        <input
                          value={form.country}
                          onChange={(e) => setField('country', e.target.value)}
                          placeholder="e.g. United States"
                          className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="block text-xs font-semibold text-muted mb-1.5">Bio</span>
                        <textarea
                          value={form.bio}
                          onChange={(e) => setField('bio', e.target.value)}
                          rows={4}
                          maxLength={600}
                          placeholder="Short intro for visitors on your public page"
                          className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm resize-y"
                        />
                        <span className="text-[11px] text-muted">{form.bio.length}/600</span>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="block text-xs font-semibold text-muted mb-1.5">
                          Website
                        </span>
                        <input
                          type="url"
                          value={form.website}
                          onChange={(e) => setField('website', e.target.value)}
                          placeholder="https://"
                          className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
                    <h2 className="font-extrabold text-heading mb-1">Account type</h2>
                    <p className="text-sm text-muted mb-4">
                      Personal founder or company listing.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(['personal', 'company'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, accountType: t }));
                            setMessage(null);
                            setError(null);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                            form.accountType === t
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-borderC text-heading hover:bg-bgAlt'
                          }`}
                        >
                          {t === 'personal' ? 'Personal' : 'Company'}
                        </button>
                      ))}
                    </div>
                    {form.accountType === 'company' ? (
                      <label className="block">
                        <span className="block text-xs font-semibold text-muted mb-1.5">
                          Company name
                        </span>
                        <input
                          value={form.companyName}
                          onChange={(e) => setField('companyName', e.target.value)}
                          className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                        />
                      </label>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="font-extrabold text-heading mb-1">Public maker page</h2>
                    <p className="text-sm text-muted">
                      Your public URL is where visitors land from product pages.
                    </p>
                  </div>
                  <label className="block">
                    <span className="block text-xs font-semibold text-muted mb-1.5">
                      Profile URL slug
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted shrink-0">/makers/</span>
                      <input
                        value={form.slug}
                        onChange={(e) =>
                          setField(
                            'slug',
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                              .replace(/-+/g, '-')
                          )
                        }
                        className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm font-mono"
                        required
                      />
                    </div>
                    {publicUrl ? (
                      <p className="text-xs text-muted mt-2 break-all">{publicUrl}</p>
                    ) : null}
                  </label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-xs font-semibold text-muted mb-1.5">
                        LinkedIn
                      </span>
                      <input
                        type="url"
                        value={form.linkedinUrl}
                        onChange={(e) => setField('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-semibold text-muted mb-1.5">
                        X / Twitter
                      </span>
                      <input
                        type="url"
                        value={form.twitterUrl}
                        onChange={(e) => setField('twitterUrl', e.target.value)}
                        placeholder="https://x.com/..."
                        className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
                >
                  Back to dashboard
                </Link>
              </div>
            </form>
          ) : null}

          {section === 'products' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-extrabold text-heading">Your products</h2>
                  <p className="text-sm text-muted">
                    {stats.total} listing{stats.total === 1 ? '' : 's'} · {stats.pending} pending
                  </p>
                </div>
                <Link
                  href="/dashboard/add-product"
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                >
                  Add product
                </Link>
              </div>
              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-borderC bg-white p-8 text-center">
                  <p className="font-semibold text-heading mb-1">No products yet</p>
                  <p className="text-sm text-muted mb-4">
                    List your first product to appear on your public maker page.
                  </p>
                  <Link
                    href="/dashboard/add-product"
                    className="inline-flex px-4 py-2 rounded-full text-sm font-semibold border border-borderC hover:bg-bgAlt"
                  >
                    Add a product
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {products.map((p) => (
                    <li
                      key={p._id}
                      className="rounded-2xl border border-borderC bg-white p-4 flex items-center gap-3"
                    >
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-bgAlt shrink-0">
                        <Image
                          src={p.logoUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/products/${p._id}`}
                          className="font-bold text-heading hover:text-primary truncate block"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted truncate">{p.tagline}</p>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-muted shrink-0">
                        {p.status || '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/dashboard"
                className="inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Manage submissions →
              </Link>
            </div>
          ) : null}

          {section === 'trust' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
                <h2 className="font-extrabold text-heading mb-1 inline-flex items-center gap-2">
                  Account verification
                  {user.isAccountVerified ? <AccountVerifiedTick size={18} /> : null}
                </h2>
                {user.isAccountVerified ? (
                  <p className="text-sm text-muted mt-2">
                    Your green tick is live on product cards and your public maker page. Verified
                    accounts skip product pending review.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted mt-2 mb-4">
                      Get a trust badge so visitors know you are a real maker. Free (up to 7 days)
                      or $9 priority.
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                    >
                      Open verify account
                    </Link>
                  </>
                )}
              </div>
              <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
                <h2 className="font-extrabold text-heading mb-1">Listing plans</h2>
                <p className="text-sm text-muted mb-4">
                  Upgrade individual products for verified, featured, or growth placement.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex px-4 py-2 rounded-full text-sm font-semibold border border-borderC hover:bg-bgAlt"
                >
                  View pricing
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
