'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { getToken } from '../../../lib/auth';
import { api } from '../../../lib/api';

function BillingSuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'working' | 'ok' | 'error'>('working');
  const [message, setMessage] = useState('Confirming your payment…');
  const [productSlug, setProductSlug] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const next = `/billing/success?${searchParams.toString()}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const intentId =
      searchParams.get('intent') ||
      searchParams.get('intentId') ||
      searchParams.get('intent_id') ||
      (typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('fs_checkout_intent')
        : null);
    const licenseId =
      searchParams.get('license_id') ||
      searchParams.get('licenseId') ||
      searchParams.get('license');

    if (!intentId || !licenseId) {
      setStatus('error');
      setMessage(
        'Missing payment details. If you were charged, your benefits may still sync via webhook — check your dashboard in a minute.'
      );
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await api.completeFreemiusCheckout(token, {
          intentId,
          license_id: licenseId,
        });
        if (cancelled) return;
        try {
          sessionStorage.removeItem('fs_checkout_intent');
        } catch {
          /* ignore */
        }
        setStatus('ok');
        setMessage(res.message || 'Payment applied successfully.');
        setProductSlug(res.data.productSlug || null);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Could not confirm payment');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="max-w-md mx-auto text-center py-16 px-4">
      <h1 className="text-2xl font-extrabold text-heading mb-3">
        {status === 'working' ? 'Processing…' : status === 'ok' ? 'You\'re all set' : 'Almost there'}
      </h1>
      <p className="text-sm text-muted mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {productSlug ? (
          <Link
            href={`/product/${productSlug}`}
            className="px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            View listing
          </Link>
        ) : null}
        <Link
          href="/dashboard"
          className="px-4 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function BillingSuccessClient() {
  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-20 text-center text-sm text-muted">Loading payment status…</div>
          }
        >
          <BillingSuccessInner />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
