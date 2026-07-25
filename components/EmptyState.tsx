'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Check back soon  new listings are added regularly.',
  actionHref,
  actionLabel,
  icon,
}: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-4 py-16 min-h-[40vh]">
      <div className="relative mb-6" aria-hidden>
        <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl scale-150 animate-empty-glow" />
        <div className="relative w-20 h-20 rounded-2xl border border-borderC bg-white shadow-sm flex items-center justify-center animate-empty-float">
          {icon ?? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
                stroke="currentColor"
                strokeWidth="1.75"
              />
              <path
                d="M8 10h8M8 13.5h5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-heading mb-2 animate-empty-fade">{title}</h2>
      <p className="text-sm text-muted max-w-sm leading-relaxed animate-empty-fade [animation-delay:80ms]">
        {description}
      </p>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover animate-empty-fade [animation-delay:140ms]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
