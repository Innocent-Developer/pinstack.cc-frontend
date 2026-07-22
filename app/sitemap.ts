import { MetadataRoute } from 'next';
import { api } from '../lib/api';
import { getAllBlogPosts } from '../lib/blog';
import { siteConfig } from '../config/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, categoriesRes] = await Promise.all([
    api.getProducts({ limit: '1000' }).catch(() => ({ data: [] as import('../types').Product[] })),
    api.getCategories().catch(() => ({ data: [] as import('../types').Category[] })),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: 'daily', priority: 1 },
    { url: `${siteConfig.url}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/pricing`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteConfig.url}/explore`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.url}/categories`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteConfig.url}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteConfig.url}/contact`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((p) => ({
    url: `${siteConfig.url}/blog/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  const productPages: MetadataRoute.Sitemap = productsRes.data.map((p) => ({
    url: `${siteConfig.url}/product/${p.slug}`,
    lastModified: p.updatedAt || p.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categoriesRes.data.map((c) => ({
    url: `${siteConfig.url}/category/${c.slug}`,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...productPages, ...categoryPages];
}
