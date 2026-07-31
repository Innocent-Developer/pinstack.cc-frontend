'use client';

import Link from 'next/link';

type Props = {
  status?: 'pending' | 'approved' | 'rejected';
  publishAt?: string | null;
  productName: string;
};

function formatWhen(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

export default function ProductListingStatusBanner({ status, publishAt, productName }: Props) {
  const when = formatWhen(publishAt);
  const isPending = status === 'pending';
  const isScheduled =
    status === 'approved' && publishAt && new Date(publishAt).getTime() > Date.now();

  if (!isPending && !isScheduled) return null;

  return (
    <div
      className={`border-b ${
        isPending
          ? 'bg-amber-50 border-amber-200'
          : 'bg-sky-50 border-sky-200'
      }`}
      role="status"
    >
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span
            className={`mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-bold ${
              isPending ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
            }`}
            aria-hidden
          >
            {isPending ? '⏳' : '📅'}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm font-extrabold tracking-tight ${
                isPending ? 'text-amber-950' : 'text-sky-950'
              }`}
            >
              {isPending
                ? `${productName} is pending review`
                : `${productName} is scheduled`}
            </p>
            <p className={`text-sm mt-0.5 leading-snug ${isPending ? 'text-amber-900/80' : 'text-sky-900/80'}`}>
              {isPending
                ? 'This listing is awaiting approval. It is not in Explore yet - votes, reviews, and ranking are paused until it goes live.'
                : when
                  ? `This listing goes live on ${when}. Until then it stays out of Explore and rankings.`
                  : 'This listing is scheduled and not live in Explore yet.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 sm:pl-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
              isPending
                ? 'bg-amber-200/70 text-amber-950'
                : 'bg-sky-200/70 text-sky-950'
            }`}
          >
            {isPending ? 'Pending' : 'Scheduled'}
          </span>
          <Link
            href="/explore"
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-white hover:bg-white/80 ${
              isPending ? 'border-amber-200 text-amber-950' : 'border-sky-200 text-sky-950'
            }`}
          >
            Browse live products →
          </Link>
        </div>
      </div>
    </div>
  );
}
