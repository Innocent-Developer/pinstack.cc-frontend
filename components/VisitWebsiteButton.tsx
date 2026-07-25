'use client';

import { api } from '../lib/api';
import { visitWebsiteUrl } from '../lib/utm';

interface Props {
  productId: string;
  websiteUrl: string;
  /** Product slug  used as utm_content for attribution */
  slug?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function VisitWebsiteButton({
  productId,
  websiteUrl,
  slug,
  className,
  children = 'Visit website →',
}: Props) {
  const href = visitWebsiteUrl(websiteUrl, slug);

  const handleClick = () => {
    api.trackClick(productId).catch(() => undefined);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
