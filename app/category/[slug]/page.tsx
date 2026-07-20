import type { Metadata } from 'next';
import PageShell from '../../../components/PageShell';
import ProductCard from '../../../components/ProductCard';
import EmptyState from '../../../components/EmptyState';
import { api } from '../../../lib/api';
import { buildBreadcrumbSchema, pageMetadata } from '../../../lib/seo';
import { siteConfig } from '../../../config/site';

export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoriesRes = await api.getCategories().catch(() => ({ data: [] as import('../../../types').Category[] }));
  const category = categoriesRes.data.find((c) => c.slug === params.slug);
  const name = category?.name || params.slug;

  return pageMetadata({
    title: `Best ${name} Tools — Pinstack Directory`,
    description: `Discover the top ${name.toLowerCase()} tools and products on Pinstack. Browse SaaS and AI products ranked by community upvotes, with new listings added weekly.`,
    path: `/category/${params.slug}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const categoriesRes = await api.getCategories().catch(() => ({ data: [] as import('../../../types').Category[] }));
  const category = categoriesRes.data.find((c) => c.slug === params.slug);

  const productsRes = category
    ? await api.getProducts({ category: category._id, sort: 'ranked', limit: '24' })
    : { data: [] as import('../../../types').Product[] };

  const categoryName = category?.name || params.slug;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: categoryName, path: `/category/${params.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageShell>
        <div className="shrink-0 mb-8">
          <h1 className="text-2xl font-extrabold text-heading mb-2">Best {categoryName}</h1>
          <p className="text-sm text-body mb-2 max-w-2xl leading-relaxed">
            Browse {categoryName.toLowerCase()} tools and products on {siteConfig.name}. Listings are
            ranked by community upvotes so you see what founders and builders actually recommend — not
            paid placement.
          </p>
          <p className="text-sm text-muted">
            {category?.productCount || 0} tools, ranked by community upvotes.
          </p>
        </div>

        {productsRes.data.length === 0 ? (
          <EmptyState
            title="No products in this category yet"
            description="Be the first to list a product here — free submissions are reviewed within a few days."
            actionHref="/login?next=/dashboard/add-product"
            actionLabel="Add your product"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsRes.data.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}
