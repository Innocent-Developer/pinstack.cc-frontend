'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function HeroContent() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !rootRef.current) return;

    const items = rootRef.current.querySelectorAll('[data-hero-item]');
    gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      }
    );
  }, []);

  return (
    <div ref={rootRef} className="relative max-w-[1100px] mx-auto px-6">
      <span
        data-hero-item
        className="inline-block text-[13px] font-semibold text-primary bg-white/90 px-3 py-1.5 rounded-full mb-5"
      >
        Discover · Launch · Grow
      </span>
      <h1
        data-hero-item
        className="text-3xl md:text-[40px] font-extrabold text-heading leading-tight mb-4"
      >
        Find the tools founders
        <br />
        actually use.
      </h1>
      <p data-hero-item className="text-base text-body max-w-[520px] mx-auto mb-7">
        A directory for SaaS products, AI tools, APIs, and developer tools  submitted free by
        founders, discovered and upvoted by the community.
      </p>
      <form
        data-hero-item
        action="/explore"
        className="flex flex-col sm:flex-row max-w-[480px] mx-auto gap-2 mb-5"
        role="search"
      >
        <label htmlFor="hero-search" className="sr-only">
          Search products
        </label>
        <input
          id="hero-search"
          type="search"
          name="search"
          placeholder="Search products, categories..."
          className="flex-1 px-4 py-3 border border-borderC rounded-btn text-sm bg-white"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
        >
          Search
        </button>
      </form>
      <div data-hero-item>
        <Link
          href="/explore"
          className="inline-block px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading bg-white/80 hover:bg-white"
        >
          Explore Products
        </Link>
      </div>
    </div>
  );
}
