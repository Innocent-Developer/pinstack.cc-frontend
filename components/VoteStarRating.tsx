'use client';

import { voteStarRating, formatStarRating } from '../lib/voteStars';

type Props = {
  upvoteCount?: number;
  downvoteCount?: number;
  size?: 'sm' | 'md';
  className?: string;
  /** Show "No votes yet" when empty */
  showEmpty?: boolean;
};

function Star({ filled, half, sizePx }: { filled: boolean; half?: boolean; sizePx: number }) {
  if (half) {
    return (
      <span className="relative inline-block" style={{ width: sizePx, height: sizePx }}>
        <svg
          className="absolute inset-0 text-slate-200"
          width={sizePx}
          height={sizePx}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg
          className="absolute inset-0 text-amber-400 overflow-hidden"
          width={sizePx}
          height={sizePx}
          viewBox="0 0 20 20"
          fill="currentColor"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </span>
    );
  }

  return (
    <svg
      className={filled ? 'text-amber-400' : 'text-slate-200'}
      width={sizePx}
      height={sizePx}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

/** Community star rating derived from upvotes vs downvotes (not review stars). */
export default function VoteStarRating({
  upvoteCount = 0,
  downvoteCount = 0,
  size = 'md',
  className = '',
  showEmpty = false,
}: Props) {
  const { rating, votes } = voteStarRating(upvoteCount, downvoteCount);
  const sizePx = size === 'sm' ? 14 : 18;

  if (rating == null) {
    if (!showEmpty) return null;
    return (
      <div className={`inline-flex items-center gap-1.5 text-muted ${className}`}>
        <div className="flex items-center gap-0.5" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={false} sizePx={sizePx} />
          ))}
        </div>
        <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>No votes yet</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={`${formatStarRating(rating)} from ${votes} vote${votes === 1 ? '' : 's'} (${upvoteCount} up / ${downvoteCount} down)`}
    >
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          const filled = rating >= n;
          const half = !filled && rating >= n - 0.5;
          return <Star key={i} filled={filled} half={half} sizePx={sizePx} />;
        })}
      </div>
      <span
        className={`font-semibold text-heading tabular-nums ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        {formatStarRating(rating)}
      </span>
      <span className={`text-muted ${size === 'sm' ? 'text-[11px]' : 'text-xs'}`}>
        ({votes} vote{votes === 1 ? '' : 's'})
      </span>
    </div>
  );
}
