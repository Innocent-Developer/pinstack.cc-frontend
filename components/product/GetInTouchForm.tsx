'use client';

import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';

type Props = {
  productId: string;
  productName: string;
};

export default function GetInTouchForm({ productId, productName }: Props) {
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api.sendProductInquiry(productId, {
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim(),
        message: message.trim(),
      });
      setDone(true);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
        Message sent to the maker of {productName}. They can reply to your email.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          required
          value={fromName}
          onChange={(e) => setFromName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-borderC px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
        <input
          required
          type="email"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder="Your email"
          className="rounded-xl border border-borderC px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/25"
        />
      </div>
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Write to the owner — a question, an offer, an idea…"
        className="w-full rounded-xl border border-borderC px-3 py-2.5 text-sm text-heading placeholder:text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/25"
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted">Stays on-site. No emails shown.</p>
        <button
          type="submit"
          disabled={sending}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
