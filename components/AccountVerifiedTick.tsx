/** Green account-verified tick (distinct from product listing verified badge). */
export default function AccountVerifiedTick({
  size = 16,
  className = '',
  title = 'Verified account',
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      title={title}
      aria-label={title}
    >
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="10" fill="#059669" />
        <path
          d="M5.8 10.2l2.4 2.4 5.8-5.8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
