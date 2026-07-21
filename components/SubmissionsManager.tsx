'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '../types';
import { productCategories } from '../lib/categories';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

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

export default function SubmissionsManager({ products, loading }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

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
              ? 'Add your first product — we will review it and list it in the directory.'
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
          {filtered.map((p) => (
            <li key={p._id}>
              <Link
                href={`/dashboard/products/${p._id}`}
                className="w-full text-left px-4 py-3.5 flex items-center gap-3.5 transition hover:bg-slate-50"
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
