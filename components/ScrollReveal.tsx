'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
  /** Soft scale-up (product-card style) */
  scale?: boolean;
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  stagger = false,
  scale = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !ref.current) return;

    const targets = stagger ? Array.from(ref.current.children) : ref.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: 24,
          ...(scale ? { scale: 0.985 } : {}),
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          ...(scale ? { scale: 1 } : {}),
          filter: 'blur(0px)',
          duration: 1.05,
          delay,
          ease: 'expo.out',
          stagger: stagger
            ? { each: 0.08, from: 'start', ease: 'power1.out' }
            : 0,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 92%',
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, stagger, scale]);

  return (
    <div ref={ref} className={`min-w-0 w-full ${className}`.trim()}>
      {children}
    </div>
  );
}
