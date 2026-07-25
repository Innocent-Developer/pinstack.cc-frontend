/**
 * Central site config edit social links and brand assets once; used sitewide.
 */
export const siteConfig = {
  name: 'Pinstack',
  domain: 'pinstack.cc',
  /** Canonical public site URL (apex  www has no DNS record unless you add it) */
  url: 'https://pinstack.cc',
  /** Production API base */
  apiUrl: 'https://api.pinstack.cc/api',
  tagline: 'Discover, launch, and grow.',
  description:
    'Pinstack is a free directory where founders list SaaS products, AI tools, and developer APIs, and users discover and upvote them. Submit your product free.',
  /** Social share image  replace with /og-default.png (1200×630) before launch if available */
  ogImage: '/icon.png',
  email: 'hello@pinstack.cc',

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
