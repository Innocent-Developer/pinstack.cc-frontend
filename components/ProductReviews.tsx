'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import { getStoredUser, getToken } from '../lib/auth';
import type { ProductReview, ReviewStats } from '../types';

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
}

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'text-sm' : 'text-lg';
  return (
    <span className={`${cls} text-amber-400 tracking-wide`} aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      <span className="text-slate-200">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`text-2xl transition ${
            n <= display ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'
          }`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function formatReviewDate(iso: string) {
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

export default function ProductReviews({ productId, productSlug, productName }: Props) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ count: 0, average: 0 });
  const [mine, setMine] = useState<ProductReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getStoredUser());
    setToken(getToken());
  }, []);

  const load = useCallback(async () => {
    if (!mounted) return;
    setLoading(true);
    setError(null);
    const authToken = getToken();
    try {
      const [listRes, mineRes] = await Promise.all([
        api.getProductReviews(productId),
        authToken
          ? api.getMyProductReview(authToken, productId).catch(() => ({ data: null }))
          : Promise.resolve({ data: null }),
      ]);
      setReviews(listRes.data || []);
      setStats(listRes.stats || { count: 0, average: 0 });
      setMine(mineRes.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reviews');
    } finally {
      setLoading(false);
    }
  }, [productId, mounted]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = (from?: ProductReview | null) => {
    if (from) {
      setRating(from.rating);
      setTitle(from.title || '');
      setComment(from.comment);
    } else {
      setRating(5);
      setTitle('');
      setComment('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const authToken = getToken();
    if (!authToken) return;
    setBusy(true);
    setError(null);
    try {
      if (editing && mine) {
        const res = await api.updateProductReview(authToken, productId, mine._id, {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        });
        setMine(res.data);
        setStats(res.stats);
        setEditing(false);
        setShowForm(false);
      } else {
        const res = await api.submitProductReview(authToken, productId, {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        });
        setMine(res.data);
        setStats(res.stats);
        setReviews((prev) => [res.data, ...prev.filter((r) => r._id !== res.data._id)]);
        setShowForm(false);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const authToken = getToken();
    if (!authToken || !mine || !confirm('Delete your review?')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.deleteProductReview(authToken, productId, mine._id);
      setMine(null);
      setStats(res.stats);
      setEditing(false);
      setShowForm(false);
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete review');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    resetForm(mine);
    setEditing(true);
    setShowForm(true);
  };

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-primary mb-1">Community</p>
          <h2 className="text-2xl font-extrabold text-heading">Reviews</h2>
          {stats.count > 0 ? (
            <div className="flex items-center gap-2 mt-2">
              <Stars rating={Math.round(stats.average)} />
              <span className="text-sm font-bold text-heading tabular-nums">{stats.average}</span>
              <span className="text-sm text-muted">({stats.count} review{stats.count === 1 ? '' : 's'})</span>
            </div>
          ) : (
            <p className="text-sm text-muted mt-1">No reviews yet be the first.</p>
          )}
        </div>

        {mounted && user && token && !mine && !showForm && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setEditing(false);
              setShowForm(true);
            }}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover shrink-0"
          >
            Write a review
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 mb-4">
          {error}
        </p>
      )}

      {/* Review form */}
      {showForm && mounted && user && token && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-borderC bg-white p-5 sm:p-6 mb-6 space-y-4"
        >
          <h3 className="font-bold text-heading">
            {editing ? 'Edit your review' : `Review ${productName}`}
          </h3>
          <div>
            <label className="block text-xs font-semibold text-heading mb-2">Your rating</label>
            <StarPicker value={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">
              Title <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Summarize your experience"
              className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Your review</label>
            <textarea
              required
              rows={4}
              minLength={10}
              maxLength={2000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? How does it compare to alternatives?"
              className="w-full px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            />
            <p className="text-[11px] text-muted mt-1">Minimum 10 characters</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy || comment.trim().length < 10}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {busy ? 'Saving…' : editing ? 'Update review' : 'Post review'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowForm(false);
                setEditing(false);
                resetForm(mine);
              }}
              className="px-5 py-2.5 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
            >
              Cancel
            </button>
            {editing && (
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-red-700 hover:bg-red-50 ml-auto"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {mounted && !user && (
        <div className="rounded-2xl border border-dashed border-borderC bg-bgAlt/50 px-5 py-6 mb-6 text-center">
          <p className="text-sm text-body mb-3">Sign in to leave a review</p>
          <Link
            href={`/login?next=/product/${productSlug}`}
            className="inline-flex px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            Log in to review
          </Link>
        </div>
      )}

      {mine && !showForm && (
        <div className="rounded-xl border border-primary/20 bg-bgAlt px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-body">
            You reviewed this product <Stars rating={mine.rating} size="sm" />
          </p>
          <button
            type="button"
            onClick={startEdit}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Edit your review
          </button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-bgAlt animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-borderC bg-white px-6 py-10 text-center text-sm text-muted">
          No reviews yet. Used {productName}? Share your honest take.
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li
              key={r._id}
              className={`rounded-2xl border bg-white p-5 sm:p-6 ${
                mine?._id === r._id ? 'border-primary/30' : 'border-borderC'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-heading">{r.authorName}</span>
                    {r.isVerifiedUser && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-success bg-successBg px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={r.rating} size="sm" />
                    <span className="text-xs text-muted">{formatReviewDate(r.createdAt)}</span>
                  </div>
                </div>
              </div>
              {r.title && <p className="font-semibold text-heading text-sm mb-1.5">{r.title}</p>}
              <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
