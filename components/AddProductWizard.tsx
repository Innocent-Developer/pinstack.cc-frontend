'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { getStoredUser, getToken, StoredUser } from '../lib/auth';
import { useToast } from './ToastProvider';
import type { Category } from '../types';
import SocialLinkFields from './SocialLinkFields';
import BadgeCopyWidget from './BadgeCopyWidget';
import {
  EMPTY_SOCIAL_LINKS,
  socialLinksFromForm,
  type SocialPlatform,
} from '../lib/socialLinks';

const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Step = 1 | 2 | 3 | 4 | 5;

function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return 'Use JPEG, PNG, WebP, or GIF only';
  if (file.size > MAX_BYTES) return 'Each image must be under 1 MB';
  return null;
}

export default function AddProductWizard() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState<{
    _id: string;
    slug: string;
    name: string;
    websiteUrl: string;
  } | null>(null);
  const [postStep, setPostStep] = useState<'plan' | 'free-badge' | 'paid' | 'done'>('plan');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'verified' | 'featured' | 'growth' | null>(
    null
  );
  const [listTiming, setListTiming] = useState<'now' | 'scheduled'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [liveResult, setLiveResult] = useState<{
    liveNow: boolean;
    publishAt?: string | null;
    status?: string;
  } | null>(null);
  const [badgeStatus, setBadgeStatus] = useState<{
    found: boolean;
    message: string;
  } | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);

  const [autofillUrl, setAutofillUrl] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiField, setAiField] = useState<'tagline' | 'description' | 'general'>('general');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [autofilledLogoUrl, setAutofilledLogoUrl] = useState<string | null>(null);
  const [logoFetching, setLogoFetching] = useState(false);
  const [shotFiles, setShotFiles] = useState<File[]>([]);
  const [shotPreviews, setShotPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    categories: [] as string[],
    tags: '',
    submissionMethod: 'manual' as 'auto' | 'manual',
  });
  const [socialLinks, setSocialLinks] = useState({ ...EMPTY_SOCIAL_LINKS });

  useEffect(() => {
    const u = getStoredUser();
    const token = getToken();
    if (!u || !token) {
      router.replace('/login?next=/dashboard/add-product');
      return;
    }
    setUser(u);
    api.getCategories().then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, [router]);

  const steps = useMemo(
    () => [
      { n: 1 as Step, label: 'Basics' },
      { n: 2 as Step, label: 'Social' },
      { n: 3 as Step, label: 'Copy + AI' },
      { n: 4 as Step, label: 'Images' },
      { n: 5 as Step, label: 'Review' },
    ],
    []
  );

  const runAutofill = async () => {
    if (!autofillUrl.trim()) return;
    const token = getToken();
    setBusy(true);
    setError(null);
    try {
      const res = await api.autofill(autofillUrl.trim());
      if (res.success && res.data) {
        setForm((f) => ({
          ...f,
          name: res.data!.name || f.name,
          tagline: res.data!.tagline || f.tagline,
          websiteUrl: res.data!.websiteUrl || autofillUrl.trim(),
          submissionMethod: 'auto',
        }));

        if (res.data.logoUrl && token) {
          setLogoFetching(true);
          let logoUploaded = false;
          try {
            const uploaded = await api.uploadFromUrl(token, res.data.logoUrl, 'logos');
            const url = uploaded.data.logoUrl || uploaded.data.url;
            setAutofilledLogoUrl(url);
            setLogoPreview(url);
            setLogoFile(null);
            logoUploaded = true;
            toastSuccess('Logo fetched from website');
          } catch {
            setError('Auto-fill worked, but we could not fetch the logo  upload it manually in Images.');
          } finally {
            setLogoFetching(false);
          }

          if (res.missingFields?.length) {
            const fields = res.missingFields.filter((f) => !(f === 'logoUrl' && logoUploaded));
            if (fields.length) {
              setError(`Auto-filled what we could. Still needed: ${fields.join(', ')}`);
            }
          } else if (logoUploaded) {
            toastSuccess('Auto-filled from website');
          }
        } else if (res.missingFields?.length) {
          setError(`Auto-filled what we could. Still needed: ${res.missingFields.join(', ')}`);
        } else {
          toastSuccess('Auto-filled from website');
        }
      } else {
        setForm((f) => ({ ...f, websiteUrl: autofillUrl.trim(), submissionMethod: 'manual' }));
        setError(res.message || 'Could not auto-fill  continue manually');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autofill failed');
    } finally {
      setBusy(false);
    }
  };

  const askAi = async () => {
    const token = getToken();
    if (!token || !aiQuestion.trim()) return;
    setAiBusy(true);
    setAiAnswer(null);
    setError(null);
    try {
      const res = await api.aiAssist(token, {
        question: aiQuestion.trim(),
        field: aiField,
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        websiteUrl: form.websiteUrl,
      });
      const data = res.data;
      setAiAnswer(data.answer);

      // Auto-fill listing copy fields from AI response
      setForm((f) => {
        const next = { ...f };
        if (data.name?.trim()) next.name = data.name.trim();
        if (data.tagline?.trim()) next.tagline = data.tagline.trim().slice(0, 120);
        if (data.description?.trim()) next.description = data.description.trim();
        if (data.websiteUrl?.trim() && !f.websiteUrl.trim()) {
          next.websiteUrl = data.websiteUrl.trim();
        }
        // Field-specific: if API only returned answer text, still apply
        if (aiField === 'tagline' && !data.tagline && data.answer) {
          next.tagline = data.answer.replace(/^["']|["']$/g, '').slice(0, 120);
        }
        if (aiField === 'description' && !data.description && data.answer) {
          next.description = data.answer;
        }
        return next;
      });

      toastSuccess('Listing copy updated from AI');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI assist failed');
    } finally {
      setAiBusy(false);
    }
  };

  const onLogo = (file: File | null) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      setAutofilledLogoUrl(null);
      return;
    }
    const err = validateImage(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLogoFile(file);
    setAutofilledLogoUrl(null);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setAutofilledLogoUrl(null);
  };

  const hasLogo = !!(logoFile || autofilledLogoUrl);

  const onShots = (list: FileList | null) => {
    if (!list) return;
    const next = [...shotFiles];
    for (const file of Array.from(list)) {
      if (next.length >= 3) break;
      const err = validateImage(file);
      if (err) {
        setError(err);
        continue;
      }
      next.push(file);
    }
    setShotFiles(next.slice(0, 3));
    setShotPreviews(next.slice(0, 3).map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const removeShot = (idx: number) => {
    const next = shotFiles.filter((_, i) => i !== idx);
    setShotFiles(next);
    setShotPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const canNext = () => {
    if (step === 1) return !!(form.name && form.websiteUrl && form.categories.length > 0);
    if (step === 2) return true;
    if (step === 3) return !!(form.tagline && form.description);
    if (step === 4) return hasLogo;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !user || !hasLogo) return;

    setBusy(true);
    setError(null);
    try {
      let logoUrl = autofilledLogoUrl || '';

      if (logoFile) {
        const uploaded = await api.uploadImages(token, { logo: logoFile });
        if (!uploaded.logoUrl) throw new Error('Logo upload failed');
        logoUrl = uploaded.logoUrl;
      }

      let screenshotUrls: string[] = [];
      if (shotFiles.length) {
        const uploaded = await api.uploadImages(token, { screenshots: shotFiles });
        screenshotUrls = uploaded.screenshotUrls || [];
      }

      const created = await api.submitProduct({
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        websiteUrl: form.websiteUrl,
        logoUrl,
        screenshotUrls,
        category: form.categories[0],
        categories: form.categories,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        submitterName: user.name,
        submitterEmail: user.email,
        submissionMethod: form.submissionMethod,
        socialLinks: socialLinksFromForm(socialLinks),
      });

      const product = created.data;
      setSubmitted({
        _id: product._id,
        slug: product.slug,
        name: product.name,
        websiteUrl: product.websiteUrl,
      });
      setPostStep('plan');
      setDone(true);
      toastSuccess('Product submitted for review!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  };

  const choosePlan = async (plan: 'free' | 'verified' | 'featured' | 'growth') => {
    if (!submitted) return;
    const token = getToken();
    if (!token) return;

    if (listTiming === 'scheduled' && !scheduleDate) {
      setError('Pick a schedule date, or choose “List as soon as possible”.');
      return;
    }

    setSelectedPlan(plan);
    setBusy(true);
    setError(null);
    try {
      const res = await api.setMyProductPlan(token, submitted._id, plan, {
        listTiming,
        publishAt: listTiming === 'scheduled' ? scheduleDate : undefined,
      });
      setLiveResult({
        liveNow: !!res.data.liveNow,
        publishAt: res.data.publishAt,
        status: res.data.status,
      });
      if (plan === 'free') {
        setPostStep('free-badge');
        setBadgeStatus(null);
        toastSuccess(res.message || 'Free plan saved');
      } else {
        setPostStep('paid');
        toastSuccess(res.message || 'Paid plan applied - listing is live');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not save plan';
      setError(msg);
      toastError(msg);
    } finally {
      setBusy(false);
    }
  };

  const runBadgeVerify = async () => {
    if (!submitted) return;
    const token = getToken();
    if (!token) return;
    setVerifyBusy(true);
    setBadgeStatus(null);
    setError(null);
    try {
      const res = await api.verifyMyProductBadge(token, submitted._id);
      setBadgeStatus({ found: res.data.found, message: res.data.message });
      if (res.data.found) {
        toastSuccess('Badge verified on your website!');
        setPostStep('done');
      } else {
        toastError('Badge not found yet - add it, then verify again.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verify failed';
      setError(msg);
      toastError(msg);
    } finally {
      setVerifyBusy(false);
    }
  };

  if (done && submitted) {
    return (
      <div className="space-y-5">
        <div className="border border-borderC rounded-2xl p-6 sm:p-8 bg-bgAlt">
          <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Submitted</p>
          <h2 className="text-xl font-extrabold text-heading mb-2">{submitted.name} is ready</h2>
          <p className="text-sm text-muted leading-relaxed">
            Choose when to list and Free vs Paid. <strong>Paid plans go live instantly</strong> (no
            pending queue). Free stays pending until admin approval.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-btn">
            {error}
          </p>
        )}

        {postStep === 'plan' && (
          <div className="border border-borderC rounded-2xl p-6 bg-white space-y-5">
            <div>
              <h3 className="font-extrabold text-heading text-lg mb-1">When should it list?</h3>
              <p className="text-sm text-muted mb-3">
                Schedule up to 90 days ahead. Paid listings publish automatically on that date.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setListTiming('now')}
                  className={`text-left border rounded-2xl p-4 transition ${
                    listTiming === 'now'
                      ? 'border-primary bg-bgAlt ring-1 ring-primary/30'
                      : 'border-borderC hover:border-primary'
                  }`}
                >
                  <p className="text-sm font-extrabold text-heading mb-1">As soon as possible</p>
                  <p className="text-xs text-muted">
                    Free → pending review. Paid → live right away.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setListTiming('scheduled')}
                  className={`text-left border rounded-2xl p-4 transition ${
                    listTiming === 'scheduled'
                      ? 'border-primary bg-bgAlt ring-1 ring-primary/30'
                      : 'border-borderC hover:border-primary'
                  }`}
                >
                  <p className="text-sm font-extrabold text-heading mb-1">Schedule a date</p>
                  <p className="text-xs text-muted">Pick when your listing should appear publicly.</p>
                </button>
              </div>
              {listTiming === 'scheduled' && (
                <div>
                  <label className="block text-xs font-semibold text-heading mb-1">
                    Go-live date & time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full sm:max-w-sm px-3 py-2.5 border border-borderC rounded-btn text-sm"
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-extrabold text-heading text-lg mb-1">Choose Free or Paid</h3>
              <p className="text-sm text-muted mb-3">
                Paid options skip the pending queue and list immediately (or on your schedule).
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void choosePlan('free')}
                  className="text-left border border-borderC rounded-2xl p-4 hover:border-primary hover:bg-bgAlt transition disabled:opacity-50"
                >
                  <p className="text-sm font-extrabold text-heading mb-1">Free</p>
                  <p className="text-xs text-muted">
                    {user?.isAccountVerified
                      ? 'Verified account — goes live without pending review.'
                      : 'Pending admin approval + embed badge. Forever free.'}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void choosePlan('verified')}
                  className="text-left border border-borderC rounded-2xl p-4 hover:border-primary hover:bg-bgAlt transition disabled:opacity-50"
                >
                  <p className="text-sm font-extrabold text-heading mb-1">Verified · $9</p>
                  <p className="text-xs text-muted">Instant live + verified badge. No pending.</p>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void choosePlan('featured')}
                  className="text-left border border-borderC rounded-2xl p-4 hover:border-primary hover:bg-bgAlt transition disabled:opacity-50"
                >
                  <p className="text-sm font-extrabold text-heading mb-1">Featured · $5/mo</p>
                  <p className="text-xs text-muted">Instant live + featured placement (30 days).</p>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void choosePlan('growth')}
                  className="text-left border border-borderC rounded-2xl p-4 hover:border-primary hover:bg-bgAlt transition disabled:opacity-50"
                >
                  <p className="text-sm font-extrabold text-heading mb-1">Growth · $20/mo</p>
                  <p className="text-xs text-muted">Instant live + Featured & Verified.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {postStep === 'free-badge' && (
          <div className="border border-borderC rounded-2xl p-6 bg-white space-y-4">
            <h3 className="font-extrabold text-heading text-lg">Add your free badge</h3>
            <p className="text-sm text-muted leading-relaxed">
              Copy the embed code below and paste it on{' '}
              <a
                href={submitted.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline"
              >
                {submitted.websiteUrl.replace(/^https?:\/\//, '')}
              </a>
              . Then click <strong>Verify badge</strong> - we’ll scan your site for the Pinstack
              badge.
            </p>

            <BadgeCopyWidget slug={submitted.slug} name={submitted.name} upvotes={0} />

            {badgeStatus && (
              <div
                className={`text-sm rounded-xl px-3.5 py-3 border ${
                  badgeStatus.found
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                {badgeStatus.message}
                {!badgeStatus.found && (
                  <p className="mt-2 font-semibold">Add the badge now, publish your page, then verify again.</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                disabled={verifyBusy}
                onClick={() => void runBadgeVerify()}
                className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
              >
                {verifyBusy ? 'Scanning your site…' : 'Verify badge'}
              </button>
              <button
                type="button"
                onClick={() => setPostStep('done')}
                className="px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {postStep === 'paid' && selectedPlan && (
          <div className="border border-borderC rounded-2xl p-6 bg-white space-y-4">
            <h3 className="font-extrabold text-heading text-lg">
              {liveResult?.liveNow
                ? 'You’re live - no pending review'
                : 'Approved & scheduled'}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-heading capitalize">{selectedPlan}</strong> is applied.
              {liveResult?.liveNow
                ? ' Your product is listed on Pinstack now.'
                : liveResult?.publishAt
                  ? ` It will appear publicly on ${new Date(liveResult.publishAt).toLocaleString()}.`
                  : ' Your go-live time is saved.'}{' '}
              Admin was notified. You can still add the free embed badge anytime.
            </p>
            <div className="flex flex-wrap gap-3">
              {liveResult?.liveNow && (
                <Link
                  href={`/product/${submitted.slug}`}
                  className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                >
                  View live listing →
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setPostStep('free-badge');
                }}
                className="px-5 py-2.5 rounded-btn text-sm font-semibold text-primary hover:underline"
              >
                Add embed badge
              </button>
            </div>
          </div>
        )}

        {postStep === 'done' && (
          <div className="border border-borderC rounded-2xl p-6 sm:p-8 bg-white text-center space-y-4">
            <h3 className="text-lg font-extrabold text-heading">
              {liveResult?.liveNow
                ? 'Listing is live'
                : badgeStatus?.found
                  ? 'Badge verified - you’re set'
                  : 'You’re all set for now'}
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              {liveResult?.liveNow
                ? 'Paid plan applied - your product skipped the pending queue.'
                : badgeStatus?.found
                  ? 'We found your Pinstack badge. Free listings still need admin approval before going public.'
                  : 'We’ll email you when a free listing is approved. Verify the badge anytime from your dashboard.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {liveResult?.liveNow && (
                <Link
                  href={`/product/${submitted.slug}`}
                  className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                >
                  View listing
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
              >
                Back to dashboard
              </Link>
              <Link
                href="/explore"
                className="px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
              >
                Explore directory
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {steps.map((s) => (
          <li
            key={s.n}
            className={`text-center text-xs font-semibold py-2 rounded-btn border ${
              step === s.n
                ? 'bg-primary text-white border-primary'
                : step > s.n
                  ? 'bg-successBg text-success border-emerald-200'
                  : 'bg-white text-muted border-borderC'
            }`}
          >
            {s.n}. {s.label}
          </li>
        ))}
      </ol>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-btn">{error}</p>
      )}

      {step === 1 && (
        <div className="border border-borderC rounded-2xl p-6 bg-white space-y-4">
          <h2 className="font-extrabold text-heading text-lg">Product basics</h2>

          <div className="rounded-xl bg-bgAlt border border-borderC p-4 space-y-3">
            <p className="text-xs font-semibold text-heading">Auto-fill from website (optional)</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={autofillUrl}
                onChange={(e) => setAutofillUrl(e.target.value)}
                placeholder="https://yourproduct.com"
                className="flex-1 px-3 py-2.5 border border-borderC rounded-btn text-sm bg-white"
              />
              <button
                type="button"
                onClick={runAutofill}
                disabled={busy || !autofillUrl}
                className="px-4 py-2.5 rounded-btn text-sm font-semibold bg-heading text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'Fetching…' : 'Auto-fill'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Product name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-borderC rounded-btn text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Website URL</label>
            <input
              required
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              className="w-full px-3 py-2.5 border border-borderC rounded-btn text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">
              Categories <span className="text-muted font-medium">(select one or more)</span>
            </label>
            <p className="text-[11px] text-muted mb-2">
              {form.categories.length}/5 selected first pick is shown as primary.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c) => {
                const active = form.categories.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      setForm((f) => {
                        const has = f.categories.includes(c._id);
                        if (has) {
                          return { ...f, categories: f.categories.filter((id) => id !== c._id) };
                        }
                        if (f.categories.length >= 5) return f;
                        return { ...f, categories: [...f.categories, c._id] };
                      });
                    }}
                    className={`text-left px-3 py-2.5 rounded-btn border text-sm transition ${
                      active
                        ? 'border-primary bg-bgAlt text-heading font-semibold ring-1 ring-primary/30'
                        : 'border-borderC hover:border-primary'
                    }`}
                  >
                    <span className="mr-1" aria-hidden>
                      {active ? '✓ ' : ''}
                      {c.icon}
                    </span>
                    {c.name}
                  </button>
                );
              })}
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-muted mt-2">Loading categories…</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="saas, ai, productivity"
              className="w-full px-3 py-2.5 border border-borderC rounded-btn text-sm"
            />
          </div>

        </div>
      )}

      {step === 2 && (
        <div className="border border-borderC rounded-2xl p-6 bg-white space-y-4">
          <h2 className="font-extrabold text-heading text-lg">Social links</h2>
          <p className="text-xs text-muted">
            Optional. Add your product&apos;s social profiles  shown as icons on your listing page.
          </p>
          <SocialLinkFields
            values={socialLinks}
            onChange={(platform: SocialPlatform, value: string) =>
              setSocialLinks((prev) => ({ ...prev, [platform]: value }))
            }
          />
        </div>
      )}

      {step === 3 && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 border border-borderC rounded-2xl p-6 bg-white space-y-4">
            <h2 className="font-extrabold text-heading text-lg">Listing copy</h2>
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Tagline (max 120)</label>
              <input
                required
                maxLength={120}
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2.5 border border-borderC rounded-btn text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Description</label>
              <textarea
                required
                rows={7}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-borderC rounded-btn text-sm"
              />
            </div>
          </div>

          <div className="lg:col-span-2 border border-borderC rounded-2xl p-5 bg-bgAlt space-y-3">
            <h3 className="font-bold text-heading text-sm">Ask AI</h3>
            <p className="text-xs text-muted">
              Generate or rewrite listing copy  results auto-fill Tagline and Description.
            </p>
            <select
              value={aiField}
              onChange={(e) => setAiField(e.target.value as typeof aiField)}
              className="w-full px-3 py-2 border border-borderC rounded-btn text-sm bg-white"
            >
              <option value="general">Fill tagline + description</option>
              <option value="tagline">Write tagline only</option>
              <option value="description">Write description only</option>
            </select>
            <textarea
              rows={4}
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g. Write a clear tagline and description for this product"
              className="w-full px-3 py-2 border border-borderC rounded-btn text-sm bg-white"
            />
            <button
              type="button"
              onClick={askAi}
              disabled={aiBusy || !aiQuestion.trim()}
              className="w-full py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {aiBusy ? 'Generating…' : 'Generate & fill'}
            </button>
            {aiAnswer && (
              <div className="bg-white border border-borderC rounded-btn p-3 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                  Applied to form
                </p>
                <p className="text-xs text-body whitespace-pre-wrap">{aiAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="border border-borderC rounded-2xl p-6 bg-white space-y-6">
          <div>
            <h2 className="font-extrabold text-heading text-lg mb-1">Images</h2>
            <p className="text-xs text-muted">1 logo required · up to 3 feature images · each under 1 MB</p>
            {autofilledLogoUrl && !logoFile && (
              <p className="text-xs text-primary mt-1 font-medium">
                Logo auto-fetched from your website  replace below if needed.
              </p>
            )}
            {logoFetching && (
              <p className="text-xs text-muted mt-1">Fetching logo from website…</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-heading mb-2">Logo (required)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => onLogo(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
            {logoPreview && (
              <div className="mt-3 flex items-start gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-borderC bg-bgAlt">
                  <Image src={logoPreview} alt="Logo preview" fill className="object-cover" unoptimized />
                </div>
                <button
                  type="button"
                  onClick={clearLogo}
                  className="text-xs font-semibold text-red-600 hover:underline mt-1"
                >
                  Remove logo
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-heading mb-2">
              Feature images (max 3)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => {
                onShots(e.target.files);
                // Allow re-selecting the same files and still trigger onChange.
                e.currentTarget.value = '';
              }}
              className="block w-full text-sm"
              disabled={shotFiles.length >= 3}
            />
            {shotPreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {shotPreviews.map((src, i) => (
                  <div key={src} className="relative w-28 h-20 rounded-xl overflow-hidden border border-borderC">
                    <Image src={src} alt={`Feature ${i + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeShot(i)}
                      className="absolute top-1 right-1 text-[10px] font-bold bg-white/90 px-1.5 py-0.5 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="border border-borderC rounded-2xl p-6 bg-white space-y-3">
          <h2 className="font-extrabold text-heading text-lg">Review & submit</h2>
          <dl className="text-sm space-y-2">
            <div className="flex gap-2">
              <dt className="text-muted w-28 shrink-0">Name</dt>
              <dd className="font-semibold text-heading">{form.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted w-28 shrink-0">Website</dt>
              <dd className="text-body break-all">{form.websiteUrl}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted w-28 shrink-0">Tagline</dt>
              <dd className="text-body">{form.tagline}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted w-28 shrink-0">Images</dt>
              <dd className="text-body">
                1 logo{autofilledLogoUrl && !logoFile ? ' (from website)' : ''}
                {shotFiles.length ? ` + ${shotFiles.length} feature` : ''}
              </dd>
            </div>
            {Object.values(socialLinks).some((v) => v.trim()) && (
              <div className="flex gap-2">
                <dt className="text-muted w-28 shrink-0">Social</dt>
                <dd className="text-body">
                  {Object.values(socialLinks).filter((v) => v.trim()).length} link(s)
                </dd>
              </div>
            )}
          </dl>
          <p className="text-xs text-muted pt-2">
            Submitting as {user?.name} ({user?.email}). Next you&apos;ll choose Free/Paid and when to
            list.
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          disabled={step === 1 || busy}
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          className="px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt disabled:opacity-40"
        >
          Back
        </button>

        {step < 5 ? (
          <button
            type="button"
            disabled={!canNext() || busy}
            onClick={() => setStep((s) => (s < 5 ? ((s + 1) as Step) : s))}
            className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={busy || !hasLogo}
            className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {busy ? 'Uploading & submitting…' : 'Submit for review'}
          </button>
        )}
      </div>
    </form>
  );
}
