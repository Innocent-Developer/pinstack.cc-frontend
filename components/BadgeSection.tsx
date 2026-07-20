'use client';

import { useState } from 'react';

const EMBED_SNIPPET = `<a href="https://pinstack.cc" target="_blank" rel="noopener noreferrer">
  <img src="https://pinstack.cc/icon.png" alt="Featured on Pinstack" width="48" height="48" />
</a>`;

export default function BadgeSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMBED_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="py-14 bg-bgAlt" aria-labelledby="badge-heading">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 id="badge-heading" className="text-2xl md:text-[26px] font-extrabold text-heading mb-2">
            Get your Pinstack badge
          </h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Once your listing is live, embed a badge on your own site linking back to your Pinstack
            page  free with any listing.
          </p>
        </div>

        <div className="max-w-[640px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col items-center justify-center border border-borderC bg-white rounded-card p-8 min-h-[140px]">
            <p className="text-xs text-muted mb-3">Preview</p>
            <div
              className="inline-flex items-center gap-2.5 bg-heading text-white px-4 py-2 rounded-btn text-sm font-semibold"
              aria-label="Featured on Pinstack badge preview"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" width={22} height={22} className="rounded-[6px]" />
              Featured on Pinstack
            </div>
          </div>

          <div className="border border-borderC bg-white rounded-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-heading">Embed code</p>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1 rounded-btn border border-borderC hover:bg-bgAlt"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed text-body bg-bgAlt rounded-btn p-3 overflow-x-auto whitespace-pre-wrap break-all">
              <code>{EMBED_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
