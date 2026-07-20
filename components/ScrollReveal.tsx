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
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !ref.current) return;

    const targets = stagger ? Array.from(ref.current.children) : ref.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 28, filter: 'blur(4px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          delay,
          ease: 'power3.out',
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, stagger]);

  return (
    <div ref={ref} className={`min-w-0 w-full ${className}`.trim()}>
      {children}
    </div>
  );
}
