import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import { api } from '../../lib/api';
import type { Category } from '../../types';

export const metadata: Metadata = {
  title: 'Browse Categories  SaaS, AI Tools & APIs',
  description: 'Explore Pinstack categories and find the best tools by topic.',
  alternates: { canonical: 'https://pinstack.cc/categories' },
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categoriesRes = await api.getCategories().catch(() => ({
    success: false,
    data: [] as Category[],
  }));
  const categories = categoriesRes.data;

  return (
    <>
      <Header />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <ScrollReveal className="mb-10">
          <h1 className="text-3xl font-extrabold text-heading mb-2">Categories</h1>
          <p className="text-sm text-muted">
            Pick a category to browse products ranked by community upvotes.
          </p>
        </ScrollReveal>

        {categories.length === 0 ? (
          <p className="text-muted text-sm">No categories yet. Check back soon.</p>
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
      </main>
      <Footer />
    </>
  );
}
