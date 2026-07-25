'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AddProductButton from './AddProductButton';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** Apple-like deceleration  long, soft settle */
const APPLE_EASE = 'expo.out';

const METRICS = [
  { label: 'Upvotes', value: 88 },
  { label: 'Engagement', value: 74 },
  { label: 'Freshness', value: 91 },
];

const BARS = [40, 55, 48, 70, 62, 78, 72, 88, 80, 92, 85, 96];

const HEADLINE = ['Find', 'the', 'tools', 'founders', 'actually', 'use.'];

export default function HomeHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion) {
      root.querySelectorAll('.opacity-0, [data-word], [data-hairline]').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.filter = 'none';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const words = root.querySelectorAll('[data-word]');
    const left = root.querySelectorAll('[data-hero-left]');
    const fills = root.querySelectorAll('[data-metric-fill]');
    const bars = root.querySelectorAll('[data-chart-bar]');
    const scoreRing = root.querySelector('[data-score-ring]');
    const glow = root.querySelector('[data-hero-glow]');
    const hairline = root.querySelector('[data-hairline]');
    const card = cardRef.current;
    const tilt = tiltRef.current;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: APPLE_EASE } });

      tl.fromTo(
        left,
        { opacity: 0, y: 18, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.05, stagger: 0.06 }
      );

      tl.fromTo(
        words,
        { opacity: 0, y: 22, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.15, stagger: 0.055 },
        0.12
      );

      if (card) {
        tl.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.96, filter: 'blur(12px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.25 },
          0.2
        );
      }

      if (hairline) {
        gsap.fromTo(
          hairline,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.2,
            delay: 0.85,
            ease: APPLE_EASE,
            transformOrigin: 'left center',
          }
        );
      }

      if (glow) {
        gsap.to(glow, {
          scale: 1.06,
          opacity: 0.75,
          duration: 4.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }

      // Gentle float via CSS  keeps GSAP free for magnetic tilt
      if (tilt) {
        tilt.classList.add('home-float-soft');
      }

      if (fills.length) {
        gsap.fromTo(
          fills,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.15,
            stagger: 0.1,
            delay: 0.75,
            ease: APPLE_EASE,
            transformOrigin: 'left center',
          }
        );
      }

      if (bars.length) {
        gsap.fromTo(
          bars,
          { scaleY: 0, opacity: 0.15 },
          {
            scaleY: 1,
            opacity: 1,
            duration: 0.95,
            stagger: 0.035,
            delay: 0.95,
            ease: APPLE_EASE,
            transformOrigin: 'bottom center',
          }
        );
      }

      if (scoreRing) {
        gsap.fromTo(
          scoreRing,
          { rotate: -120, opacity: 0.4 },
          { rotate: 0, opacity: 1, duration: 1.4, delay: 0.55, ease: APPLE_EASE }
        );
      }

      if (card) {
        gsap.to(card, {
          yPercent: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      }
    }, rootRef);

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (!tilt || !card) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(tilt, {
          rotateY: x * 7,
          rotateX: -y * 5,
          transformPerspective: 1000,
          duration: 0.65,
          ease: 'power3.out',
          overwrite: 'auto',
        });
        const spot = card.querySelector('[data-spotlight]') as HTMLElement | null;
        if (spot) {
          gsap.to(spot, {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    };

    const onLeave = () => {
      if (!tilt) return;
      gsap.to(tilt, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.9,
        ease: APPLE_EASE,
        overwrite: 'auto',
      });
    };

    if (card) {
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (card) {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
      }
      ctx.revert();
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-bgAlt via-white to-white pt-14 pb-16 md:pt-20 md:pb-24">
      <div
        className="absolute inset-0 pointer-events-none home-hero-mesh"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse at 15% 10%, rgba(5,150,105,0.12), transparent 48%), radial-gradient(ellipse at 88% 28%, rgba(16,185,129,0.08), transparent 42%)',
        }}
      />
      <div className="absolute top-[18%] left-[8%] w-40 h-40 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none home-orb" aria-hidden />
      <div className="absolute bottom-[12%] right-[12%] w-52 h-52 rounded-full bg-emerald-400/[0.08] blur-3xl pointer-events-none home-orb home-orb-delay" aria-hidden />

      <div
        ref={rootRef}
        className="relative max-w-[1160px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-10 items-center min-w-0"
      >
        <div className="min-w-0">
          <p
            data-hero-left
            className="text-sm font-semibold text-primary mb-4 tracking-[0.08em] uppercase opacity-0"
          >
            Discover · Launch · Grow
          </p>
          <h1 className="text-[2rem] sm:text-4xl md:text-[2.75rem] font-extrabold text-heading leading-[1.12] tracking-tight mb-5">
            {HEADLINE.map((word, i) => (
              <span
                key={`${word}-${i}`}
                data-word
                className={`inline-block mr-[0.28em] last:mr-0 opacity-0 will-change-transform ${
                  word === 'actually' || word === 'use.' ? 'text-primary' : ''
                }`}
              >
                {word}
              </span>
            ))}
          </h1>
          <div
            data-hairline
            className="h-px w-16 bg-gradient-to-r from-primary/70 to-transparent mb-5 origin-left scale-x-0"
            aria-hidden
          />
          <p data-hero-left className="text-base text-body max-w-lg mb-8 leading-relaxed opacity-0">
            Pinstack is a directory for discovering SaaS products, AI tools, APIs, and developer
            tools. Founders submit their products for free, and the community browses, searches, and
            upvotes what&apos;s useful.
          </p>

          <form
            data-hero-left
            action="/explore"
            className="flex flex-col sm:flex-row gap-2 mb-5 max-w-xl opacity-0"
            role="search"
          >
            <label htmlFor="home-search" className="sr-only">
              Search products
            </label>
            <div className="apple-field flex-1 flex items-center gap-2 px-4 py-1 border border-borderC rounded-xl bg-white/90 backdrop-blur-sm shadow-sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="text-muted shrink-0"
              >
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
              className="btn-smooth px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover shrink-0 shadow-md shadow-primary/20"
            >
              Search
            </button>
          </form>

          <div data-hero-left className="flex flex-wrap gap-3 opacity-0">
            <Link
              href="/explore"
              className="btn-smooth inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
            >
              Explore Products +
            </Link>
            <AddProductButton className="btn-smooth inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold border border-borderC text-heading bg-white/90 hover:bg-bgAlt hover:border-primary/40" />
          </div>
        </div>

        <div
          ref={cardRef}
          className="relative mx-auto w-full max-w-[400px] min-w-0 will-change-transform opacity-0 [perspective:1000px]"
        >
          <div
            data-hero-glow
            className="absolute -inset-6 bg-primary/[0.12] blur-3xl rounded-full"
            aria-hidden
          />
          <div
            ref={tiltRef}
            className="relative apple-glass apple-sheen border border-white/60 rounded-2xl shadow-[0_28px_80px_-36px_rgba(15,23,42,0.4)] p-4 sm:p-6 overflow-hidden will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              data-spotlight
              className="pointer-events-none absolute w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-2xl"
              aria-hidden
            />
            <div className="relative">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-[0.12em] mb-1">
                    Community rank
                  </p>
                  <p className="text-lg font-extrabold text-heading tracking-tight">Product pulse</p>
                </div>
                <span className="live-pill text-[11px] font-bold bg-successBg text-success px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                  <span className="live-dot" aria-hidden />
                  Live
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 mb-5 sm:mb-6">
                <div
                  data-score-ring
                  className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'conic-gradient(#059669 0% 82%, #E2E8F0 82% 100%)',
                  }}
                >
                  <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-heading tracking-tight">82</span>
                    <span className="text-[10px] text-muted">/ 100</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5 text-xs w-full">
                  {METRICS.map((m) => (
                    <li key={m.label}>
                      <div className="flex justify-between mb-1 text-body">
                        <span>{m.label}</span>
                        <span className="font-semibold text-heading tabular-nums">{m.value}</span>
                      </div>
                      <div className="h-1 rounded-full bg-borderC/80 overflow-hidden">
                        <div
                          data-metric-fill
                          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 origin-left"
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-16 rounded-xl bg-bgAlt/80 border border-borderC/70 flex items-end gap-1 px-3 pb-2 pt-3">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    data-chart-bar
                    className="flex-1 rounded-t bg-primary/65 origin-bottom"
                    style={{ height: `${h}%`, opacity: 0.4 + i * 0.045 }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted mt-3 tracking-wide">
                Weekly momentum across trending listings
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
