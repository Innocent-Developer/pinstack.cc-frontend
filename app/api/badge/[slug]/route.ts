import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '../../../../config/site';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.includes('localhost') && process.env.NODE_ENV === 'production'
    ? siteConfig.apiUrl
    : process.env.NEXT_PUBLIC_API_URL || siteConfig.apiUrl;

export const revalidate = 300;

// Brand palette (must match tailwind.config.js)
const THEMES = {
  brand: {
    labelBg1: '#059669',  // primary
    labelBg2: '#047857',  // primary-hover
    countBg1: '#0f172a',  // heading
    countBg2: '#1e293b',
    divider: 'rgba(255,255,255,0.18)',
    labelText: 'rgba(255,255,255,0.92)',
    countText: '#ffffff',
  },
  dark: {
    labelBg1: '#0f172a',
    labelBg2: '#1e293b',
    countBg1: '#059669',
    countBg2: '#047857',
    divider: 'rgba(255,255,255,0.12)',
    labelText: 'rgba(255,255,255,0.85)',
    countText: '#ffffff',
  },
  light: {
    labelBg1: '#f0fdf4',  // bgAlt
    labelBg2: '#dcfce7',
    countBg1: '#059669',
    countBg2: '#047857',
    divider: 'rgba(5,150,105,0.2)',
    labelText: '#0f172a',
    countText: '#ffffff',
  },
} as const;

type Theme = keyof typeof THEMES;

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const rawTheme = req.nextUrl.searchParams.get('theme') ?? 'brand';
  const theme: Theme = rawTheme in THEMES ? (rawTheme as Theme) : 'brand';
  const colors = THEMES[theme];

  let name = slug;
  let upvotes = 0;
  let verified = false;

  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      const p = data.data || data;
      name = p.name || slug;
      upvotes = p.upvoteCount ?? p.score ?? 0;
      verified = !!p.isVerified;
    }
  } catch {
    // serve stale badge on error
  }

  const safeName = name.replace(/[<>"&]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c] ?? c)
  );

  const label = 'Featured on Pinstack' + (verified ? ' ✓' : '');
  const upvoteStr = `▲ ${upvotes}`;

  const labelW = 182;
  const countW = 62;
  const totalW = labelW + countW;
  const h = 32;
  const r = 6;
  const fontSize = 14;
  const textY = Math.round(h * 0.66);

  // Build border color for light theme
  const borderColor = theme === 'light' ? '#a7f3d0' : 'none';
  const showBorder = theme === 'light';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" role="img" aria-label="${label}">
  <title>${safeName}  ${label}</title>
  <defs>
    <linearGradient id="gl${theme}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${colors.labelBg1}"/>
      <stop offset="100%" stop-color="${colors.labelBg2}"/>
    </linearGradient>
    <linearGradient id="gc${theme}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${colors.countBg1}"/>
      <stop offset="100%" stop-color="${colors.countBg2}"/>
    </linearGradient>
    <clipPath id="clip${theme}">
      <rect width="${totalW}" height="${h}" rx="${r}" ry="${r}"/>
    </clipPath>
  </defs>

  <g clip-path="url(#clip${theme})">
    <rect width="${labelW}" height="${h}" fill="url(#gl${theme})"/>
    <rect x="${labelW}" width="${countW}" height="${h}" fill="url(#gc${theme})"/>
    <rect x="${labelW - 1}" width="1" height="${h}" fill="${colors.divider}"/>
  </g>

  ${showBorder ? `<rect width="${totalW}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="${borderColor}" stroke-width="1"/>` : ''}

  <text x="12" y="${textY}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="${fontSize}" font-weight="600" fill="${colors.labelText}" dominant-baseline="auto">${label}</text>
  <text x="${labelW + countW / 2}" y="${textY}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="${colors.countText}" text-anchor="middle" dominant-baseline="auto">${upvoteStr}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
