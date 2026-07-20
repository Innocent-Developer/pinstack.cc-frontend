'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Stats } from '../types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FALLBACK: Stats = { products: 0, founders: 0, categories: 0 };

function Stat({ label, target, icon }: { label: string; target: number; icon: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }
    const obj = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: target,
        duration: 1.25,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        onUpdate: () => setValue(Math.round(obj.n)),
      });
    }, ref);
    return () => ctx.revert();
  }, [target]);

  return (
    <div ref={ref} className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
      <div className="w-10 h-10 rounded-xl bg-bgAlt text-primary flex items-center justify-center text-lg shrink-0" aria-hidden>
        {icon}
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-extrabold text-heading tabular-nums">
          {value.toLocaleString()}+
        </div>
        <div className="text-xs sm:text-sm text-muted">{label}</div>
      </div>
    </div>
  );
}

export default function StatsBar({ stats }: { stats: Stats | null }) {
  const data = stats || FALLBACK;

  return (
    <section className="border-y border-borderC bg-white py-10" aria-label="Directory stats">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Stat label="Products listed" target={data.products} icon="◫" />
        <Stat label="Founders" target={data.founders} icon="◎" />
        <Stat label="Categories" target={data.categories} icon="▣" />
      </div>
    </section>
  );
}
