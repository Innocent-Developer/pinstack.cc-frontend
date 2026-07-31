import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import ProductCard from '../components/ProductCard';
import HomeHero from '../components/HomeHero';
import StatsBar from '../components/StatsBar';
import BadgeSection from '../components/BadgeSection';
import BlogTeaser from '../components/BlogTeaser';
import AddProductButton from '../components/AddProductButton';
import { api } from '../lib/api';
import { siteConfig } from '../config/site';
import { buildOrganizationSchema, buildWebsiteSchema } from '../lib/seo';
import { withTimeout } from '../lib/withTimeout';
import type { Category, Product, Stats } from '../types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'Pinstack — Discover and Launch SaaS Tools, AI Products & APIs' },
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: 'Pinstack — Discover and Launch SaaS Tools, AI Products & APIs',
    description: siteConfig.description,
    url: siteConfig.url,
  },
};

const orgSchema = buildOrganizationSchema();
const websiteSchema = buildWebsiteSchema();

const whyItems = [
  {
    title: 'Discover',
    body: 'Browse SaaS products, AI tools, and developer tools by category  growing every week.',
    tone: 'bg-emerald-50 text-primary',
    icon: '◎',
  },
  {
    title: 'Submit Free',
    body: 'List your product in minutes. No cost for a basic listing.',
    tone: 'bg-teal-50 text-teal-700',
    icon: '✦',
  },
  {
    title: 'Upvote & Rank',
    body: "The community votes on what's genuinely useful, not what paid the most.",
    tone: 'bg-lime-50 text-lime-800',
    icon: '▲',
  },
  {
    title: 'Get Discovered',
    body: 'Founders get a shareable listing page and an embeddable badge for their own site.',
    tone: 'bg-cyan-50 text-cyan-800',
    icon: '↗',
  },
];

export default async function HomePage() {
  // Soft timeout so a slow API never blocks the whole homepage from opening
  const emptyHome = {
    success: false,
    data: {
      trending: [] as Product[],
      categories: [] as Category[],
      stats: null as Stats | null,
      updatedAt: '',
    },
  };

  const homeRes = await withTimeout(
    api.getHome().catch(() => emptyHome),
    8000,
    emptyHome
  );

  const categories = (homeRes.data.categories || []).slice(0, 8);
  const trending = homeRes.data.trending || [];
  const stats = homeRes.data.stats;
  const previewProducts = trending.slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Header />

      <main className="overflow-x-hidden">
        <HomeHero />
        <StatsBar stats={stats} />

        {/* Why Pinstack */}
        <section className="py-12 sm:py-16 max-w-[1160px] mx-auto px-4 sm:px-6" aria-labelledby="why-heading">
          <ScrollReveal className="text-center mb-10">
            <h2 id="why-heading" className="text-2xl md:text-[28px] font-extrabold text-heading mb-2 tracking-tight">
              Why Pinstack
            </h2>
            <span className="section-line" aria-hidden />
          </ScrollReveal>
          <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyItems.map((item) => (
              <div key={item.title} className="lift-card border border-borderC rounded-2xl p-5 bg-white group">
                <div
                  className={`why-icon w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${item.tone}`}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-heading text-[15px] mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-muted leading-relaxed">{item.body}</p>
              </div>
            ))}
          </ScrollReveal>
        </section>

        {/* Categories */}
        <section id="categories" className="py-16 bg-bgAlt scroll-mt-24" aria-labelledby="categories-heading">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
              <div>
                <h2 id="categories-heading" className="text-2xl md:text-[28px] font-extrabold text-heading mb-2 tracking-tight">
                  Explore by category
                </h2>
                <span className="section-line !mx-0" aria-hidden />
                <p className="text-sm text-muted mt-3">Pick a lane and browse tools ranked by the community.</p>
              </div>
              <Link href="/categories" className="text-sm font-semibold text-primary hover:underline">
                View all categories →
              </Link>
            </ScrollReveal>

            {categories.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5" aria-busy>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-borderC rounded-2xl h-[120px] animate-pulse bg-white" />
                ))}
              </div>
            ) : (
              <ScrollReveal stagger scale className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="lift-card group border border-borderC bg-white rounded-2xl p-5 text-center hover:border-primary"
                  >
                    <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110" aria-hidden>
                      {cat.icon}
                    </div>
                    <div className="text-sm font-bold text-heading">{cat.name}</div>
                    <div className="text-xs text-muted mt-1">{cat.productCount} products</div>
                  </Link>
                ))}
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* Trending */}
        <section id="trending" className="py-16 scroll-mt-24" aria-labelledby="trending-heading">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <ScrollReveal className="text-center mb-9">
              <h2 id="trending-heading" className="text-2xl md:text-[28px] font-extrabold text-heading mb-2 tracking-tight">
                Trending this week
              </h2>
              <span className="section-line" aria-hidden />
              <p className="text-sm text-muted mt-3">Ranked by community upvotes, updated hourly.</p>
            </ScrollReveal>

            {trending.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-busy>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-borderC rounded-2xl h-[180px] animate-pulse bg-bgAlt" />
                ))}
              </div>
            ) : (
              <ScrollReveal stagger scale className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trending.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </ScrollReveal>
            )}
          </div>
        </section>

        {/* Intelligence-style split */}
        <section className="py-12 sm:py-16 bg-bgAlt overflow-x-hidden" aria-labelledby="intel-heading">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-12 items-start lg:items-center">
            <ScrollReveal>
              <h2 id="intel-heading" className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-heading mb-4">
                More than a directory. Real discovery.
              </h2>
              <p className="text-sm text-body mb-6 leading-relaxed">
                Every listing is reviewed before it goes live. Ranking reflects community upvotes 
                not who paid the most. Featured placement stays clearly marked.
              </p>
              <ul className="space-y-3 text-sm text-body mb-8">
                {[
                  'Human review before listings go public',
                  'Transparent upvote-based ranking',
                  'Category pages built for SEO & discovery',
                  'Embeddable “Featured on Pinstack” badge',
                ].map((line) => (
                  <li key={line} className="flex gap-2 items-start">
                    <span
                      className="text-primary font-bold mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="btn-smooth inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Learn how Pinstack works →
              </Link>
            </ScrollReveal>

            <ScrollReveal scale delay={0.08}>
              <div className="w-full min-w-0 max-w-full bg-white border border-borderC rounded-2xl p-4 sm:p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.3)]">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 sm:mb-4">
                  Snapshot
                </p>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-4 sm:mb-5 min-w-0">
                  {[
                    { k: 'Products', v: stats?.products ?? 0 },
                    { k: 'Founders', v: stats?.founders ?? 0 },
                    { k: 'Categories', v: stats?.categories ?? 0 },
                  ].map((s) => (
                    <div key={s.k} className="min-w-0 rounded-xl bg-bgAlt p-2 sm:p-3 text-center transition-transform duration-300 hover:-translate-y-0.5">
                      <div className="text-base sm:text-lg font-extrabold text-heading tabular-nums">{s.v}</div>
                      <div className="text-[9px] sm:text-[11px] text-muted leading-tight">{s.k}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 sm:space-y-3 min-w-0">
                  {previewProducts.length === 0 ? (
                    <p className="text-sm text-muted">Trending products will appear here once listed.</p>
                  ) : (
                    previewProducts.map((p) => (
                      <Link
                        key={p._id}
                        href={`/product/${p.slug}`}
                        className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-borderC hover:border-primary hover:bg-bgAlt/60 hover:shadow-sm transition-all duration-300 w-full min-w-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-heading truncate">{p.name}</p>
                          <p className="text-xs text-muted line-clamp-2 sm:line-clamp-1 sm:truncate">{p.tagline}</p>
                        </div>
                        <span className="text-xs font-bold text-success bg-successBg px-2 py-1 rounded-full shrink-0 tabular-nums">
                          {p.score}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Compare / social proof bar */}
        <ScrollReveal>
          <section className="bg-heading text-white py-8">
            <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-lg font-extrabold mb-1">Compare before you choose</p>
                <p className="text-sm text-slate-400">
                  Browse categories side by side and upvote what actually helps.
                </p>
              </div>
              <Link
                href="/categories"
                className="btn-smooth px-5 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover shrink-0 shadow-lg shadow-primary/30"
              >
                Browse categories →
              </Link>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <BadgeSection />
        </ScrollReveal>

        <ScrollReveal>
          <BlogTeaser />
        </ScrollReveal>

        {/* Final CTA */}
        <section className="py-16 bg-white" aria-labelledby="cta-heading">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
            <ScrollReveal scale>
              <h2 id="cta-heading" className="text-2xl md:text-[28px] font-extrabold text-heading mb-3">
                Built something worth sharing?
              </h2>
              <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                List it free. Upgrade later if you want featured placement.
              </p>
              <AddProductButton className="btn-smooth inline-flex items-center px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/25" />
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
