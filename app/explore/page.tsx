import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ExploreResults from '../../components/ExploreResults';
import { api } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Explore SaaS Tools, AI Products & APIs  Pinstack Directory',
  description:
    'Browse and search SaaS products, AI tools, developer tools, and APIs on Pinstack. Filter by category, sort by newest or most upvoted.',
  alternates: { canonical: 'https://pinstack.cc/explore' },
};

export default async function ExplorePage() {
  const categoriesRes = await api.getCategories().catch(() => ({ success: false, data: [] as import('../../types').Category[] }));

  return (
    <>
      <Header />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-heading mb-6 sm:mb-8">Explore products</h1>
        <Suspense fallback={<div className="h-40 animate-pulse bg-bgAlt rounded-card" />}>
          <ExploreResults categories={categoriesRes.data} />
        </Suspense>

        <section className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t border-borderC">
          <div className="rounded-2xl bg-bgAlt border border-borderC px-5 sm:px-8 py-8 sm:py-10 text-center max-w-xl mx-auto">
            <h2 className="text-lg sm:text-xl font-extrabold text-heading mb-2">Questions or need help?</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              For listing support, featured placement, verified badges, or anything else — reach out and we will get back to you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
            >
              Contact us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
