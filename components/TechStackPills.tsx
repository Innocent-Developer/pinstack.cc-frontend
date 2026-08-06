type Props = {
  items?: string[] | null;
  className?: string;
};

/** Soft blue tech / framework pills (listing display). */
export default function TechStackPills({ items, className = '' }: Props) {
  if (!items?.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-100"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
