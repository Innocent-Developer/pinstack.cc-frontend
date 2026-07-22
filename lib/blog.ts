import fs from 'fs';
import path from 'path';

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string; // ISO date YYYY-MM-DD
  updatedAt?: string;
  relatedSlugs: string[];
};

export type BlogPost = BlogPostMeta & {
  bodyMarkdown: string;
  readingMinutes: number;
  wordCount: number;
};

/** Fallback enrichment when blogs.md omits optional fields */
const POST_DEFAULTS: Record<
  string,
  { publishedAt: string; updatedAt?: string; relatedSlugs: string[] }
> = {
  'free-api-testing-tools-2026': {
    publishedAt: '2026-07-15',
    updatedAt: '2026-07-22',
    relatedSlugs: ['free-vs-paid-api-monitoring-tools', 'how-to-get-your-saas-listed-on-directories'],
  },
  'how-to-get-your-saas-listed-on-directories': {
    publishedAt: '2026-07-16',
    updatedAt: '2026-07-22',
    relatedSlugs: ['saas-directory-vs-product-hunt', 'how-pinstack-ranking-works'],
  },
  'saas-directory-vs-product-hunt': {
    publishedAt: '2026-07-17',
    updatedAt: '2026-07-22',
    relatedSlugs: ['how-to-get-your-saas-listed-on-directories', 'how-pinstack-ranking-works'],
  },
  'how-pinstack-ranking-works': {
    publishedAt: '2026-07-18',
    updatedAt: '2026-07-22',
    relatedSlugs: ['saas-directory-vs-product-hunt', 'how-to-get-your-saas-listed-on-directories'],
  },
  'free-vs-paid-api-monitoring-tools': {
    publishedAt: '2026-07-19',
    updatedAt: '2026-07-22',
    relatedSlugs: ['free-api-testing-tools-2026', 'how-to-get-your-saas-listed-on-directories'],
  },
};

function blogsFilePath(): string {
  return path.join(process.cwd(), 'blogs.md');
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

function parseListField(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((t) => t.trim().replace(/^`|`$/g, ''))
    .filter(Boolean);
}

function parsePostBlock(block: string): BlogPost | null {
  const slug = block.match(/\*\*Slug:\*\*\s*`([^`]+)`/i)?.[1]?.trim();
  const title = block.match(/\*\*Title:\*\*\s*(.+)/i)?.[1]?.trim();
  const description = block.match(/\*\*Meta description:\*\*\s*(.+)/i)?.[1]?.trim();
  const tags = parseListField(block.match(/\*\*Tags:\*\*\s*(.+)/i)?.[1]);
  const publishedAtMeta = block.match(/\*\*Date:\*\*\s*`?([0-9]{4}-[0-9]{2}-[0-9]{2})`?/i)?.[1];
  const updatedAtMeta = block.match(/\*\*Updated:\*\*\s*`?([0-9]{4}-[0-9]{2}-[0-9]{2})`?/i)?.[1];
  const relatedFromMd = parseListField(block.match(/\*\*Related:\*\*\s*(.+)/i)?.[1]);

  const parts = block.split(/\n---\n/);
  if (parts.length < 2 || !slug || !title || !description) return null;

  let body = parts.slice(1).join('\n---\n').trim();
  body = body.replace(/^---+\s*/g, '').replace(/\s*---+\s*$/g, '').trim();

  const headingIdx = body.search(/^##\s+/m);
  if (headingIdx > 0) body = body.slice(headingIdx).trim();
  body = body.replace(new RegExp(`^##\\s+${escapeRegExp(title)}\\s*\\n+`, 'i'), '');

  const defaults = POST_DEFAULTS[slug];
  const publishedAt = publishedAtMeta || defaults?.publishedAt || '2026-07-15';
  const updatedAt = updatedAtMeta || defaults?.updatedAt;
  const relatedSlugs =
    relatedFromMd.length > 0 ? relatedFromMd : defaults?.relatedSlugs || [];

  const words = wordCount(body);

  return {
    slug,
    title,
    description,
    tags,
    publishedAt,
    updatedAt,
    relatedSlugs,
    bodyMarkdown: body,
    wordCount: words,
    readingMinutes: readingMinutes(words),
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getAllBlogPosts(): BlogPost[] {
  const raw = fs.readFileSync(blogsFilePath(), 'utf8').replace(/\r\n/g, '\n');
  const chunks = raw.split(/^# POST \d+\s*$/m).slice(1);
  const posts: BlogPost[] = [];
  for (const chunk of chunks) {
    const post = parsePostBlock(chunk);
    if (post) posts.push(post);
  }
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const all = getAllBlogPosts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const related: BlogPost[] = [];

  for (const slug of post.relatedSlugs) {
    const hit = bySlug.get(slug);
    if (hit && hit.slug !== post.slug) related.push(hit);
  }

  if (related.length < limit) {
    for (const other of all) {
      if (other.slug === post.slug) continue;
      if (related.some((r) => r.slug === other.slug)) continue;
      const shareTag = other.tags.some((t) => post.tags.includes(t));
      if (shareTag) related.push(other);
      if (related.length >= limit) break;
    }
  }

  if (related.length < limit) {
    for (const other of all) {
      if (other.slug === post.slug) continue;
      if (related.some((r) => r.slug === other.slug)) continue;
      related.push(other);
      if (related.length >= limit) break;
    }
  }

  return related.slice(0, limit);
}

export function formatBlogDate(iso: string): string {
  try {
    return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Featured posts for homepage / about teasers */
export function getFeaturedBlogPosts(limit = 3): BlogPost[] {
  return getAllBlogPosts().slice(0, limit);
}
