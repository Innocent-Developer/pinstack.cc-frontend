'use client';

import { ReactNode, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return <div ref={ref} className="min-w-0 overflow-x-hidden min-h-dvh flex flex-col">{children}</div>;
}
