'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '../lib/api';
import AccountVerifiedTick from './AccountVerifiedTick';

type AccountType = 'personal' | 'company';
type Tier = 'free' | 'priority';

type VerificationState = {
  isAccountVerified: boolean;
  accountVerifiedAt?: string | null;
  accountType?: AccountType | null;
  companyName?: string | null;
  payment?: {
    amountUsd: number;
    email: string;
    paymentUrl: string | null;
    note: string;
  };
  request: {
    id: string;
    status: string;
    tier: Tier;
    paymentStatus: string;
    accountType: AccountType;
    adminNote?: string;
    createdAt: string;
    slaHours: number;
  } | null;
};

const emptyForm = {
  accountType: 'personal' as AccountType,
  fullName: '',
  website: '',
  country: '',
  bio: '',
  linkedinUrl: '',
  twitterUrl: '',
  companyName: '',
  companyWebsite: '',
  companyRole: '',
  companySize: '',
  companyRegistration: '',
  tier: 'free' as Tier,
};

export default function AccountVerificationPanel({
  token,
  defaultName,
  onVerifiedChange,
}: {
  token: string;
  defaultName: string;
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [state, setState] = useState<VerificationState | null>(null);
  const [form, setForm] = useState({ ...emptyForm, fullName: defaultName });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAccountVerification(token);
      setState(data);
      onVerifiedChange?.(!!data.isAccountVerified);
      if (!form.fullName && defaultName) {
        setForm((f) => ({ ...f, fullName: defaultName }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOk(null);
    try {
      const res = await api.submitAccountVerification(token, form);
      setOk(res.message || 'Request submitted');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-40 rounded-2xl bg-bgAlt animate-pulse" />;
  }

  if (state?.isAccountVerified) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AccountVerifiedTick size={22} />
          <div>
            <h2 className="font-extrabold text-heading text-lg">Account verified</h2>
            <p className="text-sm text-muted mt-1">
              Your green tick is active
              {state.companyName ? ` for ${state.companyName}` : ''}. New product launches skip
              the pending review queue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pending = state?.request?.status === 'pending';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
        <h2 className="font-extrabold text-heading text-lg mb-1">Get account verified</h2>
        <p className="text-sm text-muted mb-4">
          Verified makers show a green tick and can launch products without waiting for admin
          approval.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            disabled={pending}
            onClick={() => setForm((f) => ({ ...f, tier: 'priority' }))}
            className={`text-left rounded-xl border p-4 transition ${
              form.tier === 'priority'
                ? 'border-primary bg-bgAlt'
                : 'border-borderC hover:border-primary/40'
            } ${pending ? 'opacity-60' : ''}`}
          >
            <p className="text-xs font-semibold text-primary mb-1">Priority · $9 once</p>
            <p className="font-extrabold text-heading text-sm">Review under 24 hours</p>
            <p className="text-xs text-muted mt-1">One-time payment. Fastest path to the green tick.</p>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setForm((f) => ({ ...f, tier: 'free' }))}
            className={`text-left rounded-xl border p-4 transition ${
              form.tier === 'free'
                ? 'border-primary bg-bgAlt'
                : 'border-borderC hover:border-primary/40'
            } ${pending ? 'opacity-60' : ''}`}
          >
            <p className="text-xs font-semibold text-primary mb-1">Free</p>
            <p className="font-extrabold text-heading text-sm">Up to 7 days</p>
            <p className="text-xs text-muted mt-1">Same verification — reviewed in the free queue.</p>
          </button>
        </div>

        {pending && state.request && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-4">
            Your {state.request.tier === 'priority' ? 'priority ($9)' : 'free'} request is pending
            {state.request.tier === 'priority' && state.request.paymentStatus === 'awaiting_payment'
              ? ' — complete payment so we can review within 24h.'
              : ` — usually within ${state.request.slaHours >= 24 ? `${Math.round(state.request.slaHours / 24)} days` : `${state.request.slaHours}h`}.`}
            {state.payment?.note ? (
              <p className="mt-2 text-xs opacity-90">{state.payment.note}</p>
            ) : null}
            {state.payment?.paymentUrl ? (
              <a
                href={state.payment.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 font-semibold text-primary underline"
              >
                Open payment link
              </a>
            ) : null}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-btn mb-3">
            {error}
          </p>
        )}
        {ok && (
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-btn mb-3">
            {ok}
          </p>
        )}

        {!pending && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-2">
              {(['personal', 'company'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, accountType: t }))}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold border ${
                    form.accountType === t
                      ? 'border-primary bg-primary text-white'
                      : 'border-borderC text-heading hover:bg-bgAlt'
                  }`}
                >
                  {t === 'personal' ? 'Personal' : 'Company'}
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="font-semibold text-heading">Full name</span>
                <input
                  required
                  className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-heading">Country</span>
                <input
                  className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-semibold text-heading">Website</span>
                <input
                  type="url"
                  placeholder="https://"
                  className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="font-semibold text-heading">About you</span>
                <textarea
                  rows={3}
                  maxLength={600}
                  className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="What you build, audience, why you want verification…"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-heading">LinkedIn</span>
                <input
                  className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-heading">X / Twitter</span>
                <input
                  className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm"
                  value={form.twitterUrl}
                  onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })}
                />
              </label>
            </div>

            {form.accountType === 'company' && (
              <div className="rounded-xl border border-borderC bg-bgAlt/50 p-4 grid sm:grid-cols-2 gap-3">
                <p className="sm:col-span-2 text-xs font-semibold text-primary">Company details</p>
                <label className="block text-sm">
                  <span className="font-semibold text-heading">Company name</span>
                  <input
                    required
                    className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm bg-white"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-heading">Your role</span>
                  <input
                    className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm bg-white"
                    value={form.companyRole}
                    onChange={(e) => setForm({ ...form, companyRole: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-heading">Company website</span>
                  <input
                    type="url"
                    className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm bg-white"
                    value={form.companyWebsite}
                    onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-heading">Company size</span>
                  <select
                    className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm bg-white"
                    value={form.companySize}
                    onChange={(e) => setForm({ ...form, companySize: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="1">Just me</option>
                    <option value="2-10">2–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="200+">200+</option>
                  </select>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="font-semibold text-heading">Registration / legal ID (optional)</span>
                  <input
                    className="mt-1 w-full rounded-btn border border-borderC px-3 py-2.5 text-sm bg-white"
                    value={form.companyRegistration}
                    onChange={(e) => setForm({ ...form, companyRegistration: e.target.value })}
                  />
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-5 py-3 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting
                ? 'Submitting…'
                : form.tier === 'priority'
                  ? 'Submit + pay $9 for 24h review'
                  : 'Submit free verification request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
