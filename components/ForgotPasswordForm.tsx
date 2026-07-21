'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message || 'Check your email for a reset link.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-success bg-successBg border border-emerald-100 px-3.5 py-3 rounded-btn">
          {message}
        </div>
        <p className="text-sm text-muted text-center">
          Didn’t get it? Check spam, or{' '}
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setMessage('');
            }}
            className="text-primary font-semibold hover:underline"
          >
            try again
          </button>
          .
        </p>
        <p className="text-sm text-muted text-center">
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Back to log in
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

      <p className="text-sm text-body">
        Enter the email for your account and we’ll send a link to set a new password.
      </p>

      <div>
        <label htmlFor="forgot-email" className="block text-xs font-semibold text-heading mb-1.5">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input w-full px-3.5 py-3 border border-borderC rounded-btn text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
          placeholder="you@company.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group w-full py-3.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-sm text-muted text-center pt-1">
        Remembered it?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
