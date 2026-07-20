import type { ProductSocialLinks as Links } from '../lib/socialLinks';
import { activeSocialLinks, hasSocialLinks } from '../lib/socialLinks';
import SocialPlatformIcon from './SocialPlatformIcon';

interface Props {
  links?: Links | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: { btn: 'w-8 h-8', icon: 'w-3.5 h-3.5' },
  md: { btn: 'w-10 h-10', icon: 'w-4 h-4' },
  lg: { btn: 'w-11 h-11', icon: 'w-[18px] h-[18px]' },
};

export default function ProductSocialLinks({
  links,
  size = 'md',
  className = '',
  label = 'Social',
}: Props) {
  if (!hasSocialLinks(links)) return null;

  const s = sizeMap[size];
  const items = activeSocialLinks(links);

  return (
    <div className={className}>
      {label ? (
        <p className="text-xs font-bold text-muted uppercase tracking-wide mb-2.5">{label}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {items.map(({ platform, url, label: platformLabel, brandColor }) => (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={platformLabel}
            aria-label={`${platformLabel} (opens in new tab)`}
            className={`${s.btn} inline-flex items-center justify-center rounded-xl border border-borderC bg-white text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
            style={{ backgroundColor: brandColor }}
          >
            <SocialPlatformIcon platform={platform} className={s.icon} />
          </a>
        ))}
      </div>
    </div>
  );
}
