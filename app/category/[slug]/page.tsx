import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '../../../components/PageShell';
import ProductCard from '../../../components/ProductCard';
import EmptyState from '../../../components/EmptyState';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { api } from '../../../lib/api';
import { categoryGuides, categoryIntro } from '../../../lib/categoryIntros';
import { pageMetadata } from '../../../lib/seo';
import { siteConfig } from '../../../config/site';
import { getStaticCategoryBySlug } from '../../../lib/staticCategories';

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getStaticCategoryBySlug(params.slug);
  if (!category) {
    return { title: { absolute: 'Category Not Found' } };
  }
  const name = category.name;

  return pageMetadata({
    title: `Best ${name} Tools - Pinstack Directory`,
    description: `Discover the top ${name.toLowerCase()} tools and products on Pinstack. Browse SaaS and AI products ranked by community upvotes, with new listings added weekly.`,
    path: `/category/${params.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const category = getStaticCategoryBySlug(params.slug);
  if (!category) notFound();

  const [productsRes, countsRes] = await Promise.all([
    api.getProducts({ category: category.slug, sort: 'ranked', limit: '24' }),
    api.getCategoryCounts().catch(() => ({ data: {} as Record<string, number> })),
  ]);

  const categoryName = category.name;
  const productCount = countsRes.data?.[category.slug] ?? productsRes.data.length;
  const guides = categoryGuides(params.slug);

  return (
    <>
      <PageShell>
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Categories', path: '/categories' },
            { name: categoryName, path: `/category/${params.slug}` },
          ]}
          className="mb-4 shrink-0"
        />
        <div className="shrink-0 mb-8">
          <h1 className="text-2xl font-extrabold text-heading mb-2">Best {categoryName}</h1>
          <p className="text-sm text-body mb-2 max-w-2xl leading-relaxed">
            {categoryIntro(params.slug, categoryName)}
          </p>
          <p className="text-sm text-muted">
            {productCount} tools on {siteConfig.name}, ranked by community upvotes.
          </p>
          {guides.length > 0 && (
            <p className="text-sm text-body mt-3 max-w-2xl">
              Related guides:{' '}
              {guides.map((g, i) => (
                <span key={g.slug}>
                  {i > 0 && ' · '}
                  <Link
                    href={`/blog/${g.slug}`}
                    className="text-primary font-semibold hover:underline"
                  >
                    {g.label}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </div>

        {productsRes.data.length === 0 ? (
          <EmptyState
            title="No products in this category yet"
            description="Be the first to list a product here."
            actionHref="/dashboard/add-product"
            actionLabel="Add a product"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsRes.data.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}
