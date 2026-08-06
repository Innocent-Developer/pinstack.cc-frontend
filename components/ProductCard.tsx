'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { productCategories } from '../lib/categories';
import { isProductLive, listingStatusLabel } from '../lib/listingStatus';
import VerifiedBadge from './VerifiedBadge';
import AccountVerifiedTick from './AccountVerifiedTick';
import ProductVoteButtons from './ProductVoteButtons';
import AchievementPills from './AchievementPills';
import VoteStarRating from './VoteStarRating';
import TechStackPills from './TechStackPills';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const live = isProductLive(product);
  const statusLabel = listingStatusLabel(product);

  return (
    <article className="lift-card border border-borderC rounded-card p-[18px] bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="relative w-[42px] h-[42px] rounded-[9px] overflow-hidden bg-bgAlt shrink-0">
          <Image
            src={product.logoUrl}
            alt={`${product.name} logo`}
            fill
            className="object-cover"
            sizes="42px"
          />
          {product.isVerified && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success text-white flex items-center justify-center ring-2 ring-white"
              title="Verified"
              aria-hidden
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>

        {live ? (
          <ProductVoteButtons
            productId={product._id}
            productName={product.name}
            initialScore={product.score}
            initialUpvotes={product.upvoteCount}
            initialDownvotes={product.downvoteCount}
          />
        ) : (
          <div className="text-right">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-900 border border-amber-200">
              {statusLabel || 'Pending'}
            </span>
            <p className="text-[10px] text-muted mt-1">Votes paused</p>
          </div>
        )}
      </div>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-[15px] font-bold text-heading">{product.name}</h3>
          {product.isVerified && <VerifiedBadge />}
          {product.submitterAccountVerified && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
              title="Verified maker account"
            >
              <AccountVerifiedTick size={12} />
              Maker
            </span>
          )}
        </div>
        <p className="text-[13px] text-muted mb-2 line-clamp-2">{product.tagline}</p>
      </Link>

      <VoteStarRating
        upvoteCount={product.upvoteCount}
        downvoteCount={product.downvoteCount}
        size="sm"
        className="mb-2"
      />

      <AchievementPills product={product} className="mb-2" />
      <TechStackPills items={product.techStack} className="mb-3" />

      <div className="flex gap-1.5 flex-wrap items-center">
        {statusLabel && (
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
              statusLabel === 'Pending'
                ? 'bg-amber-50 text-amber-900'
                : 'bg-sky-50 text-sky-900'
            }`}
          >
            {statusLabel}
          </span>
        )}
        {product.isFeatured && (
          <span className="text-[11px] bg-amber-50 text-featured px-2.5 py-0.5 rounded-full font-bold">
            Featured
          </span>
        )}
        {productCategories(product).map((cat) => (
          <span key={cat._id} className="text-[11px] bg-bgAlt text-body px-2.5 py-0.5 rounded-full">
            {cat.name}
          </span>
        ))}
        {product.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[11px] bg-bgAlt text-muted px-2.5 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
