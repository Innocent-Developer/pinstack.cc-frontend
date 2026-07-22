import fs from 'fs';
import path from 'path';

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

export type BlogPost = BlogPostMeta & {
  bodyMarkdown: string;
};

function blogsFilePath(): string {
  return path.join(process.cwd(), 'blogs.md');
}

function parsePostBlock(block: string): BlogPost | null {
  const slug = block.match(/\*\*Slug:\*\*\s*`([^`]+)`/i)?.[1]?.trim();
  const title = block.match(/\*\*Title:\*\*\s*(.+)/i)?.[1]?.trim();
  const description = block.match(/\*\*Meta description:\*\*\s*(.+)/i)?.[1]?.trim();
  const tagsRaw = block.match(/\*\*Tags:\*\*\s*(.+)/i)?.[1]?.trim() || '';
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Body starts after the first standalone --- following the meta block
  const parts = block.split(/\n---\n/);
  if (parts.length < 2 || !slug || !title || !description) return null;

  // Drop trailing separator lines like --- and empty chunks
  let body = parts.slice(1).join('\n---\n').trim();
  body = body.replace(/^---+\s*/g, '').replace(/\s*---+\s*$/g, '').trim();

  // Prefer content starting at the first ## heading if present
  const headingIdx = body.search(/^##\s+/m);
  if (headingIdx > 0) body = body.slice(headingIdx).trim();

  // Drop leading ## title when it duplicates the post title (page renders H1)
  body = body.replace(new RegExp(`^##\\s+${escapeRegExp(title)}\\s*\\n+`, 'i'), '');

  return {
    slug,
    title,
    description,
    tags,
    bodyMarkdown: body,
  };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Parse all posts from frontend/blogs.md (source of truth). */
export function getAllBlogPosts(): BlogPost[] {
  const raw = fs.readFileSync(blogsFilePath(), 'utf8');
  const chunks = raw.split(/^# POST \d+\s*$/m).slice(1);
  const posts: BlogPost[] = [];
  for (const chunk of chunks) {
    const post = parsePostBlock(chunk);
    if (post) posts.push(post);
  }
  return posts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getAllBlogPosts().find((p) => p.slug === slug);
}

export function getBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}
