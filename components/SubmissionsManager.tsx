'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { getToken } from '../lib/auth';
import { productCategories } from '../lib/categories';
import type { Product } from '../types';
import EditProductForm from './EditProductForm';
import ProductSocialLinks from './ProductSocialLinks';
import { useToast } from './ToastProvider';
import BadgeCopyWidget from './BadgeCopyWidget';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type ModalMode = 'view' | 'edit';

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
  products: Product[];
  loading?: boolean;
  onChanged: (next: Product[]) => void;
}

export default function SubmissionsManager({ products, loading, onChanged }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const selected = useMemo(
    () => products.find((p) => p._id === selectedId) || null,
    [products, selectedId]
  );

  useEffect(() => {
    if (selectedId && !products.some((p) => p._id === selectedId)) {
      setSelectedId(null);
      setConfirmDelete(false);
      setModalMode('view');
    }
  }, [products, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  const closeModal = () => {
    setSelectedId(null);
    setConfirmDelete(false);
    setModalMode('view');
  };

  const counts = useMemo(() => {
    return {
      all: products.length,
      pending: products.filter((p) => p.status === 'pending').length,
      approved: products.filter((p) => p.status === 'approved').length,
      rejected: products.filter((p) => p.status === 'rejected').length,
    };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        productCategories(p).some((c) => c.name.toLowerCase().includes(q))
      );
    });
  }, [products, query, filter]);

  const handleDelete = async () => {
    if (!selected) return;
    const token = getToken();
    if (!token) {
      router.replace('/login?next=/dashboard');
      return;
    }
    setBusy(true);
    try {
      await api.deleteMyProduct(token, selected._id);
      onChanged(products.filter((p) => p._id !== selected._id));
      closeModal();
      toastSuccess('Listing deleted');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Could not delete');
    } finally {
      setBusy(false);
    }
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Live' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="relative">

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your submissions"
            className="w-full pl-10 pr-3 py-2.5 rounded-full border border-borderC bg-white text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          />
        </div>
        <Link
          href="/dashboard/add-product"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover shrink-0"
        >
          <span aria-hidden>+</span> New listing
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f.key
                ? 'bg-heading text-white'
                : 'bg-white text-muted border border-borderC hover:bg-bgAlt hover:text-heading'
            }`}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-70">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl bg-bgAlt animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-borderC bg-white px-6 py-14 text-center">
          <p className="text-heading font-bold mb-1">
            {products.length === 0 ? 'No submissions yet' : 'No matches'}
          </p>
          <p className="text-sm text-muted mb-5 max-w-sm mx-auto">
            {products.length === 0
              ? 'Add your first product we will review it and list it in the directory.'
              : 'Try another filter or clear your search.'}
          </p>
          {products.length === 0 && (
            <Link
              href="/dashboard/add-product"
              className="inline-flex px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
            >
              Add product
            </Link>
          )}
        </div>
      ) : (
        <ul className="rounded-2xl border border-borderC bg-white overflow-hidden divide-y divide-borderC">
          {filtered.map((p) => {
            const active = selectedId === p._id;
            return (
              <li key={p._id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p._id);
                    setModalMode('view');
                    setConfirmDelete(false);
                  }}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3.5 transition ${
                    active ? 'bg-bgAlt' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-bgAlt border border-borderC shrink-0">
                    {p.logoUrl ? (
                      <Image src={p.logoUrl} alt="" fill className="object-cover" sizes="44px" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-heading truncate">{p.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusChip(
                          p.status
                        )}`}
                      >
                        {p.status === 'approved' ? 'Live' : p.status || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{p.tagline}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end text-[11px] text-muted shrink-0 tabular-nums">
                    <span>{p.viewCount || 0} views</span>
                    <span>{formatDate(p.createdAt)}</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-muted shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Centered popup  sticky footer so actions always show */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 md:p-6 modal-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submission-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[4px]"
            aria-label="Close"
            onClick={closeModal}
          />

          <div
            className={`relative z-10 w-full flex flex-col bg-white shadow-[0_25px_70px_-25px_rgba(15,23,42,0.45)] border border-borderC/80 overflow-hidden h-[93dvh] sm:h-auto max-h-[93dvh] sm:max-h-[min(90vh,860px)] rounded-t-3xl sm:rounded-3xl modal-sheet-in ${
              modalMode === 'edit' ? 'sm:max-w-3xl' : 'sm:max-w-2xl'
            }`}
          >
            {/* Header  always visible */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-borderC shrink-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                  Listing workspace
                </p>
                <h3
                  id="submission-modal-title"
                  className="font-extrabold text-heading text-base sm:text-lg truncate pr-2"
                >
                  {selected.name}
                </h3>
              </div>
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-white border border-borderC">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('view');
                    setConfirmDelete(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    modalMode === 'view'
                      ? 'bg-heading text-white'
                      : 'text-muted hover:text-heading hover:bg-bgAlt'
                  }`}
                >
                  Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('edit');
                    setConfirmDelete(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    modalMode === 'edit'
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-heading hover:bg-bgAlt'
                  }`}
                >
                  Edit
                </button>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 rounded-full hover:bg-bgAlt text-muted flex items-center justify-center shrink-0 text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {modalMode === 'edit' ? (
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 bg-white">
                <EditProductForm
                  key={selected._id}
                  productId={selected._id}
                  embedded
                  onCancel={() => {
                    setModalMode('view');
                    setConfirmDelete(false);
                  }}
                  onSaved={(updated) => {
                    onChanged(products.map((p) => (p._id === updated._id ? updated : p)));
                    setModalMode('view');
                    setConfirmDelete(false);
                    toastSuccess('Changes saved');
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Scrollable body */}
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-bgAlt border border-borderC shrink-0">
                      {selected.logoUrl ? (
                        <Image
                          src={selected.logoUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-body leading-relaxed line-clamp-3 sm:line-clamp-none">
                        {selected.tagline}
                      </p>
                      <span
                        className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusChip(
                          selected.status
                        )}`}
                      >
                        {selected.status === 'approved' ? 'Live' : selected.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  {selected.status === 'rejected' && selected.rejectionReason && (
                    <div className="rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
                      <p className="text-xs font-bold text-red-800 mb-1">Rejection reason</p>
                      <p className="text-sm text-red-700">{selected.rejectionReason}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Views', value: selected.viewCount || 0 },
                      { label: 'Clicks', value: selected.websiteClickCount || 0 },
                      { label: 'Score', value: selected.score ?? 0 },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl bg-bgAlt px-2 sm:px-3 py-2.5 sm:py-3 text-center">
                        <p className="text-lg sm:text-xl font-extrabold text-heading tabular-nums">
                          {m.value}
                        </p>
                        <p className="text-[9px] sm:text-[10px] font-semibold text-muted uppercase tracking-wide mt-0.5">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                        Categories
                      </dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {productCategories(selected).length > 0
                          ? productCategories(selected).map((c) => (
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
                      <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                        Website
                      </dt>
                      <dd>
                        <a
                          href={selected.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline break-all text-sm"
                        >
                          {selected.websiteUrl}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                        Submitted
                      </dt>
                      <dd className="text-heading">{formatDate(selected.createdAt)}</dd>
                    </div>
                    {selected.updatedAt && (
                      <div>
                        <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                          Updated
                        </dt>
                        <dd className="text-heading">{formatDate(selected.updatedAt)}</dd>
                      </div>
                    )}
                    {selected.tags?.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                          Tags
                        </dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {selected.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-bgAlt text-muted font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <ProductSocialLinks
                    links={selected.socialLinks}
                    size="sm"
                    label="Social"
                    className="pt-1"
                  />

                  {selected.description && (
                    <div>
                      <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                        Description
                      </p>
                      <p className="text-sm text-body whitespace-pre-wrap leading-relaxed max-h-40 sm:max-h-none overflow-y-auto">
                        {selected.description}
                      </p>
                    </div>
                  )}

                  {selected.aiDescription && (
                    <div className="rounded-xl bg-bgAlt border border-borderC px-3.5 py-3">
                      <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1.5">
                        AI summary
                      </p>
                      <p className="text-sm text-body leading-relaxed">{selected.aiDescription}</p>
                    </div>
                  )}

                  {selected.screenshotUrls?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">
                        Screenshots
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selected.screenshotUrls.map((src) => (
                          <div
                            key={src}
                            className="relative aspect-video rounded-xl overflow-hidden border border-borderC bg-bgAlt"
                          >
                            <Image src={src} alt="" fill className="object-cover" sizes="200px" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.status === 'approved' && (
                    <BadgeCopyWidget slug={selected.slug} name={selected.name} upvotes={selected.upvoteCount ?? selected.score ?? 0} />
                  )}
                </div>

                {/* Sticky footer  actions always visible */}
                <div className="shrink-0 border-t border-borderC bg-white px-4 sm:px-6 py-3 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.12)]">
                  {!confirmDelete ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setModalMode('edit');
                          setConfirmDelete(false);
                        }}
                        className="w-full sm:flex-1 order-1 px-4 py-3 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                      >
                        Edit listing
                      </button>
                      {selected.status === 'approved' && (
                        <a
                          href={`/product/${selected.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto order-2 text-center px-4 py-3 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
                        >
                          View live
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="w-full sm:w-auto order-3 px-4 py-3 rounded-full text-sm font-semibold text-red-700 border border-red-100 hover:bg-red-50 sm:border-transparent"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-3 space-y-3">
                      <p className="text-sm text-red-800">
                        Delete <strong>{selected.name}</strong>? This cannot be undone.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={handleDelete}
                          className="w-full sm:flex-1 py-3 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {busy ? 'Deleting…' : 'Yes, delete'}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmDelete(false)}
                          className="w-full sm:flex-1 py-3 rounded-full text-sm font-semibold border border-borderC bg-white text-heading hover:bg-bgAlt"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] sm:text-[11px] text-muted text-center mt-2 hidden sm:block">
                    Live listings stay published when you edit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
