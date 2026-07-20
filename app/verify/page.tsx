'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthShell from '../../components/AuthShell';
import { api } from '../../lib/api';
import { setAuth } from '../../lib/auth';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Request a new link from signup or login.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.verifyEmail(token);
        if (cancelled) return;
        if (res.token && res.user) {
          setAuth(res.token, res.user);
        }
        setStatus('success');
        setMessage(res.message || 'Email verified. Welcome to Pinstack!');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1800);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <AuthShell
      title={status === 'success' ? 'You’re verified' : status === 'error' ? 'Link issue' : 'Verifying…'}
      subtitle={
        status === 'success'
          ? 'A welcome email is on its way. Taking you to Pinstack…'
          : 'Hang tight while we confirm your account.'
      }
    >
      <div className="text-center space-y-5 py-2">
        <div
          className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border ${
            status === 'success'
              ? 'bg-successBg border-emerald-200'
              : status === 'error'
                ? 'bg-red-50 border-red-100'
                : 'bg-bgAlt border-borderC animate-pulse'
          }`}
        >
          <span className="text-2xl" aria-hidden>
            {status === 'success' ? '✓' : status === 'error' ? '!' : '…'}
          </span>
        </div>
        <p className="text-sm text-body leading-relaxed">{message}</p>
        {status === 'error' && (
          <div className="flex flex-col gap-2">
            <Link
              href="/signup"
              className="w-full py-3 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover text-center"
            >
              Sign up again
            </Link>
            <Link
              href="/login"
              className="w-full py-3 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt text-center"
            >
              Back to log in
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bgAlt animate-pulse" />}>
      <VerifyContent />
    </Suspense>
  );
}
