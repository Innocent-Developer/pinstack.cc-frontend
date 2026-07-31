import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '../lib/blog';
import { siteConfig } from '../config/site';

/** Prefer production API; never let a failed fetch break sitemap.xml (HTTP 500). */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://api.pinstack.cc/api'
).replace(/\/$/, '');

export const revalidate = 3600; // refresh sitemap hourly

function safeDate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function entry(
  path: string,
  opts: {
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority?: number;
    lastModified?: string | Date | null;
  } = {}
): MetadataRoute.Sitemap[number] {
  const lastModified = safeDate(opts.lastModified) || new Date();
  return {
    url: path.startsWith('http') ? path : `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency: opts.changeFrequency || 'weekly',
    priority: opts.priority ?? 0.5,
  };
}

async function fetchJson<T>(path: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      // Avoid Next fetch cache quirks that can 500 sitemap generation
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function safeBlogEntries(): MetadataRoute.Sitemap {
  try {
    return getAllBlogPosts()
      .filter((p) => p?.slug)
      .map((p) =>
        entry(`/blog/${p.slug}`, {
          changeFrequency: 'monthly',
          priority: 0.75,
          lastModified: p.updatedAt || p.publishedAt,
        })
      );
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    entry('/', { changeFrequency: 'daily', priority: 1 }),
    entry('/explore', { changeFrequency: 'daily', priority: 0.9 }),
    entry('/blog', { changeFrequency: 'weekly', priority: 0.8 }),
    entry('/categories', { changeFrequency: 'weekly', priority: 0.7 }),
    entry('/pricing', { changeFrequency: 'monthly', priority: 0.7 }),
    entry('/about', { changeFrequency: 'monthly', priority: 0.6 }),
    entry('/contact', { changeFrequency: 'yearly', priority: 0.3 }),
  ];

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetchJson<{ data?: Array<{ slug?: string; updatedAt?: string; createdAt?: string }> }>(
        '/products?limit=1000&sort=ranked'
      ),
      fetchJson<{ data?: Array<{ slug?: string }> }>('/categories'),
    ]);

    const products = Array.isArray(productsRes?.data) ? productsRes!.data : [];
    const categories = Array.isArray(categoriesRes?.data) ? categoriesRes!.data : [];

    const productPages = products
      .filter((p) => typeof p?.slug === 'string' && p.slug.length > 0)
      .map((p) =>
        entry(`/product/${encodeURIComponent(p.slug!)}`, {
          changeFrequency: 'weekly',
          priority: 0.8,
          lastModified: p.updatedAt || p.createdAt,
        })
      );

    const categoryPages = categories
      .filter((c) => typeof c?.slug === 'string' && c.slug.length > 0)
      .map((c) =>
        entry(`/category/${encodeURIComponent(c.slug!)}`, {
          changeFrequency: 'daily',
          priority: 0.7,
        })
      );

    return [...staticPages, ...safeBlogEntries(), ...productPages, ...categoryPages];
  } catch {
    // Absolute fallback — never 500 the sitemap
    return [...staticPages, ...safeBlogEntries()];
  }
}
