'use client';

import { useState } from 'react';

interface Props {
  slug: string;
  name: string;
  upvotes: number;
}

type Theme = 'brand' | 'dark' | 'light';
type Format = 'img' | 'md';

const THEMES: { id: Theme; label: string; previewClass: string; countClass: string; border?: string }[] = [
  {
    id: 'brand',
    label: 'Brand',
    previewClass: 'bg-primary text-white',
    countClass: 'bg-heading text-white',
  },
  {
    id: 'dark',
    label: 'Dark',
    previewClass: 'bg-heading text-white',
    countClass: 'bg-primary text-white',
  },
  {
    id: 'light',
    label: 'Light',
    previewClass: 'bg-[#f0fdf4] text-heading border border-[#a7f3d0]',
    countClass: 'bg-primary text-white',
    border: 'border border-[#a7f3d0]',
  },
];

export default function BadgeCopyWidget({ slug, name, upvotes }: Props) {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<Format>('img');
  const [theme, setTheme] = useState<Theme>('brand');

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://pinstack.cc';
  const badgeSvg = `${origin}/api/badge/${slug}?theme=${theme}`;
  const productUrl = `${origin}/product/${slug}`;

  const snippet =
    format === 'img'
      ? `<a href="${productUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${badgeSvg}" alt="Featured on Pinstack  ${name}" />\n</a>`
      : `[![Featured on Pinstack  ${name}](${badgeSvg})](${productUrl})`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const activeTheme = THEMES.find((t) => t.id === theme)!;

  return (
    <div className="border-t border-borderC pt-4 mt-2 space-y-3">
      <div>
        <p className="text-sm font-bold text-heading uppercase tracking-wide mb-0.5">
          Embed badge
        </p>
        <p className="text-xs text-muted">
          Show this badge on your website or README  updates with live upvote count.
        </p>
      </div>

      {/* Live preview */}
      <div className="flex items-center gap-3 bg-bgAlt rounded-xl px-3 py-2.5 border border-borderC">
        {/* Inline HTML badge preview  matches SVG exactly */}
        <span
          className={`inline-flex items-center rounded-[6px] overflow-hidden text-sm sm:text-[15px] font-semibold shrink-0 select-none ${
            activeTheme.id === 'light' ? 'border border-[#a7f3d0]' : ''
          }`}
          aria-label={`Featured on Pinstack badge preview (${activeTheme.label} theme)`}
        >
          <span className={`px-3 py-1.5 ${activeTheme.previewClass}`}>
            Featured on Pinstack
          </span>
          <span className={`px-3 py-1.5 font-bold ${activeTheme.countClass}`}>
            ▲ {upvotes}
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-[11px] text-muted truncate">{name}</p>
          <p className="text-sm font-bold text-heading tabular-nums">▲ {upvotes} upvotes</p>
        </div>
      </div>

      {/* Theme picker */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1.5">Theme</p>
        <div className="flex gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                theme === t.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-borderC text-muted hover:text-heading hover:border-slate-300'
              }`}
            >
              {/* Swatch */}
              <span
                className={`w-3 h-3 rounded-sm inline-block shrink-0 ${
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
      </div>

      {/* Format toggle */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1.5">Format</p>
        <div className="flex items-center gap-1 p-0.5 rounded-full bg-bgAlt border border-borderC w-fit">
          {(['img', 'md'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                format === f ? 'bg-white text-heading shadow-sm border border-borderC' : 'text-muted hover:text-heading'
              }`}
            >
              {f === 'img' ? 'HTML' : 'Markdown'}
            </button>
          ))}
        </div>
      </div>

      {/* Embed snippet */}
      <div className="relative">
        <pre className="bg-bgAlt border border-borderC rounded-xl text-[11px] leading-relaxed text-body p-3 overflow-x-auto whitespace-pre-wrap break-all pr-16">
          <code>{snippet}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 text-xs font-semibold text-primary hover:text-primary-hover px-2.5 py-1 rounded-lg border border-borderC bg-white hover:bg-bgAlt transition"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
