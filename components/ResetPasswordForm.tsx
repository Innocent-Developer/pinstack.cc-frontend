'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../lib/api';
import { setAuth } from '../lib/auth';

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is missing a token. Request a new one from the login page.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(token, password);
      if (!res.success) {
        throw new Error(res.message || 'Could not reset password');
      }
      if (res.token && res.user) {
        setAuth(res.token, res.user);
        router.replace('/dashboard');
        return;
      }
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-btn">
          This reset link is invalid. Request a new password reset email.
        </div>
        <p className="text-sm text-muted text-center">
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
            Forgot password
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-btn">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-xs font-semibold text-heading mb-1.5">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input w-full px-3.5 py-3 pr-12 border border-borderC rounded-btn text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
            placeholder="At least 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-heading"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-xs font-semibold text-heading mb-1.5">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="auth-input w-full px-3.5 py-3 border border-borderC rounded-btn text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
          placeholder="Repeat new password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group w-full py-3.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        {loading ? 'Updating…' : 'Save new password'}
      </button>

      <p className="text-sm text-muted text-center pt-1">
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse bg-bgAlt rounded-btn" />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
