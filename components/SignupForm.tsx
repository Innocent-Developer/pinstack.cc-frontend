'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import GoogleContinueButton, { AuthDivider } from './GoogleContinueButton';

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup({ name, email, password });
      if (!res.success) {
        throw new Error(res.message || 'Signup failed');
      }
      if (res.needsVerification) {
        router.push(`/check-email?email=${encodeURIComponent(res.email || email)}`);
        return;
      }
      throw new Error(res.message || 'Signup incomplete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <GoogleContinueButton label="Continue with Google" />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-3.5 py-3 rounded-btn">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="signup-name" className="block text-xs font-semibold text-heading mb-1.5">
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="auth-input w-full px-3.5 py-3 border border-borderC rounded-btn text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition"
          placeholder="Alex Founder"
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="block text-xs font-semibold text-heading mb-1.5">
          Email
        </label>
        <input
          id="signup-email"
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
        <label htmlFor="signup-password" className="block text-xs font-semibold text-heading mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
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

      <p className="text-[12px] text-muted leading-relaxed">
        We’ll email you a secure verification link  
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-sm text-muted text-center pt-1">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </form>
    </div>
  );
}
