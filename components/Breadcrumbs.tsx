import Link from 'next/link';
import { buildBreadcrumbSchema } from '../lib/seo';

export interface Crumb {
  name: string;
  path: string;
}

/**
 * Visible breadcrumb trail + BreadcrumbList JSON-LD in one component.
 * Use at the top of every public page for consistent SEO.
 */
export default function Breadcrumbs({
  items,
  className = '',
}: {
  items: Crumb[];
  className?: string;
}) {
  if (!items.length) return null;
  const schema = buildBreadcrumbSchema(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`text-xs text-muted flex flex-wrap items-center gap-1.5 ${className}`}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={item.path} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <span aria-hidden>/</span>}
              {isLast ? (
                <span className="text-heading font-medium truncate" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="hover:text-primary">
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
