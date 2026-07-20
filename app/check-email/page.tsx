'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthShell from '../../components/AuthShell';
import { api } from '../../lib/api';

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setMessage(null);
    try {
      const res = await api.resendVerification(email);
      setMessage(res.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Check your email"
      subtitle="We sent a verification link to activate your account. Click it to finish signing up."
    >
      <div className="text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-bgAlt border border-borderC flex items-center justify-center">
          <span className="text-2xl" aria-hidden>
            ✉
          </span>
        </div>
        {email && (
          <p className="text-sm text-body">
            Sent to <strong className="text-heading">{email}</strong>
          </p>
        )}
        <p className="text-sm text-muted leading-relaxed">
          Open the email and tap <strong className="text-heading">Verify my account</strong>. The
          link expires in 24 hours. After you verify, we’ll send a welcome email too.
        </p>
        {message && (
          <p className="text-sm text-success bg-successBg px-3 py-2 rounded-btn">{message}</p>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email}
            className="w-full py-3 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt disabled:opacity-50 transition"
          >
            {resending ? 'Sending…' : 'Resend verification link'}
          </button>
          <Link
            href="/login"
            className="w-full py-3 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover text-center transition"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bgAlt animate-pulse" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
