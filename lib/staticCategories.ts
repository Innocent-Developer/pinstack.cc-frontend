/** Canonical category catalog (mirrors Backend STATIC_CATEGORIES). No API fetch required. */
export const STATIC_CATEGORIES = [
  { name: 'AI Tools', slug: 'ai-tools', icon: '🤖' },
  { name: 'SaaS', slug: 'saas', icon: '☁️' },
  { name: 'Developer Tools', slug: 'developer-tools', icon: '🛠️' },
  { name: 'APIs', slug: 'apis', icon: '🔌' },
  { name: 'Marketing', slug: 'marketing', icon: '📣' },
  { name: 'SEO', slug: 'seo', icon: '🔍' },
  { name: 'B2B', slug: 'b2b', icon: '🏢' },
  { name: 'Portfolio', slug: 'portfolio', icon: '🗂️' },
  { name: 'Design', slug: 'design', icon: '🎨' },
  { name: 'Productivity', slug: 'productivity', icon: '✅' },
  { name: 'Analytics', slug: 'analytics', icon: '📊' },
  { name: 'Finance', slug: 'finance', icon: '💳' },
  { name: 'Security', slug: 'security', icon: '🔒' },
  { name: 'Sales & CRM', slug: 'sales-crm', icon: '🤝' },
  { name: 'E-commerce', slug: 'ecommerce', icon: '🛒' },
  { name: 'Customer Support', slug: 'customer-support', icon: '💬' },
  { name: 'HR & Recruiting', slug: 'hr-recruiting', icon: '👥' },
  { name: 'No-Code', slug: 'no-code', icon: '🧩' },
  { name: 'Content & Writing', slug: 'content-writing', icon: '✍️' },
  { name: 'Education', slug: 'education', icon: '📚' },
  { name: 'Open Source', slug: 'open-source', icon: '🔓' },
  { name: 'Healthcare', slug: 'healthcare', icon: '🩺' },
] as const;

export type StaticCategory = (typeof STATIC_CATEGORIES)[number];

export function getStaticCategoryBySlug(slug: string): StaticCategory | undefined {
  return STATIC_CATEGORIES.find((c) => c.slug === slug);
}

/** Merge static catalog with optional slug→count map for UI cards. */
export function staticCategoriesWithCounts(
  counts: Record<string, number> = {}
): Array<StaticCategory & { productCount: number; _id: string }> {
  return STATIC_CATEGORIES.map((c) => ({
    ...c,
    _id: c.slug,
    productCount: counts[c.slug] ?? 0,
  }));
}
