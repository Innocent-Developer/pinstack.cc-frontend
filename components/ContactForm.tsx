'use client';

import { useState, FormEvent, useEffect } from 'react';

const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '9950af42-925b-444e-9087-4c4367d48650';

const REASON_MAP: Record<string, string> = {
  featured: 'featured_placement',
  verified: 'verified_badge',
  listing: 'listing_issue',
  partnership: 'partnership',
};

const REASON_LABELS: Record<string, string> = {
  general: 'General question',
  listing_issue: 'Listing issue or edit request',
  featured_placement: 'Featured placement',
  verified_badge: 'Verified badge',
  partnership: 'Partnership',
  report_problem: 'Report a problem',
};

interface ContactFormProps {
  initialReason?: string;
}

export default function ContactForm({ initialReason }: ContactFormProps) {
  const resolvedReason = initialReason ? REASON_MAP[initialReason] || 'general' : 'general';
  const [form, setForm] = useState({ name: '', email: '', reason: resolvedReason, message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialReason) {
      const reason = REASON_MAP[initialReason] || 'general';
      setForm((prev) => ({ ...prev, reason }));
    }
  }, [initialReason]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (!form.message.trim()) next.message = 'Message is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const reasonLabel = REASON_LABELS[form.reason] || form.reason;
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);
      formData.append('name', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('message', form.message.trim());
      formData.append('subject', `Pinstack contact — ${reasonLabel}`);
      formData.append('reason', reasonLabel);
      formData.append('from_name', form.name.trim());

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }

      setSubmitted(true);
      setForm({ name: '', email: '', reason: resolvedReason, message: '' });
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : 'Something went wrong sending your message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-borderC rounded-card p-8 text-center bg-bgAlt">
        <h3 className="font-bold text-heading text-lg mb-2">Message sent</h3>
        <p className="text-sm text-muted">Thanks — we typically reply within a few days.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-heading mb-1">Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        />
        {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-heading mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        />
        {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="reason" className="block text-xs font-semibold text-heading mb-1">Reason for contact</label>
        <select
          id="reason"
          name="reason"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        >
          <option value="general">General question</option>
          <option value="listing_issue">Listing issue or edit request</option>
          <option value="featured_placement">Featured placement</option>
          <option value="verified_badge">Verified badge</option>
          <option value="partnership">Partnership</option>
          <option value="report_problem">Report a problem</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-heading mb-1">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        />
        {errors.message && <p id="message-error" className="text-xs text-red-600 mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
