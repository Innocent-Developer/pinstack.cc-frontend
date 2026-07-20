'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { getToken } from '../lib/auth';
import type { Category, Product } from '../types';
import SocialLinkFields from './SocialLinkFields';
import {
  EMPTY_SOCIAL_LINKS,
  socialLinksFromForm,
  socialLinksToForm,
  type SocialPlatform,
} from '../lib/socialLinks';

const MAX_BYTES = 1 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return 'Use JPEG, PNG, WebP, or GIF only';
  if (file.size > MAX_BYTES) return 'Each image must be under 1 MB';
  return null;
}

interface Props {
  productId: string;
  /** When true, hide page chrome and use callbacks (for dashboard popup). */
  embedded?: boolean;
  onCancel?: () => void;
  onSaved?: (product: Product) => void;
}

export default function EditProductForm({ productId, embedded, onCancel, onSaved }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingShots, setExistingShots] = useState<string[]>([]);
  const [shotFiles, setShotFiles] = useState<File[]>([]);
  const [shotPreviews, setShotPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    categories: [] as string[],
    tags: '',
  });
  const [socialLinks, setSocialLinks] = useState({ ...EMPTY_SOCIAL_LINKS });

  useEffect(() => {
    const boot = async () => {
      const token = getToken();
      if (!token) {
        router.replace(`/login?next=/dashboard/products/${productId}/edit`);
        return;
      }
      try {
        const [mine, cats] = await Promise.all([
          api.getMyProduct(token, productId),
          api.getCategories(),
        ]);
        const p = mine.data;
        setProduct(p);
        setForm({
          name: p.name || '',
          tagline: p.tagline || '',
          description: p.description || '',
          websiteUrl: p.websiteUrl || '',
          categories: (
            p.categories?.length
              ? p.categories
              : p.category
                ? [p.category]
                : []
          ).map((c) => (typeof c === 'object' && c && '_id' in c ? c._id : String(c))),
          tags: (p.tags || []).join(', '),
        });
        setSocialLinks(socialLinksToForm(p.socialLinks));
        setLogoPreview(p.logoUrl || null);
        setExistingShots(p.screenshotUrls || []);
        setCategories(cats.data || []);
      } catch {
        setError('Could not load this listing');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [productId, router]);

  const onLogo = (file: File | null) => {
    if (!file) return;
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
    const room = Math.max(0, 3 - existingShots.length - shotFiles.length);
    if (room === 0) return;
    const nextFiles = [...shotFiles];
    for (const file of Array.from(list)) {
      if (nextFiles.length >= room) break;
      const err = validateImage(file);
      if (err) {
        setError(err);
        continue;
      }
      nextFiles.push(file);
    }
    setShotFiles(nextFiles);
    setShotPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const removeExistingShot = (idx: number) => {
    setExistingShots((s) => s.filter((_, i) => i !== idx));
  };

  const removeNewShot = (idx: number) => {
    const next = shotFiles.filter((_, i) => i !== idx);
    setShotFiles(next);
    setShotPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !product) return;

    setBusy(true);
    setError(null);
    try {
      let logoUrl = product.logoUrl;
      let newShotUrls: string[] = [];

      if (logoFile || shotFiles.length) {
        const uploaded = await api.uploadImages(token, {
          logo: logoFile,
          screenshots: shotFiles,
        });
        if (uploaded.logoUrl) logoUrl = uploaded.logoUrl;
        newShotUrls = uploaded.screenshotUrls || [];
      }

      const screenshotUrls = [...existingShots, ...newShotUrls].slice(0, 3);

      const res = await api.updateMyProduct(token, productId, {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        websiteUrl: form.websiteUrl.trim(),
        logoUrl,
        screenshotUrls,
        category: form.categories[0],
        categories: form.categories,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        socialLinks: socialLinksFromForm(socialLinks),
      });

      setProduct(res.data);
      setLogoFile(null);
      setShotFiles([]);
      setShotPreviews([]);
      setExistingShots(res.data.screenshotUrls || []);
      setLogoPreview(res.data.logoUrl);
      if (embedded && onSaved) {
        onSaved(res.data);
      } else {
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-bgAlt animate-pulse" />;
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-borderC bg-white p-8 text-center">
        <p className="font-bold text-heading mb-2">Listing not found</p>
        <p className="text-sm text-muted mb-4">{error || 'This product is not in your account.'}</p>
        {embedded && onCancel ? (
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-primary hover:underline">
            Close
          </button>
        ) : (
          <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
            ← Back to dashboard
          </Link>
        )}
      </div>
    );
  }

  if (saved && !embedded) {
    return (
      <div className="rounded-2xl border border-borderC bg-bgAlt p-8 text-center">
        <h2 className="text-xl font-extrabold text-heading mb-2">Changes saved</h2>
        <p className="text-sm text-muted mb-6 max-w-md mx-auto">
          {product.status === 'pending'
            ? 'Your listing is still pending review.'
            : product.status === 'approved'
              ? 'Your live listing was updated and stays published.'
              : 'Your listing was updated.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            Back to dashboard
          </Link>
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
          >
            Keep editing
          </button>
        </div>
      </div>
    );
  }

  const shotSlotsUsed = existingShots.length + shotPreviews.length;
  const sectionCardClass = embedded
    ? 'rounded-2xl border border-borderC bg-white p-4 sm:p-5 space-y-4'
    : 'rounded-2xl border border-borderC bg-white p-5 sm:p-6 space-y-4';
  const imageCardClass = embedded
    ? 'rounded-2xl border border-borderC bg-white p-4 sm:p-5 space-y-5'
    : 'rounded-2xl border border-borderC bg-white p-5 sm:p-6 space-y-5';

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${embedded ? 'pb-1' : ''}`}>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary mb-1">Edit listing</p>
            <h1 className="text-2xl font-extrabold text-heading">{product.name}</h1>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-muted hover:text-heading">
            ← Dashboard
          </Link>
        </div>
      )}

      {(product.status === 'rejected') && (
        <p className="text-sm bg-amber-50 text-amber-900 border border-amber-100 rounded-xl px-3.5 py-3">
          This listing was rejected. Saving will resubmit it for <strong>pending</strong> review.
        </p>
      )}

      {product.status === 'approved' && (
        <p className="text-sm bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl px-3.5 py-3">
          This listing is live. Your changes will publish immediately it stays approved.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div className={sectionCardClass}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Product name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Website URL</label>
            <input
              required
              type="url"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Tagline</label>
          <input
            required
            maxLength={120}
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Description</label>
          <textarea
            required
            rows={6}
            maxLength={1000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-2">
            Categories <span className="text-muted font-medium">(one or more)</span>
          </label>
          <p className="text-[11px] text-muted mb-2">{form.categories.length}/5 selected</p>
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
                  className={`text-left px-3 py-2.5 rounded-xl border text-sm transition ${
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
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Tags</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="saas, ai, productivity"
            className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
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

      <div className={imageCardClass}>
        <div>
          <h2 className="font-extrabold text-heading mb-1">Images</h2>
          <p className="text-xs text-muted">Replace logo or manage screenshots (max 3, under 1 MB each).</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-2">Logo</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onLogo(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
          {logoPreview && (
            <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden border border-borderC bg-bgAlt">
              <Image src={logoPreview} alt="Logo" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-heading mb-2">
            Screenshots ({shotSlotsUsed}/3)
          </label>
          {(existingShots.length > 0 || shotPreviews.length > 0) && (
            <div className="mb-3 flex flex-wrap gap-3">
              {existingShots.map((src, i) => (
                <div
                  key={src}
                  className="relative w-28 h-20 rounded-xl overflow-hidden border border-borderC"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="112px" />
                  <button
                    type="button"
                    onClick={() => removeExistingShot(i)}
                    className="absolute top-1 right-1 text-[10px] font-bold bg-white/90 px-1.5 py-0.5 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {shotPreviews.map((src, i) => (
                <div
                  key={src}
                  className="relative w-28 h-20 rounded-xl overflow-hidden border border-primary/40"
                >
                  <Image src={src} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeNewShot(i)}
                    className="absolute top-1 right-1 text-[10px] font-bold bg-white/90 px-1.5 py-0.5 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            disabled={shotSlotsUsed >= 3}
            onChange={(e) => {
              onShots(e.target.files);
              // Allow re-selecting the same files and still trigger onChange.
              e.currentTarget.value = '';
            }}
            className="block w-full text-sm disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 pt-2 pb-1 -mx-1 px-1 sm:static sm:mx-0 sm:px-0 sm:pt-0 sm:pb-0 border-t border-borderC sm:border-0 mt-2 sm:mt-0">
        {embedded && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt order-2 sm:order-1"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="w-full sm:w-auto text-center px-5 py-3 sm:py-2.5 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt order-2 sm:order-1"
          >
            Cancel
          </Link>
        )}
        <button
          type="submit"
          disabled={busy || form.categories.length === 0}
          className="w-full sm:w-auto sm:ml-auto px-6 py-3 sm:py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 order-1 sm:order-2"
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
