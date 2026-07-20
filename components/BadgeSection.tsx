'use client';

import { useState } from 'react';

type Theme = 'brand' | 'dark' | 'light';

const THEMES: {
  id: Theme;
  label: string;
  pillClass: string;
  countClass: string;
  wrapClass?: string;
}[] = [
  {
    id: 'brand',
    label: 'Brand',
    pillClass: 'bg-primary text-white',
    countClass: 'bg-heading text-white',
  },
  {
    id: 'dark',
    label: 'Dark',
    pillClass: 'bg-heading text-white',
    countClass: 'bg-primary text-white',
  },
  {
    id: 'light',
    label: 'Light',
    pillClass: 'bg-[#f0fdf4] text-heading',
    countClass: 'bg-primary text-white',
    wrapClass: 'border border-[#a7f3d0]',
  },
];

const SNIPPET: Record<Theme, string> = {
  brand: `<a href="https://pinstack.cc/product/your-product" target="_blank" rel="noopener noreferrer">
  <img src="https://pinstack.cc/api/badge/your-product?theme=brand"
       alt="Featured on Pinstack" />
</a>`,
  dark: `<a href="https://pinstack.cc/product/your-product" target="_blank" rel="noopener noreferrer">
  <img src="https://pinstack.cc/api/badge/your-product?theme=dark"
       alt="Featured on Pinstack" />
</a>`,
  light: `<a href="https://pinstack.cc/product/your-product" target="_blank" rel="noopener noreferrer">
  <img src="https://pinstack.cc/api/badge/your-product?theme=light"
       alt="Featured on Pinstack" />
</a>`,
};

export default function BadgeSection() {
  const [theme, setTheme] = useState<Theme>('brand');
  const [copied, setCopied] = useState(false);

  const active = THEMES.find((t) => t.id === theme)!;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET[theme]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section className="py-14 bg-bgAlt" aria-labelledby="badge-heading">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2
            id="badge-heading"
            className="text-2xl md:text-[26px] font-extrabold text-heading mb-2"
          >
            Get your Pinstack badge
          </h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Once your listing is live, embed a simple badge on your own website linking back to your
            Pinstack page  free with any listing.
          </p>
        </div>

        <div className="max-w-[680px] mx-auto space-y-4">
          {/* Theme toggle */}
          <div className="flex items-center justify-center gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  theme === t.id
                    ? 'border-primary bg-white text-primary shadow-sm'
                    : 'border-borderC bg-white text-muted hover:text-heading'
                }`}
              >
                <span
                  className={`w-3 h-3 rounded-sm shrink-0 ${
                    t.id === 'brand'
                      ? 'bg-primary'
                      : t.id === 'dark'
                      ? 'bg-heading'
                      : 'bg-[#f0fdf4] border border-[#a7f3d0]'
                  }`}
                />
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Preview card */}
            <div className="flex flex-col items-center justify-center border border-borderC bg-white rounded-card p-8 min-h-[140px] gap-3">
              <p className="text-xs text-muted">Preview</p>
              <span
                className={`inline-flex items-center rounded-[6px] overflow-hidden text-base font-semibold select-none ${active.wrapClass ?? ''}`}
                aria-label="Featured on Pinstack badge preview"
              >
                <span className={`flex items-center gap-2.5 px-4 py-2 ${active.pillClass}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icon.png"
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-[4px] shrink-0"
                  />
                  Featured on Pinstack
                </span>
                <span className={`px-4 py-2 font-bold text-[15px] ${active.countClass}`}>▲ 42</span>
              </span>
              <p className="text-[10px] text-muted">Upvote count updates live</p>
            </div>

            {/* Snippet card */}
            <div className="border border-borderC bg-white rounded-card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-heading">Embed code</p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1 rounded-btn border border-borderC hover:bg-bgAlt transition"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-[11px] leading-relaxed text-body bg-bgAlt rounded-btn p-3 overflow-x-auto whitespace-pre-wrap break-all">
                <code>{SNIPPET[theme]}</code>
              </pre>
              <p className="text-[10px] text-muted mt-2">
                Replace <code className="font-mono bg-bgAlt px-1 rounded">your-product</code> with
                your listing&apos;s slug.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
