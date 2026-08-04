import Image from 'next/image';
import Link from 'next/link';
import AccountVerifiedTick from '../AccountVerifiedTick';
import ProductSocialLinks from '../ProductSocialLinks';
import ProductVoteButtons from '../ProductVoteButtons';
import DomainRatingGauge from './DomainRatingGauge';
import GetInTouchForm from './GetInTouchForm';
import { hasSocialLinks } from '../../lib/socialLinks';
import type {
  Product,
  ProductDomainRatingInfo,
  ProductPageSnapshot,
  PublicMaker,
} from '../../types';

function formatRelativeAgo(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return null;
    const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
    if (days < 1) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } catch {
    return null;
  }
}

type Props = {
  product: Product;
  maker: PublicMaker | null;
  live: boolean;
  snapshot?: ProductPageSnapshot | null;
  domainRating?: ProductDomainRatingInfo | null;
};

export default function ProductSidebar({
  product,
  maker,
  live,
  snapshot,
  domainRating,
}: Props) {
  const upvotes = snapshot?.upvotes ?? product.upvoteCount ?? 0;
  const categoryRank = snapshot?.categoryRank;
  const categoryName = snapshot?.categoryName || product.category?.name || null;
  const categorySlug = snapshot?.categorySlug || product.category?.slug || null;
  const domain =
    snapshot?.domain ||
    product.domainHost ||
    (() => {
      try {
        return new URL(
          product.websiteUrl.includes('://')
            ? product.websiteUrl
            : `https://${product.websiteUrl}`
        ).hostname.replace(/^www\./, '');
      } catch {
        return null;
      }
    })();
  const ago = formatRelativeAgo(snapshot?.listedAt || product.createdAt);
  const drValue = domainRating?.value ?? product.domainRating ?? null;
  const trend = domainRating?.trend ?? null;
  const checkerUrl =
    domainRating?.checkerUrl ||
    (domain
      ? `https://ahrefs.com/website-authority-checker?input=${encodeURIComponent(domain)}`
      : null);

  const card =
    'rounded-2xl border border-borderC bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]';

  return (
    <aside className="space-y-4">
      {/* Snapshot */}
      <div className={card}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Snapshot</p>
          {ago ? (
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              {ago}
            </span>
          ) : null}
        </div>

        {live ? (
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
        ) : (
          <div className="mb-4 pb-4 border-b border-borderC text-center">
            <p className="text-sm font-semibold text-heading">Voting paused</p>
            <p className="text-xs text-muted mt-1">Opens when this listing goes live.</p>
          </div>
        )}

        <div className="grid grid-cols-2 divide-x divide-borderC mb-4">
          <div className="pr-3 text-center">
            <p className="text-emerald-600 text-xs mb-0.5" aria-hidden>
              ▲
            </p>
            <p className="text-2xl font-extrabold text-heading tabular-nums">{upvotes}</p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Upvotes</p>
          </div>
          <div className="pl-3 text-center">
            <p className="text-amber-500 text-xs mb-0.5" aria-hidden>
              ◎
            </p>
            <p className="text-2xl font-extrabold text-heading tabular-nums">
              {categoryRank != null ? `#${categoryRank}` : '—'}
            </p>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Cat. rank</p>
          </div>
        </div>

        {categoryName ? (
          <div className="flex items-center gap-3 py-2.5 border-t border-borderC">
            <span className="text-amber-500 text-sm" aria-hidden>
              ▦
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Category</p>
              {categorySlug ? (
                <Link
                  href={`/category/${categorySlug}`}
                  className="text-sm font-bold text-heading hover:text-primary truncate block"
                >
                  {categoryName}
                </Link>
              ) : (
                <p className="text-sm font-bold text-heading truncate">{categoryName}</p>
              )}
            </div>
            {categorySlug ? (
              <Link href={`/category/${categorySlug}`} className="text-muted text-sm" aria-hidden>
                ›
              </Link>
            ) : null}
          </div>
        ) : null}

        {domain ? (
          <div className="flex items-center gap-3 py-2.5 border-t border-borderC">
            <span className="text-muted text-sm" aria-hidden>
              ◎
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wide">Domain</p>
              <a
                href={product.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-heading font-mono truncate block hover:text-primary"
              >
                {domain}
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* Get in Touch */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">Get in touch</p>
          <span className="text-amber-500 text-sm" aria-hidden>
            ✎
          </span>
        </div>
        <GetInTouchForm productId={product._id} productName={product.name} />
      </div>

      {/* Domain Rating */}
      <div className={card}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">Domain rating</p>
            <span className="text-amber-500 text-sm" aria-hidden>
              ✓
            </span>
          </div>
          {checkerUrl ? (
            <a
              href={checkerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Ahrefs
              <span aria-hidden>↗</span>
            </a>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <DomainRatingGauge value={drValue} />
          <div className="min-w-0">
            {trend === 'rising' ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Rising
              </span>
            ) : drValue != null ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                Live DR
              </span>
            ) : (
              <span className="text-xs text-muted">DR unavailable</span>
            )}
            {checkerUrl ? (
              <a
                href={checkerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-sm font-semibold text-blue-600 hover:underline"
              >
                View on Ahrefs →
              </a>
            ) : null}
          </div>
        </div>

        <p className="text-[10px] text-muted mt-4">
          <a
            href={domainRating?.attributionUrl || 'https://ahrefs.com/'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {domainRating?.attribution || 'Domain Rating by Ahrefs'}
          </a>
        </p>
      </div>

      {/* Follow */}
      {hasSocialLinks(product.socialLinks) ? (
        <div className={card}>
          <ProductSocialLinks links={product.socialLinks} size="md" label="Follow" />
        </div>
      ) : null}

      {/* Maker */}
      {maker?.name ? (
        <div className={card}>
          <p className="text-xs font-bold text-muted uppercase tracking-wide mb-3">Maker</p>
          {maker.slug ? (
            <Link href={`/makers/${maker.slug}`} className="flex items-center gap-3 group">
              <span className="relative w-11 h-11 rounded-xl overflow-hidden bg-bgAlt border border-borderC shrink-0">
                {maker.avatarUrl ? (
                  <Image
                    src={maker.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="44px"
                    unoptimized
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-muted">
                    {maker.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="font-bold text-heading group-hover:text-primary inline-flex items-center gap-1.5">
                  {maker.name}
                  {maker.isAccountVerified ? <AccountVerifiedTick size={14} /> : null}
                </span>
                <span className="block text-xs text-muted truncate">View profile →</span>
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-bgAlt border border-borderC flex items-center justify-center text-sm font-extrabold text-muted">
                {maker.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-bold text-heading inline-flex items-center gap-1.5">
                {maker.name}
                {maker.isAccountVerified ? <AccountVerifiedTick size={14} /> : null}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}
