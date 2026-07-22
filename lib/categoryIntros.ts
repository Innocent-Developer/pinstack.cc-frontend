/** Short unique intros for category pages (SEO / thin-content fix). */
export const categoryIntros: Record<string, string> = {
  'ai-tools':
    'AI tools on Pinstack cover assistants, model APIs, and automation products founders actually use. Browse community-ranked listings and submit your own when you are ready.',
  apis:
    'API products here include developer platforms, testing suites, and integration services. Compare what each offers, then upvote tools that prove useful in real work.',
  analytics:
    'Analytics tools help teams understand product usage, funnels, and performance. This category collects SaaS and developer-facing options ranked by community upvotes.',
  design:
    'Design tools for product teams — UI kits, prototyping, and creative workflows. Listings grow as founders submit; upvote what you would recommend to a peer.',
  'developer-tools':
    'Developer tools on Pinstack range from local utilities to cloud platforms. Rankings reflect community upvotes so useful tools surface without pay-to-win placement.',
  finance:
    'Finance tools for founders and operators — billing, accounting, and money workflows. Browse current listings or submit a product for review.',
  marketing:
    'Marketing tools for acquisition, email, and growth experiments. Discover community-ranked options and share tools that helped your own launch.',
  productivity:
    'Productivity software for founders and small teams — focus, collaboration, and workflow. Rankings update from real upvotes, not paid slots.',
  security:
    'Security tools for apps and teams — auth, privacy, and protection utilities. Explore what is listed today and add a product if you build in this space.',
  saas:
    'SaaS products across niches, ranked by community upvotes rather than ad spend. Use this page to discover tools or list your own for free review.',
};

export function categoryIntro(slug: string, name: string): string {
  return (
    categoryIntros[slug] ||
    `${name} tools and products on Pinstack, ranked by community upvotes. Listings are reviewed before going live, and paid placement is always labeled separately from organic rank.`
  );
}
