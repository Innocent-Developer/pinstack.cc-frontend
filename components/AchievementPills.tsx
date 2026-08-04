import type { Product } from '../types';

const TYPE_CLASS: Record<string, string> = {
  top_of_month: 'bg-amber-50 text-amber-900 border-amber-200',
  rising_star: 'bg-sky-50 text-sky-900 border-sky-200',
  editors_pick: 'bg-violet-50 text-violet-900 border-violet-200',
  launch_of_week: 'bg-emerald-50 text-emerald-900 border-emerald-200',
};

export function activeAchievements(product: Product) {
  return (product.achievements || []).filter((a) => a && a.active !== false);
}

export default function AchievementPills({
  product,
  className = '',
}: {
  product: Product;
  className?: string;
}) {
  const awards = activeAchievements(product);
  if (!awards.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {awards.map((a, i) => (
        <span
          key={a._id || `${a.type}-${i}`}
          className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
            TYPE_CLASS[a.type] || 'bg-bgAlt text-heading border-borderC'
          }`}
        >
          {a.label || a.type.replace(/_/g, ' ')}
        </span>
      ))}
    </div>
  );
}
