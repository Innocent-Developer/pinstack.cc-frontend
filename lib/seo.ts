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
    a: 'Yes. A free Pinstack listing does not expire and has no hidden fees. It is always free.',
  },
  {
    q: 'Does paying for Featured, Verified, or Growth improve my search ranking?',
    a: 'No. Featured placement gives temporary top position in your category page while active, but organic ranking is based only on community upvotes, not payment. Verified badges also do not affect ranking.',
  },
  {
    q: 'What is the difference between Verified and Featured?',
    a: 'Verified is a $9 one-time purchase for a verified badge and an embeddable badge for your site. Featured is $5/month for top placement in your category during the active period.',
  },
  {
    q: 'What does Growth include?',
    a: 'Growth is $20/month and bundles Featured + Verified. At signup, our team also does a one-time review and optimization of your listing copy  a fixed deliverable, not ongoing strategy work.',
  },
  {
    q: 'Can I cancel Featured or Growth?',
    a: 'Yes. Featured and Growth stay active for the paid period. They do not auto-renew unless you choose to continue. Cancel anytime via the Contact page.',
  },
  {
    q: 'How long does listing review take?',
    a: 'Free listings are typically reviewed within a few days. Paid Featured and Growth plans get priority review within 24–48 hours.',
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

export function buildArticleSchema(post: {
  title: string;
  description: string;
  path: string;
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
  wordCount?: number;
}) {
  const url = `${siteConfig.url}${post.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    ...(post.wordCount ? { wordCount: post.wordCount } : {}),
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: 'Team Pinstack',
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logoPath}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: [`${siteConfig.url}${siteConfig.ogImage}`],
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
  };
}

export function buildBlogListSchema(
  posts: ReadonlyArray<{ title: string; description: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Pinstack Blog',
    description:
      'Practical guides for founders on SaaS directories, launch strategy, and developer tools.',
    url: `${siteConfig.url}/blog`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      url: `${siteConfig.url}${p.path}`,
    })),
  };
}

export function pageMetadata({
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: {
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}): import('next').Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogTitle = openGraphTitle || title;
  const ogDescription = openGraphDescription || description;
  return {
    title: { absolute: title },
    description,
    ...(keywords?.length ? { keywords } : {}),
    authors: authors?.map((name) => ({ name })) || [{ name: 'Team Pinstack' }],
    alternates: { canonical: url },
    openGraph: {
      type,
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: siteConfig.name,
      locale: 'en_US',
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime: modifiedTime || publishedTime,
            authors: authors || ['Team Pinstack'],
            tags: keywords,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [siteConfig.ogImage],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}
