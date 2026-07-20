'use client';

import type { SocialPlatform } from '../lib/socialLinks';
import { SOCIAL_PLATFORMS, SOCIAL_PLATFORM_META } from '../lib/socialLinks';
import SocialPlatformIcon from './SocialPlatformIcon';

interface Props {
  values: Record<SocialPlatform, string>;
  onChange: (platform: SocialPlatform, value: string) => void;
}

export default function SocialLinkFields({ values, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-heading">Social links</p>
        <p className="text-[11px] text-muted mt-0.5">
          Optional. Paste a full URL or @handle  shown as icons on your listing page.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SOCIAL_PLATFORMS.map((platform) => {
          const meta = SOCIAL_PLATFORM_META[platform];
          return (
            <label key={platform} className="block min-w-0">
              <span className="flex items-center gap-2 text-xs font-semibold text-heading mb-1.5">
                <span
                  className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: meta.brandColor }}
                >
                  <SocialPlatformIcon platform={platform} className="w-3.5 h-3.5" />
                </span>
                {meta.label}
              </span>
              <input
                type="text"
                value={values[platform]}
                onChange={(e) => onChange(platform, e.target.value)}
                placeholder={meta.placeholder}
                className="w-full min-w-0 px-3 py-2.5 border border-borderC rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
                autoComplete="off"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
