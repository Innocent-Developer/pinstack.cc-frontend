'use client';

type Props = {
  value: number | null;
  size?: number;
};

/** Circular Domain Rating gauge (0–100). */
export default function DomainRatingGauge({ value, size = 88 }: Props) {
  const show = value != null && !Number.isNaN(value);
  const n = show ? Math.max(0, Math.min(100, value)) : 0;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (n / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {show ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#2563eb"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {show ? (
          <>
            <span className="text-2xl font-extrabold text-blue-600 tabular-nums leading-none">
              {n}
            </span>
            <span className="text-[10px] font-semibold text-muted mt-0.5">/ 100</span>
          </>
        ) : (
          <span className="text-lg font-extrabold text-muted">—</span>
        )}
      </div>
    </div>
  );
}
