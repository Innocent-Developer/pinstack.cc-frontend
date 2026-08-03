import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import AccountVerifiedTick from '../../../components/AccountVerifiedTick';
import { api } from '../../../lib/api';
import { siteConfig } from '../../../config/site';
import type { Product, PublicMaker } from '../../../types';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

function formatJoined(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

async function loadMaker(slug: string) {
  try {
    return await api.getMaker(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await loadMaker(params.slug);
  if (!res?.data?.maker) {
    return { title: { absolute: 'Maker Not Found' } };
  }
  const maker = res.data.maker;
  const title = `${maker.name} — Maker on Pinstack`;
  const description =
    maker.bio?.slice(0, 155) ||
    `Products and profile for ${maker.name} on Pinstack.`;
  const path = `/makers/${maker.slug || params.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${siteConfig.url}${path}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}${path}`,
      type: 'profile',
      ...(maker.avatarUrl
        ? { images: [{ url: maker.avatarUrl, width: 400, height: 400, alt: maker.name }] }
        : {}),
    },
  };
}

export default async function MakerPublicPage({ params }: Props) {
  const res = await loadMaker(params.slug);
  if (!res?.data?.maker) notFound();

  const maker: PublicMaker = res.data.maker;
  const products: Product[] = res.data.products || [];
  const stats = res.data.stats;
  const joined = formatJoined(maker.joinedAt);
  const displaySlug = maker.slug || params.slug;

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f0f9ff_0%,#ffffff_320px)]">
        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-start">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white border border-borderC shadow-sm shrink-0">
              {maker.avatarUrl ? (
                <Image
                  src={maker.avatarUrl}
                  alt={`${maker.name} avatar`}
                  fill
                  className="object-cover"
                  sizes="112px"
                  unoptimized
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold text-primary bg-primary/5">
                  {maker.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary mb-1">Maker</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight inline-flex flex-wrap items-center gap-2">
                {maker.name}
                {maker.isAccountVerified ? <AccountVerifiedTick size={26} /> : null}
              </h1>
              {maker.companyName ? (
                <p className="text-sm text-muted mt-1">{maker.companyName}</p>
              ) : null}
              {maker.bio ? (
                <p className="text-body mt-3 max-w-2xl leading-relaxed">{maker.bio}</p>
              ) : (
                <p className="text-muted mt-3 text-sm">
                  Products listed by {maker.name} on Pinstack.
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-4 text-sm">
                {maker.country ? (
                  <span className="px-3 py-1 rounded-full bg-white border border-borderC text-heading">
                    {maker.country}
                  </span>
                ) : null}
                {joined ? (
                  <span className="px-3 py-1 rounded-full bg-white border border-borderC text-muted">
                    Joined {joined}
                  </span>
                ) : null}
                {maker.accountType === 'company' ? (
                  <span className="px-3 py-1 rounded-full bg-white border border-borderC text-muted">
                    Company
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                {maker.website ? (
                  <a
                    href={maker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-4 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
                  >
                    Website
                  </a>
                ) : null}
                {maker.linkedinUrl ? (
                  <a
                    href={maker.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-4 py-2 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
                  >
                    LinkedIn
                  </a>
                ) : null}
                {maker.twitterUrl ? (
                  <a
                    href={maker.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-4 py-2 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-white"
                  >
                    X / Twitter
                  </a>
                ) : null}
              </div>
            </div>

            <aside className="sm:w-44 shrink-0 grid grid-cols-3 sm:grid-cols-1 gap-2">
              {[
                { label: 'Listings', value: stats.listings },
                { label: 'Live', value: stats.live },
                {
                  label: 'Verified',
                  value: stats.verifiedMaker ? 'Yes' : '—',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-borderC bg-white px-3 py-3 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <p className="text-lg font-extrabold text-heading tabular-nums">{s.value}</p>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wide mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </aside>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-heading">Products</h2>
              <p className="text-sm text-muted">
                Live and upcoming listings from @{displaySlug}
              </p>
            </div>
            <Link href="/explore" className="text-sm font-semibold text-primary hover:underline">
              Explore all
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-borderC bg-white p-10 text-center">
              <p className="font-semibold text-heading">No public products yet</p>
              <p className="text-sm text-muted mt-1">Check back soon for new launches.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
