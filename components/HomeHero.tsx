'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import AddProductButton from './AddProductButton';

export default function HomeHero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !rootRef.current) return;

    const left = rootRef.current.querySelectorAll('[data-hero-left]');
    const right = rootRef.current.querySelector('[data-hero-card]');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        left,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' }
      );
      if (right) {
        gsap.fromTo(
          right,
          { opacity: 0, y: 32, rotate: 2 },
          { opacity: 1, y: 0, rotate: 0, duration: 0.75, delay: 0.2, ease: 'power3.out' }
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-bgAlt via-white to-white pt-14 pb-16 md:pt-20 md:pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 15% 10%, rgba(5,150,105,0.14), transparent 45%), radial-gradient(ellipse at 90% 30%, rgba(16,185,129,0.1), transparent 40%)',
        }}
      />

      <div ref={rootRef} className="relative max-w-[1160px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-10 items-center min-w-0">
        <div className="min-w-0">
          <p data-hero-left className="text-sm font-semibold text-primary mb-4 tracking-wide">
            Discover · Launch · Grow
          </p>
          <h1
            data-hero-left
            className="text-[2rem] sm:text-4xl md:text-[2.75rem] font-extrabold text-heading leading-[1.15] tracking-tight mb-5"
          >
            Find the tools founders{' '}
            <span className="text-primary">actually use</span>.
          </h1>
          <p data-hero-left className="text-base text-body max-w-lg mb-8 leading-relaxed">
            Pinstack is a directory for discovering SaaS products, AI tools, APIs, and developer
            tools. Founders submit their products for free, and the community browses, searches, and
            upvotes what&apos;s useful.
          </p>

          <form
            data-hero-left
            action="/explore"
            className="flex flex-col sm:flex-row gap-2 mb-5 max-w-xl"
            role="search"
          >
            <label htmlFor="home-search" className="sr-only">
              Search products
            </label>
            <div className="flex-1 flex items-center gap-2 px-4 py-1 border border-borderC rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-muted shrink-0">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                id="home-search"
                type="search"
                name="search"
                placeholder="Search products, categories, or use cases..."
                className="flex-1 py-3 text-sm outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover shrink-0"
            >
              Search
            </button>
          </form>

          <div data-hero-left className="flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
            >
              Explore Products +
            </Link>
            <AddProductButton className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-borderC text-heading bg-white hover:bg-bgAlt transition" />
          </div>
        </div>

        {/* Floating health / rank card  decorative, brand green */}
        <div data-hero-card className="relative mx-auto w-full max-w-[400px] min-w-0">
          <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" aria-hidden />
          <div className="relative bg-white border border-borderC rounded-2xl shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] p-4 sm:p-6 overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Community rank</p>
                <p className="text-lg font-extrabold text-heading">Product pulse</p>
              </div>
              <span className="text-[11px] font-bold bg-successBg text-success px-2.5 py-1 rounded-full">
                Live
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-5 sm:mb-6">
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background:
                    'conic-gradient(#059669 0% 82%, #E2E8F0 82% 100%)',
                }}
              >
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-heading">82</span>
                  <span className="text-[10px] text-muted">/ 100</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2.5 text-xs">
                {[
                  { label: 'Upvotes', value: 88 },
                  { label: 'Engagement', value: 74 },
                  { label: 'Freshness', value: 91 },
                ].map((m) => (
                  <li key={m.label}>
                    <div className="flex justify-between mb-1 text-body">
                      <span>{m.label}</span>
                      <span className="font-semibold text-heading">{m.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-borderC overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${m.value}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-16 rounded-xl bg-bgAlt border border-borderC flex items-end gap-1 px-3 pb-2 pt-3">
              {[40, 55, 48, 70, 62, 78, 72, 88, 80, 92, 85, 96].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-primary/70"
                  style={{ height: `${h}%`, opacity: 0.45 + i * 0.04 }}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted mt-3">Weekly momentum across trending listings</p>
          </div>
        </div>
      </div>
    </section>
  );
}
