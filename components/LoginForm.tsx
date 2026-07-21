'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { api } from '../lib/api';
import { setAuth } from '../lib/auth';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendMsg(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (!res.success || !res.token || !res.user) {
        throw new Error(res.message || 'Login failed');
      }
      setAuth(res.token, res.user);
      // Navigate immediately — don't wait on a full refresh
      router.replace(next.startsWith('/') ? next : '/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      if (message.toLowerCase().includes('verify')) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMsg(null);
    try {
      const res = await api.resendVerification(email);
      setResendMsg(res.message);
    } catch (err) {
      setResendMsg(err instanceof Error ? err.message : 'Could not resend link');
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-btn">
          {error}
          {needsVerification && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="block mt-2 font-semibold text-primary hover:underline"
            >
              {resending ? 'Sending…' : 'Resend verification link'}
            </button>
          )}
        </div>
      )}
      {resendMsg && (
        <p className="text-sm text-success bg-successBg border border-emerald-100 px-3.5 py-3 rounded-btn">
          {resendMsg}
        </p>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-semibold text-heading mb-1.5">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input w-full px-3.5 py-3 border border-borderC rounded-btn text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-xs font-semibold text-heading mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input w-full px-3.5 py-3 pr-12 border border-borderC rounded-btn text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-heading"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="mt-1.5 text-right">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-muted hover:text-primary transition"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group w-full py-3.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        {loading ? 'Signing in…' : 'Log in'}
      </button>

      <p className="text-sm text-muted text-center pt-1">
        No account yet?{' '}
        <Link href="/signup" className="text-primary font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse bg-bgAlt rounded-btn" />}>
      <LoginFormInner />
    </Suspense>
  );
}
