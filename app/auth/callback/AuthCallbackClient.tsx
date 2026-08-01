'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth, type StoredUser } from '../../../lib/auth';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get('next') || '/dashboard';
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/oauth-session', {
          method: 'GET',
          credentials: 'same-origin',
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => ({}))) as {
          success?: boolean;
          token?: string;
          user?: StoredUser;
          message?: string;
        };

        if (cancelled) return;

        if (!res.ok || !data.success || !data.token || !data.user?.id || !data.user?.email) {
          setError('Google sign-in did not complete. Please try again.');
          return;
        }

        setAuth(data.token, data.user);
        router.replace(next.startsWith('/') ? next : '/dashboard');
      } catch {
        if (!cancelled) {
          setError('Google sign-in did not complete. Please try again.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-btn mb-4">
            {error}
          </p>
          <a href="/login" className="text-sm font-semibold text-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <p className="text-sm text-muted">Signing you in with Google…</p>
    </div>
  );
}

export default function AuthCallbackClient() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-sm text-muted">Loading…</div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
