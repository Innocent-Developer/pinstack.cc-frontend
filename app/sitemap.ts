import { MetadataRoute } from 'next';
import { api } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categoriesRes] = await Promise.all([
    api.getProducts({ limit: '1000' }).catch(() => ({ data: [] as import('../types').Product[] })),
    api.getCategories().catch(() => ({ data: [] as import('../types').Category[] })),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/pricing',
    '/explore',
    '/categories',
    '/contact',
  ].map((path) => ({
    url: `https://pinstack.cc${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = productsRes.data.map((p) => ({
    url: `https://pinstack.cc/product/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = categoriesRes.data.map((c) => ({
    url: `https://pinstack.cc/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
