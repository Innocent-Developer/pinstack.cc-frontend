import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { api } from '../../lib/api';
import { pageMetadata } from '../../lib/seo';
import { staticCategoriesWithCounts } from '../../lib/staticCategories';

export const metadata: Metadata = pageMetadata({
  title: 'Browse Categories - SaaS, AI Tools & APIs',
  description: 'Explore Pinstack categories and find the best tools by topic.',
  path: '/categories',
});

export const revalidate = 300;

export default async function CategoriesPage() {
  const countsRes = await api.getCategoryCounts().catch(() => ({
    success: false,
    data: {} as Record<string, number>,
  }));
  const categories = staticCategoriesWithCounts(countsRes.data || {});

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Categories', path: '/categories' },
        ]}
        className="mb-4 shrink-0"
      />
      <ScrollReveal className="mb-10 shrink-0">
        <h1 className="text-3xl font-extrabold text-heading mb-2">Categories</h1>
        <p className="text-sm text-muted">
          Pick a category to browse products ranked by community upvotes.
        </p>
      </ScrollReveal>

      <ScrollReveal stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="lift-card border border-borderC bg-white rounded-card p-5 text-center hover:border-primary"
          >
            <div className="text-2xl mb-2" aria-hidden>
              {cat.icon}
            </div>
            <div className="text-sm font-bold text-heading">{cat.name}</div>
            <div className="text-xs text-muted mt-1">{cat.productCount} products</div>
          </Link>
        ))}
      </ScrollReveal>
    </PageShell>
  );
}
