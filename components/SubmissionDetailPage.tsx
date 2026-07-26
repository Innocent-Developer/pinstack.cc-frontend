'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { getToken } from '../lib/auth';
import { productCategories } from '../lib/categories';
import type { Product } from '../types';
import ProductSocialLinks from './ProductSocialLinks';
import ProductReviews from './ProductReviews';
import ProductCard from './ProductCard';
import BadgeCopyWidget from './BadgeCopyWidget';
import { useToast } from './ToastProvider';

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function statusChip(status?: string) {
  if (status === 'approved')
    return 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20';
  if (status === 'rejected') return 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/15';
  return 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-600/20';
}

interface Props {
  productId: string;
}

export default function SubmissionDetailPage({ productId }: Props) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const boot = async () => {
      const token = getToken();
      if (!token) {
        router.replace(`/login?next=/dashboard/products/${productId}`);
        return;
      }
      try {
        const [mine, trending] = await Promise.all([
          api.getMyProduct(token, productId),
          api.getProducts({ sort: 'ranked', limit: '8' }).catch(() => ({ data: [] as Product[] })),
        ]);
        setProduct(mine.data);
        setRelated((trending.data || []).filter((p) => p._id !== productId).slice(0, 6));
      } catch {
        router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    void boot();
  }, [productId, router]);

  const handleDelete = async () => {
    if (!product) return;
    const token = getToken();
    if (!token) {
      router.replace('/login?next=/dashboard');
      return;
    }
    setBusy(true);
    try {
      await api.deleteMyProduct(token, product._id);
      toastSuccess('Listing deleted');
      router.replace('/dashboard');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not delete');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-bgAlt animate-pulse" />
        <div className="h-64 rounded-2xl bg-bgAlt animate-pulse" />
      </div>
    );
  }

  if (!product) return null;

  const cats = productCategories(product);
  const status = product.status || 'pending';
  const isLive = status === 'approved';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-primary hover:underline inline-block mb-3"
          >
            ← Back to dashboard
          </Link>
          <div className="flex items-start gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-bgAlt border border-borderC shrink-0">
              {product.logoUrl ? (
                <Image src={product.logoUrl} alt="" fill className="object-cover" sizes="64px" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-heading">{product.name}</h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusChip(
                    status
                  )}`}
                >
                  {isLive ? 'Live' : status}
                </span>
              </div>
              <p className="text-sm text-body leading-relaxed">{product.tagline}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/dashboard/products/${product._id}/edit`}
            className="px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            Edit listing
          </Link>
          {isLive && (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="px-4 py-2.5 rounded-full text-sm font-semibold border border-borderC bg-white hover:bg-bgAlt"
            >
              Public page ↗
            </Link>
          )}
        </div>
      </div>

      {!isLive && (
        <div
          className={`rounded-2xl border px-4 py-3.5 ${
            status === 'rejected'
              ? 'bg-red-50 border-red-100'
              : 'bg-amber-50 border-amber-100'
          }`}
        >
          <p className="text-sm font-bold text-heading mb-0.5">
            {status === 'rejected' ? 'Rejected  not public' : 'Pending review  not public yet'}
          </p>
          <p className="text-sm text-body">
            {status === 'rejected'
              ? 'This listing is hidden from the directory. Edit and resubmit to send it back for review.'
              : 'Your listing is in the review queue. It will appear on Pinstack only after approval. You can still edit details below.'}
          </p>
          {status === 'rejected' && product.rejectionReason && (
            <p className="text-sm text-red-700 mt-2">
              <span className="font-semibold">Reason:</span> {product.rejectionReason}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Views', value: product.viewCount || 0 },
          { label: 'Clicks', value: product.websiteClickCount || 0 },
          { label: 'Score', value: product.score ?? 0 },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-borderC bg-white px-3 py-4 text-center">
            <p className="text-2xl font-extrabold text-heading tabular-nums">{m.value}</p>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mt-1">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-borderC bg-white p-5 sm:p-6 space-y-5">
        <h2 className="font-extrabold text-heading text-lg">Listing details</h2>

        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
              Categories
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {cats.length
                ? cats.map((c) => (
                    <span
                      key={c._id}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-bgAlt text-heading font-semibold"
                    >
                      {c.icon} {c.name}
                    </span>
                  ))
                : ''}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">Website</dt>
            <dd>
              <a
                href={product.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline break-all"
              >
                {product.websiteUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Submitted</dt>
            <dd className="text-heading">{formatDate(product.createdAt)}</dd>
          </div>
          {product.updatedAt && (
            <div>
              <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1">Updated</dt>
              <dd className="text-heading">{formatDate(product.updatedAt)}</dd>
            </div>
          )}
        </dl>

        <ProductSocialLinks links={product.socialLinks} size="sm" label="Social" />

        {product.description && (
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
              Description
            </p>
            <p className="text-sm text-body whitespace-pre-wrap leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {product.aiDescription && (
          <div className="rounded-xl bg-bgAlt border border-borderC px-3.5 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">AI summary</p>
            <p className="text-sm text-body leading-relaxed">{product.aiDescription}</p>
          </div>
        )}

        {product.screenshotUrls?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Screenshots</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.screenshotUrls.map((src) => (
                <div
                  key={src}
                  className="relative aspect-video rounded-xl overflow-hidden border border-borderC bg-bgAlt"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="220px" />
                </div>
              ))}
            </div>
          </div>
        )}

        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-full bg-bgAlt text-muted font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-borderC bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-heading text-lg mb-1">Pinstack badge</h2>
            <p className="text-sm text-muted">
              Embed this on your site. Click Verify and we’ll scan{' '}
              <span className="font-medium text-heading">{product.websiteUrl}</span> for the badge.
            </p>
          </div>
          {product.badgeEmbedded ? (
            <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
              Badge verified
            </span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-600/20">
              Not verified yet
            </span>
          )}
        </div>

        <BadgeCopyWidget
          slug={product.slug}
          name={product.name}
          upvotes={product.upvoteCount ?? product.score ?? 0}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              const token = getToken();
              if (!token) return;
              setBusy(true);
              try {
                const res = await api.verifyMyProductBadge(token, product._id);
                setProduct((p) =>
                  p
                    ? {
                        ...p,
                        badgeEmbedded: res.data.badgeEmbedded,
                        badgeVerifiedAt: res.data.badgeVerifiedAt,
                      }
                    : p
                );
                if (res.data.found) toastSuccess(res.data.message);
                else toastError(res.data.message);
              } catch (err) {
                toastError(err instanceof Error ? err.message : 'Verify failed');
              } finally {
                setBusy(false);
              }
            }}
            className="px-4 py-2.5 rounded-full text-sm font-semibold bg-heading text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Scanning…' : 'Verify badge on my site'}
          </button>
          {!product.badgeEmbedded && (
            <p className="text-xs text-muted">If not found: add the badge, publish, then verify again.</p>
          )}
        </div>
      </section>

      {/* Reviews  live listings only; pending stays private */}
      <section className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
        <h2 className="font-extrabold text-heading text-lg mb-1">Reviews</h2>
        {isLive ? (
          <ProductReviews
            productId={product._id}
            productSlug={product.slug}
            productName={product.name}
          />
        ) : (
          <p className="text-sm text-muted mt-2">
            Reviews appear here after your listing is approved and goes live on Pinstack.
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="font-extrabold text-heading text-lg mb-4">Other products on Pinstack</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
        <p className="text-sm font-bold text-heading mb-2">Danger zone</p>
        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-sm font-semibold text-red-600 hover:underline"
          >
            Delete this listing
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-red-700">
              Delete <strong>{product.name}</strong>? This cannot be undone.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-sm font-semibold text-muted hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
