'use client';

import { useState, FormEvent } from 'react';
import { api } from '../lib/api';
import { Category } from '../types';

interface SubmitFormProps {
  categories: Category[];
}

type Mode = 'choose' | 'auto' | 'manual';

export default function SubmitForm({ categories }: SubmitFormProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [autofillUrl, setAutofillUrl] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionMethod, setSubmissionMethod] = useState<'auto' | 'manual'>('manual');

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
    categories: [] as string[],
    submitterName: '',
    submitterEmail: '',
  });

  const handleAutofill = async () => {
    if (!autofillUrl) return;
    setAutofilling(true);
    setAutofillMessage(null);
    try {
      const result = await api.autofill(autofillUrl);
      if (result.success && result.data) {
        setForm((f) => ({
          ...f,
          name: result.data!.name || '',
          tagline: result.data!.tagline || '',
          logoUrl: result.data!.logoUrl || '',
          websiteUrl: result.data!.websiteUrl,
        }));
        setSubmissionMethod('auto');
        setMode('manual'); // reveal full editable form pre-filled, always double-check before submit
        if (result.missingFields.length > 0) {
          setAutofillMessage(
            `Filled what we could find  please fill in: ${result.missingFields.join(', ')}.`
          );
        }
      } else {
        setAutofillMessage(result.message || 'Could not auto-fill. Please fill the form manually below.');
        setForm((f) => ({ ...f, websiteUrl: autofillUrl }));
        setMode('manual');
      }
    } catch {
      setAutofillMessage('Auto-fill failed. Please fill the form manually below.');
      setMode('manual');
    } finally {
      setAutofilling(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitProduct({
        ...form,
        category: form.categories[0],
        categories: form.categories,
        submissionMethod,
      });
      setSubmitted(true);
    } catch {
      setAutofillMessage('Submission failed  please check your fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="border border-borderC rounded-card p-8 text-center bg-bgAlt">
        <h3 className="font-bold text-heading text-lg mb-2">Submitted for review</h3>
        <p className="text-sm text-muted">
          Thanks  your product is in the queue. We&apos;ll email you once it&apos;s approved.
        </p>
      </div>
    );
  }

  if (mode === 'choose') {
    return (
      <div className="border border-borderC rounded-card p-8 text-center">
        <h3 className="font-bold text-heading text-lg mb-5">How would you like to submit?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
          <div className="flex-1 max-w-xs mx-auto">
            <input
              type="url"
              placeholder="https://yourproduct.com"
              value={autofillUrl}
              onChange={(e) => setAutofillUrl(e.target.value)}
              className="w-full px-4 py-2.5 border border-borderC rounded-btn text-sm mb-2"
            />
            <button
              onClick={handleAutofill}
              disabled={autofilling || !autofillUrl}
              className="w-full px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {autofilling ? 'Fetching...' : 'Auto-fill from URL'}
            </button>
          </div>
          <div className="text-muted text-sm self-center">or</div>
          <button
            onClick={() => {
              setSubmissionMethod('manual');
              setMode('manual');
            }}
            className="px-5 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt self-center"
          >
            Fill form manually
          </button>
        </div>
        {autofillMessage && <p className="text-xs text-muted mt-3">{autofillMessage}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-borderC rounded-card p-6 space-y-4">
      {autofillMessage && (
        <p className="text-xs bg-amber-50 text-featured px-3 py-2 rounded-btn">{autofillMessage}</p>
      )}

      <div>
        <label className="block text-xs font-semibold text-heading mb-1">Product name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-heading mb-1">Tagline (max 120 chars)</label>
        <input
          required
          maxLength={120}
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-heading mb-1">Description</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Website URL</label>
          <input
            required
            type="url"
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
            className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Logo URL</label>
          <input
            required
            type="url"
            value={form.logoUrl}
            onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-heading mb-1">
          Categories (select one or more)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {categories.map((c) => {
            const active = form.categories.includes(c._id);
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => {
                  setForm((f) => {
                    const has = f.categories.includes(c._id);
                    if (has) return { ...f, categories: f.categories.filter((id) => id !== c._id) };
                    if (f.categories.length >= 5) return f;
                    return { ...f, categories: [...f.categories, c._id] };
                  });
                }}
                className={`text-left px-3 py-2 rounded-btn border text-sm ${
                  active
                    ? 'border-primary bg-bgAlt font-semibold text-heading'
                    : 'border-borderC text-body'
                }`}
              >
                {active ? '✓ ' : ''}
                {c.icon} {c.name}
              </button>
            );
          })}
        </div>
        {form.categories.length === 0 && (
          <p className="text-[11px] text-muted mt-1">Pick at least one category to submit.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Your name</label>
          <input
            required
            value={form.submitterName}
            onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
            className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-heading mb-1">Your email</label>
          <input
            required
            type="email"
            value={form.submitterEmail}
            onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
            className="w-full px-3 py-2 border border-borderC rounded-btn text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || form.categories.length === 0}
        className="w-full py-3 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit for review'}
      </button>
    </form>
  );
}
