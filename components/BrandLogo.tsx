import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '../config/site';

interface BrandLogoProps {
  href?: string;
  className?: string;
  /** 'full' = wordmark logo; 'icon' = app mark only; 'lockup' = icon + text */
  variant?: 'full' | 'icon' | 'lockup';
  priority?: boolean;
  size?: number;
  /** Use on dark backgrounds */
  inverted?: boolean;
}

export default function BrandLogo({
  href = '/',
  className = '',
  variant = 'full',
  priority = false,
  size = 36,
  inverted = false,
}: BrandLogoProps) {
  // Single mark for all variants (icon / lockup / full)
  const mark = (
    <Image
      src={siteConfig.iconPath}
      alt={variant === 'icon' ? `${siteConfig.name} icon` : `${siteConfig.name} logo`}
      width={size}
      height={size}
      className="object-contain rounded-[22%]"
      priority={priority}
    />
  );

  const content =
    variant === 'icon' ? (
      mark
    ) : (
      <span className="inline-flex items-center gap-2">
        {mark}
        <span
          className={`font-extrabold text-lg tracking-tight ${
            inverted ? 'text-white' : 'text-heading'
          }`}
        >
          pinstack<span className={inverted ? 'text-emerald-300' : 'text-primary'}>.cc</span>
        </span>
      </span>
    );

  if (!href) {
    return <span className={`inline-flex items-center shrink-0 ${className}`}>{content}</span>;
  }

  return (
    <Link href={href} className={`inline-flex items-center shrink-0 ${className}`} aria-label={siteConfig.name}>
      {content}
    </Link>
  );
}
