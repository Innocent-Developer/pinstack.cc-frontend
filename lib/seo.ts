import { siteConfig } from '../config/site';

export const defaultKeywords = [
  'SaaS directory',
  'AI tools directory',
  'startup directory',
  'developer tools',
  'submit your product',
  'product launch platform',
];

export const pricingFaqItems = [
  {
    q: 'Is the free listing really free forever?',
    a: 'Yes. A free Pinstack listing does not expire and has no hidden fees.',
  },
  {
    q: 'Does paying for a featured or verified badge improve my search ranking?',
    a: 'No. Featured placement gives temporary top position in your category page, but organic ranking is based only on community upvotes, not payment.',
  },
  {
    q: 'Can I cancel featured placement?',
    a: 'Featured placement runs for a fixed period (for example, 7 days) and does not auto-renew unless you choose to extend it.',
  },
  {
    q: 'How long does listing review take?',
    a: 'Free listings are typically reviewed within a few days. Featured listings get priority review within 24–48 hours.',
  },
  {
    q: 'Can I edit my listing after it\'s approved?',
    a: 'Yes, contact the team through the Contact page to request changes to a live listing.',
  },
] as const;

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logoPath}`,
    sameAs: Object.values(siteConfig.social).filter(Boolean),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteConfig.url,
    name: siteConfig.name,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/explore?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildFaqSchema(
  items: ReadonlyArray<{ q: string; a: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function buildBreadcrumbSchema(
  items: ReadonlyArray<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function buildProductSchema(product: {
  name: string;
  description?: string;
  tagline: string;
  websiteUrl: string;
  logoUrl: string;
  category?: { name?: string };
  categories?: Array<{ name?: string }>;
}) {
  const categories = product.categories?.map((c) => c.name).filter(Boolean);
  const applicationCategory =
    categories?.join(', ') || product.category?.name || undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description || product.tagline,
    url: product.websiteUrl,
    image: product.logoUrl,
    ...(applicationCategory ? { applicationCategory } : {}),
  };
}

export function pageMetadata({
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
}: {
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
}): import('next').Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: openGraphTitle || title,
      description: openGraphDescription || description,
      url,
    },
  };
}
