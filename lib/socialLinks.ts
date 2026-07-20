export const SOCIAL_PLATFORMS = [
  'twitter',
  'linkedin',
  'github',
  'discord',
  'youtube',
  'instagram',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type ProductSocialLinks = Partial<Record<SocialPlatform, string>>;

export const EMPTY_SOCIAL_LINKS: Record<SocialPlatform, string> = {
  twitter: '',
  linkedin: '',
  github: '',
  discord: '',
  youtube: '',
  instagram: '',
};

export const SOCIAL_PLATFORM_META: Record<
  SocialPlatform,
  { label: string; placeholder: string; brandColor: string }
> = {
  twitter: {
    label: 'X (Twitter)',
    placeholder: 'https://x.com/yourproduct or @handle',
    brandColor: '#0F172A',
  },
  linkedin: {
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/yourproduct',
    brandColor: '#0A66C2',
  },
  github: {
    label: 'GitHub',
    placeholder: 'https://github.com/yourorg',
    brandColor: '#181717',
  },
  discord: {
    label: 'Discord',
    placeholder: 'https://discord.gg/invite or invite code',
    brandColor: '#5865F2',
  },
  youtube: {
    label: 'YouTube',
    placeholder: 'https://youtube.com/@channel',
    brandColor: '#FF0000',
  },
  instagram: {
    label: 'Instagram',
    placeholder: 'https://instagram.com/yourproduct',
    brandColor: '#E4405F',
  },
};

const ensureHttps = (url: string): string => {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

const normalizeOne = (platform: SocialPlatform, raw: string): string | null => {
  let value = raw.trim();
  if (!value) return null;

  if (platform === 'twitter') {
    if (value.startsWith('@')) value = value.slice(1);
    if (!value.includes('.') && !value.includes('/')) {
      return `https://x.com/${encodeURIComponent(value)}`;
    }
  }

  if (platform === 'github') {
    if (value.startsWith('@')) value = value.slice(1);
    if (!value.includes('github.com') && !value.includes('/')) {
      return `https://github.com/${encodeURIComponent(value)}`;
    }
  }

  if (platform === 'linkedin') {
    if (!value.includes('linkedin.com')) {
      const slug = value.replace(/^@/, '');
      if (slug.includes('/')) return ensureHttps(`linkedin.com/${slug}`);
      return `https://www.linkedin.com/company/${encodeURIComponent(slug)}`;
    }
  }

  if (platform === 'discord') {
    if (!value.includes('discord.')) {
      const invite = value.replace(/^@/, '');
      return `https://discord.gg/${encodeURIComponent(invite)}`;
    }
  }

  if (platform === 'youtube') {
    if (value.startsWith('@')) {
      return `https://www.youtube.com/${encodeURIComponent(value)}`;
    }
    if (!value.includes('youtube.com') && !value.includes('youtu.be')) {
      return `https://www.youtube.com/@${encodeURIComponent(value)}`;
    }
  }

  if (platform === 'instagram') {
    if (value.startsWith('@')) value = value.slice(1);
    if (!value.includes('instagram.com')) {
      return `https://www.instagram.com/${encodeURIComponent(value)}`;
    }
  }

  try {
    const url = new URL(ensureHttps(value));
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
};

export const normalizeSocialLinks = (input: ProductSocialLinks | undefined | null): ProductSocialLinks => {
  if (!input) return {};
  const out: ProductSocialLinks = {};
  for (const platform of SOCIAL_PLATFORMS) {
    const raw = input[platform];
    if (!raw?.trim()) continue;
    const normalized = normalizeOne(platform, raw);
    if (normalized) out[platform] = normalized;
  }
  return out;
};

export const socialLinksFromForm = (
  form: Record<SocialPlatform, string>
): ProductSocialLinks => normalizeSocialLinks(form);

export const socialLinksToForm = (links?: ProductSocialLinks | null): Record<SocialPlatform, string> => ({
  ...EMPTY_SOCIAL_LINKS,
  ...links,
});

export const hasSocialLinks = (links?: ProductSocialLinks | null): boolean =>
  SOCIAL_PLATFORMS.some((p) => Boolean(links?.[p]?.trim()));

export const activeSocialLinks = (links?: ProductSocialLinks | null) =>
  SOCIAL_PLATFORMS.filter((p) => Boolean(links?.[p]?.trim())).map((platform) => ({
    platform,
    url: links![platform]!,
    ...SOCIAL_PLATFORM_META[platform],
  }));
