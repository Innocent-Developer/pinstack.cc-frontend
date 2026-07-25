import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import EmptyState from '../../components/EmptyState';
import { api } from '../../lib/api';
import { pageMetadata } from '../../lib/seo';
import type { Category } from '../../types';

export const metadata: Metadata = pageMetadata({
  title: 'Browse Categories  SaaS, AI Tools & APIs',
  description: 'Explore Pinstack categories and find the best tools by topic.',
  path: '/categories',
});

export const revalidate = 300;

export default async function CategoriesPage() {
  const categoriesRes = await api.getCategories().catch(() => ({
    success: false,
    data: [] as Category[],
  }));
  const categories = categoriesRes.data;

  return (
    <PageShell>
      <ScrollReveal className="mb-10 shrink-0">
        <h1 className="text-3xl font-extrabold text-heading mb-2">Categories</h1>
        <p className="text-sm text-muted">
          Pick a category to browse products ranked by community upvotes.
        </p>
      </ScrollReveal>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="We're setting things up. Check back soon  or explore the full directory while we add categories."
          actionHref="/explore"
          actionLabel="Explore products"
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M4 5.5A1.5 1.5 0 0 1 5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4ZM13 5.5A1.5 1.5 0 0 1 14.5 4h4A1.5 1.5 0 0 1 20 5.5v4A1.5 1.5 0 0 1 18.5 11h-4A1.5 1.5 0 0 1 13 9.5v-4ZM4 14.5A1.5 1.5 0 0 1 5.5 13h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4ZM13 14.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4Z"
                stroke="currentColor"
                strokeWidth="1.75"
              />
            </svg>
          }
        />
      ) : (
        <ScrollReveal stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat._id}
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
      )}
    </PageShell>
  );
}
