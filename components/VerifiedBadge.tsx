interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

/** Green verified tick badge for listings and detail pages */
export default function VerifiedBadge({ className = '', size = 'sm' }: VerifiedBadgeProps) {
  const text = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold bg-successBg text-success ring-1 ring-inset ring-emerald-600/15 ${text} ${className}`}
      title="Verified on Pinstack"
    >
      <svg
        className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );
}
