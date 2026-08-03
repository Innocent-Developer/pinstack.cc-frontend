'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

const PAGE_SIZE = 50;

interface ExploreResultsProps {
  categories: Category[];
}

export default function ExploreResults({ categories }: ExploreResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);

  pageRef.current = page;
  hasMoreRef.current = hasMore;

  const fetchProducts = useCallback(
    async (pageToLoad: number, reset: boolean) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }
      try {
        const params: Record<string, string> = {
          sort,
          page: String(pageToLoad),
          limit: String(PAGE_SIZE),
        };
        if (search) params.search = search;
        if (category) params.category = category;

        const res = await api.getProducts(params);
        setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));
        const more = pageToLoad < res.pagination.pages;
        setHasMore(more);
        hasMoreRef.current = more;
      } catch {
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [search, category, sort]
  );

  // Refetch and update URL params when filters change (debounced for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      pageRef.current = 1;
      fetchProducts(1, true);

      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (sort !== 'newest') params.set('sort', sort);
      router.replace(`/explore?${params.toString()}`, { scroll: false });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  // Infinite scroll — load next 50 when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (!hit || loadingMoreRef.current || !hasMoreRef.current) return;
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        setPage(nextPage);
        void fetchProducts(nextPage, false);
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchProducts, products.length, hasMore]);

  return (
    <div>
      <div className="sticky top-[65px] z-40 bg-white border-b border-borderC py-3 sm:py-4 mb-6 sm:mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Search by name, category, or use case…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-borderC rounded-btn text-sm"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 border border-borderC rounded-btn text-sm"
            >
              <option value="newest">Newest</option>
              <option value="upvoted">Most Upvoted</option>
              <option value="ranked">Trending</option>
            </select>
          </div>

          <p className="text-[11px] text-muted">
            Pending listings appear with a badge — voting unlocks after approval. Scroll for more.
          </p>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`px-3 py-1.5 rounded-btn text-xs font-semibold border transition ${
                !category
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-heading border-borderC hover:border-primary'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setCategory(c._id)}
                className={`px-3 py-1.5 rounded-btn text-xs font-semibold border transition ${
                  category === c._id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-heading border-borderC hover:border-primary'
                }`}
              >
                {c.icon ? `${c.icon} ` : ''}
                {c.name}
              </button>
            ))}
            <Link
              href="/categories"
              className="px-3 py-1.5 rounded-btn text-xs font-semibold text-primary hover:underline self-center"
            >
              View all →
            </Link>
          </div>
        </div>
      </div>

      {products.length === 0 && !loading ? (
        <EmptyState
          title="No products match this search yet"
          description="Try a different category or keyword  or submit your own product to the directory."
          actionHref="/login?next=/dashboard/add-product"
          actionLabel="Submit your product"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {(loading || loadingMore) &&
            Array.from({ length: loading ? 6 : 3 }).map((_, i) => (
              <div key={`sk-${i}`} className="border border-borderC rounded-card h-[180px] animate-pulse bg-bgAlt" />
            ))}
        </div>
      )}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-8 w-full" aria-hidden />

      {!hasMore && products.length > 0 && !loading && (
        <p className="text-center text-xs text-muted mt-4 mb-2">
          Showing all {products.length} products
        </p>
      )}
    </div>
  );
}
