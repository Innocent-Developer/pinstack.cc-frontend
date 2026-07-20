'use client';

import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';
import BrandLogo from './BrandLogo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
      );
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.65, delay: 0.12, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-[calc(100vh-1px)] grid lg:grid-cols-2 bg-white">
      {/* Brand panel */}
      <aside
        ref={panelRef}
        className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-heading text-white p-12 xl:p-16"
      >
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse at 20% 20%, rgba(5,150,105,0.55), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(4,120,87,0.4), transparent 45%), linear-gradient(160deg, #0F172A 0%, #064E3B 100%)',
          }}
        />
        <div className="auth-orb auth-orb-a" aria-hidden />
        <div className="auth-orb auth-orb-b" aria-hidden />

        <div className="relative z-10">
          <div className="inline-block rounded-xl bg-white px-3 py-2 shadow-lg">
            <BrandLogo variant="lockup" size={32} />
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-sm font-semibold text-emerald-300/90 mb-3 tracking-wide uppercase">
            Discover · Launch · Grow
          </p>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4">
            The directory founders use to get found.
          </h2>
          <p className="text-slate-300 text-[15px] leading-relaxed">
            List SaaS products, AI tools, and APIs for free. Upvote what matters. Build in public with
            a community that ships.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-slate-400">
          <span>Free listings</span>
          <span className="text-slate-600">·</span>
          <span>Community ranking</span>
          <span className="text-slate-600">·</span>
          <span>Verified badges</span>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex flex-col min-h-screen lg:min-h-0">
        <div className="lg:hidden px-4 sm:px-6 py-4 sm:py-5 border-b border-borderC">
          <BrandLogo variant="lockup" size={32} />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 bg-[radial-gradient(ellipse_at_top,_#F0FDF4_0%,_#ffffff_55%)]">
          <div ref={formRef} className="w-full max-w-[420px]">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight mb-2">{title}</h1>
            <p className="text-sm text-muted mb-8 leading-relaxed">{subtitle}</p>
            <div className="auth-card border border-borderC/80 bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-7 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]">
              {children}
            </div>
            {footer && <div className="mt-6 text-center">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
