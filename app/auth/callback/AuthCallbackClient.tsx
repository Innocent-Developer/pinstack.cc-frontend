'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth, type StoredUser } from '../../lib/auth';

function readOAuthSession(): { token: string; user: StoredUser } | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )oauth_session=([^;]*)/);
  if (!match?.[1]) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as {
      token?: string;
      user?: StoredUser;
    };
    if (!parsed.token || !parsed.user?.id || !parsed.user?.email) return null;
    return { token: parsed.token, user: parsed.user };
  } catch {
    return null;
  }
}

function clearOAuthSessionCookie() {
  document.cookie = 'oauth_session=; Max-Age=0; path=/; SameSite=Lax';
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get('next') || '/dashboard';
    const session = readOAuthSession();
    if (!session) {
      setError('Google sign-in did not complete. Please try again.');
      return;
    }

    setAuth(session.token, session.user);
    clearOAuthSessionCookie();
    router.replace(next.startsWith('/') ? next : '/dashboard');
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
