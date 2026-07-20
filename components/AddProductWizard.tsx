'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { getStoredUser, getToken, StoredUser } from '../lib/auth';
import type { Category } from '../types';
import SocialLinkFields from './SocialLinkFields';
import {
  EMPTY_SOCIAL_LINKS,
  socialLinksFromForm,
  type SocialPlatform,
} from '../lib/socialLinks';

const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Step = 1 | 2 | 3 | 4;

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
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [autofillUrl, setAutofillUrl] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiField, setAiField] = useState<'tagline' | 'description' | 'general'>('general');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
      { n: 2 as Step, label: 'Copy + AI' },
      { n: 3 as Step, label: 'Images' },
      { n: 4 as Step, label: 'Review' },
    ],
    []
  );

  const runAutofill = async () => {
    if (!autofillUrl.trim()) return;
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
        if (res.missingFields?.length) {
          setError(`Auto-filled what we could. Still needed: ${res.missingFields.join(', ')}`);
        }
      } else {
        setForm((f) => ({ ...f, websiteUrl: autofillUrl.trim(), submissionMethod: 'manual' }));
        setError(res.message || 'Could not auto-fill continue manually');
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
      setAiAnswer(res.data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI assist failed');
    } finally {
      setAiBusy(false);
    }
  };

  const applyAi = () => {
    if (!aiAnswer) return;
    if (aiField === 'tagline') {
      setForm((f) => ({ ...f, tagline: aiAnswer.slice(0, 120) }));
    } else if (aiField === 'description') {
      setForm((f) => ({ ...f, description: aiAnswer }));
    }
  };

  const onLogo = (file: File | null) => {
    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }
    const err = validateImage(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

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
    if (step === 2) return !!(form.tagline && form.description);
    if (step === 3) return !!logoFile;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !user || !logoFile) return;

    setBusy(true);
    setError(null);
    try {
      const uploaded = await api.uploadImages(token, {
        logo: logoFile,
        screenshots: shotFiles,
      });

      if (!uploaded.logoUrl) throw new Error('Logo upload failed');

      await api.submitProduct({
        name: form.name,
        tagline: form.tagline,
        description: form.description,
        websiteUrl: form.websiteUrl,
        logoUrl: uploaded.logoUrl,
        screenshotUrls: uploaded.screenshotUrls || [],
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

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="border border-borderC rounded-2xl p-8 bg-bgAlt text-center">
        <h2 className="text-xl font-extrabold text-heading mb-2">Submitted for review</h2>
        <p className="text-sm text-muted mb-6">
          Thanks your product is in the queue. We’ll email you when it’s approved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            Back to dashboard
          </Link>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-white"
          >
            Explore directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ol className="grid grid-cols-4 gap-2">
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

          <div className="pt-2 border-t border-borderC">
            <SocialLinkFields
              values={socialLinks}
              onChange={(platform: SocialPlatform, value: string) =>
                setSocialLinks((prev) => ({ ...prev, [platform]: value }))
              }
            />
          </div>
        </div>
      )}

      {step === 2 && (
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
              Describe what you need rewrite tagline, expand description, or ask a question.
            </p>
            <select
              value={aiField}
              onChange={(e) => setAiField(e.target.value as typeof aiField)}
              className="w-full px-3 py-2 border border-borderC rounded-btn text-sm bg-white"
            >
              <option value="general">General help</option>
              <option value="tagline">Write tagline</option>
              <option value="description">Write description</option>
            </select>
            <textarea
              rows={4}
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g. Make my tagline clearer for B2B founders"
              className="w-full px-3 py-2 border border-borderC rounded-btn text-sm bg-white"
            />
            <button
              type="button"
              onClick={askAi}
              disabled={aiBusy || !aiQuestion.trim()}
              className="w-full py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {aiBusy ? 'Thinking…' : 'Ask AI'}
            </button>
            {aiAnswer && (
              <div className="bg-white border border-borderC rounded-btn p-3 space-y-2">
                <p className="text-xs text-body whitespace-pre-wrap">{aiAnswer}</p>
                {(aiField === 'tagline' || aiField === 'description') && (
                  <button
                    type="button"
                    onClick={applyAi}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Apply to form
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="border border-borderC rounded-2xl p-6 bg-white space-y-6">
          <div>
            <h2 className="font-extrabold text-heading text-lg mb-1">Images</h2>
            <p className="text-xs text-muted">1 logo required · up to 3 feature images · each under 1 MB</p>
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
              <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden border border-borderC bg-bgAlt">
                <Image src={logoPreview} alt="Logo preview" fill className="object-cover" unoptimized />
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

      {step === 4 && (
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
                1 logo{shotFiles.length ? ` + ${shotFiles.length} feature` : ''}
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
            Submitting as {user?.name} ({user?.email}). Listing stays pending until review.
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

        {step < 4 ? (
          <button
            type="button"
            disabled={!canNext() || busy}
            onClick={() => setStep((s) => (s < 4 ? ((s + 1) as Step) : s))}
            className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={busy || !logoFile}
            className="px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {busy ? 'Uploading & submitting…' : 'Submit for review'}
          </button>
        )}
      </div>
    </form>
  );
}
