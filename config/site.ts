/**
 * Central site config edit social links and brand assets once; used sitewide.
 */
export const siteConfig = {
  name: 'Pinstack',
  domain: 'pinstack.cc',
  url: 'https://pinstack.cc',
  tagline: 'Discover, launch, and grow.',
  description:
    'A free directory for SaaS products, AI tools, and developer APIs submitted by founders, ranked by the community.',
  email: 'team@pinstack.cc',

  /** Stacked-P mark used for logo, favicon, and all brand marks */
  logoPath: '/icon.png',
  iconPath: '/icon.png',
  appleIconPath: '/apple-icon.png',

  /** Update these URLs once they appear in the footer and elsewhere */
  social: {
    twitter: 'https://twitter.com/getpinstack/',
    linkedin: 'https://linkedin.com/company/pinstack',
    instagram: 'https://instagram.com/pinstack.cc',
  } as Record<string, string>,
};

export type SocialKey = keyof typeof siteConfig.social;

export const socialLinks = Object.entries(siteConfig.social).map(([key, href]) => ({
  key,
  href,
  label: key === 'twitter' ? 'X' : key.charAt(0).toUpperCase() + key.slice(1),
}));
