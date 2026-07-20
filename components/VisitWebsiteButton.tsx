'use client';

import { api } from '../lib/api';

interface Props {
  productId: string;
  websiteUrl: string;
  className?: string;
  children?: React.ReactNode;
}

export default function VisitWebsiteButton({
  productId,
  websiteUrl,
  className,
  children = 'Visit website →',
}: Props) {
  const handleClick = () => {
    api.trackClick(productId).catch(() => undefined);
  };

  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
