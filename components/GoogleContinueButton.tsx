'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function GoogleButtonInner({ label = 'Continue with Google' }: { label?: string }) {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';
  const href = `/api/auth/google?next=${encodeURIComponent(next.startsWith('/') ? next : '/dashboard')}`;

  return (
    <a
      href={href}
      className="w-full inline-flex items-center justify-center gap-2.5 py-3 rounded-btn text-sm font-semibold border border-borderC bg-white text-heading hover:bg-bgAlt hover:border-primary/40 transition"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21 21-9.3 21-21c0-1.4-.1-2.3-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.6 7.3 6.3 14.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.2 26.7 37 24 37c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 40.6 16.2 45 24 45z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l.1.1 6.2 5.2C39.2 37.3 45 32 45 24c0-1.4-.1-2.3-.4-3.5z"
        />
      </svg>
      {label}
    </a>
  );
}

export default function GoogleContinueButton({ label }: { label?: string }) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[46px] animate-pulse rounded-btn bg-bgAlt border border-borderC" />
      }
    >
      <GoogleButtonInner label={label} />
    </Suspense>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-borderC" />
      </div>
      <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wide">
        <span className="bg-white px-3 text-muted">or</span>
      </div>
    </div>
  );
}
