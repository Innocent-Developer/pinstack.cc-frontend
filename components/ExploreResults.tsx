'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../lib/api';
import { Product, Category } from '../types';
import ProductCard from './ProductCard';

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

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = useCallback(
    async (pageToLoad: number, reset: boolean) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          sort,
          page: String(pageToLoad),
          limit: '12',
        };
        if (search) params.search = search;
        if (category) params.category = category;

        const res = await api.getProducts(params);
        setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));
        setHasMore(pageToLoad < res.pagination.pages);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [search, category, sort]
  );

  // Refetch and update URL params when filters change (debounced for search)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
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

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, false);
  };

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
            
          </p>

          {/* Category chips  click to filter, not a dropdown */}
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
        <div className="text-center py-16">
          <p className="text-body mb-3">No products match this search yet.</p>
          <p className="text-sm text-muted">Try a different category, or submit your own product below.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-borderC rounded-card h-[180px] animate-pulse bg-bgAlt" />
            ))}
        </div>
      )}

      {hasMore && !loading && products.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-2.5 rounded-btn text-sm font-semibold border border-borderC hover:bg-bgAlt"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
