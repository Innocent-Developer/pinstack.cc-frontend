import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import VisitWebsiteButton from '../../../components/VisitWebsiteButton';
import ProductChatBot from '../../../components/ProductChatBot';
import ProductReviews from '../../../components/ProductReviews';
import ProductVoteButtons from '../../../components/ProductVoteButtons';
import VerifiedBadge from '../../../components/VerifiedBadge';
import ProductSocialLinks from '../../../components/ProductSocialLinks';
import { api } from '../../../lib/api';
import { productCategories } from '../../../lib/categories';
import { buildBreadcrumbSchema, buildProductSchema } from '../../../lib/seo';
import { siteConfig } from '../../../config/site';
import { visitWebsiteUrl } from '../../../lib/utm';
import type { Product } from '../../../types';

// Always fetch fresh  isVerified / isFeatured change without a redeploy
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await api.getProductBySlug(params.slug);
    const product = res.data;
    const description =
      product.aiDescription ||
      product.description?.slice(0, 155) ||
      (product.tagline.length > 155 ? product.tagline.slice(0, 155) : product.tagline);

    return {
      title: { absolute: `${product.name}  ${product.tagline}` },
      description,
      alternates: { canonical: `${siteConfig.url}/product/${product.slug}` },
      openGraph: {
        title: `${product.name} on Pinstack`,
        description: product.tagline,
        url: `${siteConfig.url}/product/${product.slug}`,
        images: [
          {
            url: product.logoUrl,
            width: 512,
            height: 512,
            alt: `${product.name} logo`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: product.name,
        description: product.tagline,
        images: [product.logoUrl],
      },
    };
  } catch {
    return { title: { absolute: 'Product Not Found' } };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product: Product;
  try {
    const res = await api.getProductBySlug(params.slug);
    product = res.data;
  } catch {
    notFound();
  }

  // Never render pending / rejected listings on the public site
  if (!product || product.status === 'pending' || product.status === 'rejected') {
    notFound();
  }

  const cats = productCategories(product);
  const primaryCategoryId = cats[0]?._id || product.category?._id;

  const [relatedRes, trendingRes, categoriesRes] = await Promise.all([
    primaryCategoryId
      ? api.getProducts({ category: primaryCategoryId, sort: 'ranked', limit: '12' }).catch(() => ({
          data: [] as Product[],
        }))
      : Promise.resolve({ data: [] as Product[] }),
    api.getProducts({ sort: 'ranked', limit: '12' }).catch(() => ({ data: [] as Product[] })),
    api.getCategories().catch(() => ({ data: [] as { _id: string; name: string; slug: string; icon: string }[] })),
  ]);

  const related = (relatedRes.data || [])
    .filter((p) => p._id !== product._id)
    .slice(0, 6);

  const relatedIds = new Set(related.map((p) => p._id));
  const moreToExplore = (trendingRes.data || [])
    .filter((p) => p._id !== product._id && !relatedIds.has(p._id))
    .slice(0, 6);

  const directoryCategories = (categoriesRes.data || []).slice(0, 8);
  const listedOn = formatDate(product.createdAt);
  const primaryCat = cats[0];

  const productSchema = buildProductSchema({
    name: product.name,
    description: product.description,
    tagline: product.tagline,
    websiteUrl: product.websiteUrl,
    logoUrl: product.logoUrl,
    category: product.category,
    categories: cats,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    ...(primaryCat
      ? [{ name: primaryCat.name, path: `/category/${primaryCat.slug}` }]
      : []),
    { name: product.name, path: `/product/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_220px)]">
        {/* Hero */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-8">
          <nav className="text-xs text-muted mb-6 flex flex-wrap items-center gap-1.5">
            <Link href="/explore" className="hover:text-primary">
              Explore
            </Link>
            <span aria-hidden>/</span>
            {cats[0] ? (
              <>
                <Link href={`/category/${cats[0].slug}`} className="hover:text-primary">
                  {cats[0].name}
                </Link>
                <span aria-hidden>/</span>
              </>
            ) : null}
            <span className="text-heading font-medium truncate">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 items-start">
            <div>
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border border-borderC shrink-0 shadow-sm">
                  <Image
                    src={product.logoUrl}
                    alt={`${product.name} logo`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    priority
                  />
                  {product.isVerified && (
                    <span
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-success text-white flex items-center justify-center ring-2 ring-white shadow-sm"
                      title="Verified on Pinstack"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {product.isVerified && <VerifiedBadge size="md" />}
                    {product.isFeatured && (
                      <span className="text-[11px] bg-amber-50 text-featured px-2.5 py-0.5 rounded-full font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-body text-[15px] mt-2 leading-relaxed max-w-2xl">
                    {product.tagline}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {cats.map((c) => (
                      <Link
                        key={c._id}
                        href={`/category/${c.slug}`}
                        className="text-[11px] bg-white border border-borderC text-heading px-2.5 py-1 rounded-full font-semibold hover:border-primary hover:text-primary"
                      >
                        {c.icon ? `${c.icon} ` : ''}
                        {c.name}
                      </Link>
                    ))}
                    {product.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] bg-bgAlt text-muted px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ProductSocialLinks
                links={product.socialLinks}
                size="md"
                label=""
                className="mt-4"
              />

              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <VisitWebsiteButton
                  productId={product._id}
                  websiteUrl={product.websiteUrl}
                  slug={product.slug}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover shadow-sm"
                />
                <Link
                  href="/dashboard/add-product"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
                >
                  List your product
                </Link>
              </div>
            </div>

            {/* Stats card */}
            <aside className="rounded-2xl border border-borderC bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-bold text-muted uppercase tracking-wide mb-3">At a glance</p>

              <div className="flex justify-center mb-4 pb-4 border-b border-borderC">
                <ProductVoteButtons
                  productId={product._id}
                  productName={product.name}
                  initialScore={product.score ?? 0}
                  initialUpvotes={product.upvoteCount ?? 0}
                  initialDownvotes={product.downvoteCount ?? 0}
                  variant="compact"
                />
              </div>

              <dl className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Upvotes', value: product.upvoteCount ?? 0 },
                  { label: 'Downvotes', value: product.downvoteCount ?? 0 },
                  { label: 'Views', value: product.viewCount ?? 0 },
                  { label: 'Clicks', value: product.websiteClickCount ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-bgAlt px-3 py-2.5 text-center">
                    <dd className="text-xl font-extrabold text-heading tabular-nums">{s.value}</dd>
                    <dt className="text-[10px] font-semibold text-muted uppercase tracking-wide mt-0.5">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
              {listedOn && (
                <p className="text-xs text-muted mt-4 text-center">Listed {listedOn}</p>
              )}
            </aside>
          </div>
        </section>

        {/* About + AI */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-12">
          <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6">
            <div className="rounded-2xl border border-borderC bg-white p-6 sm:p-8">
              <h2 className="text-lg font-extrabold text-heading mb-3">About {product.name}</h2>
              <p className="text-body leading-relaxed whitespace-pre-wrap">{product.description}</p>

              {product.screenshotUrls?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-borderC">
                  <p className="text-xs font-bold text-muted uppercase tracking-wide mb-4">
                    Screenshots
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.screenshotUrls.map((src, i) => (
                      <div
                        key={`${src}-${i}`}
                        className="relative aspect-[16/10] rounded-xl overflow-hidden border border-borderC bg-bgAlt shadow-sm"
                      >
                        <Image
                          src={src}
                          alt={`${product.name} screenshot ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.tags?.length > 0 && (
                <div className="mt-6 pt-5 border-t border-borderC">
                  <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-bgAlt text-heading font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {product.aiDescription && (
                <div className="rounded-2xl border border-borderC bg-bgAlt p-5 sm:p-6">
                  <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                    AI overview
                  </p>
                  <p className="text-sm text-body leading-relaxed">{product.aiDescription}</p>
                </div>
              )}

              <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6">
                <p className="text-xs font-bold text-muted uppercase tracking-wide mb-3">Details</p>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-3">
                    <dt className="text-muted shrink-0">Website</dt>
                    <dd className="min-w-0">
                      <a
                        href={visitWebsiteUrl(product.websiteUrl, product.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-borderC bg-white hover:border-primary hover:bg-bgAlt text-xs font-semibold text-heading transition group max-w-[180px]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${product.websiteUrl}&sz=16`}
                          alt=""
                          width={14}
                          height={14}
                          className="rounded-sm shrink-0"
                        />
                        <span className="truncate text-primary group-hover:underline">
                          {product.websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                        </span>
                        <svg className="w-3 h-3 text-muted shrink-0" viewBox="0 0 12 12" fill="none"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </a>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Categories</dt>
                    <dd className="text-heading font-medium text-right">
                      {cats.map((c) => c.name).join(', ') || ''}
                    </dd>
                  </div>
                  {listedOn && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Listed on</dt>
                      <dd className="text-heading font-medium">{listedOn}</dd>
                    </div>
                  )}
                </dl>
                <ProductSocialLinks
                  links={product.socialLinks}
                  size="sm"
                  label="Social"
                  className="mt-4 pt-4 border-t border-borderC"
                />
                <VisitWebsiteButton
                  productId={product._id}
                  websiteUrl={product.websiteUrl}
                  slug={product.slug}
                  className="mt-5 w-full inline-flex justify-center px-4 py-2.5 rounded-full text-sm font-semibold bg-heading text-white hover:opacity-90"
                >
                  Open website
                </VisitWebsiteButton>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-12">
          <ProductReviews
            productId={product._id}
            productSlug={product.slug}
            productName={product.name}
          />
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-borderC bg-white">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Similar tools</p>
                  <h2 className="text-2xl font-extrabold text-heading">Related products</h2>
                  <p className="text-sm text-muted mt-1">
                    More listings in {cats[0]?.name || 'this category'}
                  </p>
                </div>
                {cats[0] && (
                  <Link
                    href={`/category/${cats[0].slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View category →
                  </Link>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* More to explore */}
        {moreToExplore.length > 0 && (
          <section className="border-t border-borderC bg-bgAlt/60">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">Discover</p>
                  <h2 className="text-2xl font-extrabold text-heading">More to explore</h2>
                  <p className="text-sm text-muted mt-1">Trending tools across the directory</p>
                </div>
                <Link href="/explore" className="text-sm font-semibold text-primary hover:underline">
                  Browse all →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {moreToExplore.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories strip */}
        {directoryCategories.length > 0 && (
          <section className="border-t border-borderC bg-white">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
              <h2 className="text-xl font-extrabold text-heading mb-2">Browse by category</h2>
              <p className="text-sm text-muted mb-5">Find more SaaS, AI tools, and APIs</p>
              <div className="flex flex-wrap gap-2">
                {directoryCategories.map((c) => (
                  <Link
                    key={c._id}
                    href={`/category/${c.slug}`}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-borderC bg-white text-heading hover:border-primary hover:text-primary"
                  >
                    {c.icon ? `${c.icon} ` : ''}
                    {c.name}
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-heading text-white hover:opacity-90"
                >
                  All categories
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="border-t border-borderC">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-14">
            <div className="rounded-2xl bg-heading text-white px-4 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(ellipse at 10% 20%, rgba(5,150,105,0.55), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(16,185,129,0.25), transparent 45%)',
                }}
              />
              <div className="relative z-10 max-w-lg">
                <h2 className="text-2xl font-extrabold mb-2">Got a product like this?</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  List your SaaS, AI tool, or API on Pinstack free forever, ranked by the community.
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/add-product"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                >
                  Add your product
                </Link>
                <Link
                  href="/explore"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/20"
                >
                  ← Back to Explore
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ProductChatBot productId={product._id} productName={product.name} />
      <Footer />
    </>
  );
}
