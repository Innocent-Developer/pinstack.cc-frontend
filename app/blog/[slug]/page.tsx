import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '../../../components/PageShell';
import {
  formatBlogDate,
  getAllBlogPosts,
  getBlogPost,
  getRelatedPosts,
} from '../../../lib/blog';
import { markdownToHtml } from '../../../lib/markdown';
import { buildArticleSchema, buildBreadcrumbSchema, pageMetadata } from '../../../lib/seo';
import { siteConfig } from '../../../config/site';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return pageMetadata({
    title: `${post.title} — Pinstack Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
    keywords: [...post.tags, 'Pinstack', 'SaaS directory', 'founder guide'],
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt || post.publishedAt,
    authors: ['Team Pinstack'],
    openGraphTitle: post.title,
    openGraphDescription: post.description,
  });
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const html = markdownToHtml(post.bodyMarkdown);
  const related = getRelatedPosts(post, 3);
  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    tags: post.tags,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    wordCount: post.wordCount,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageShell className="max-w-[760px] py-12 sm:py-16">
        <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-heading font-medium line-clamp-1">{post.title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-heading mb-3 leading-tight">{post.title}</h1>
          <p className="text-sm text-muted mb-4 leading-relaxed">{post.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>By Team Pinstack</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <>
                <span aria-hidden>·</span>
                <span>Updated {formatBlogDate(post.updatedAt)}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <article
          className="blog-prose border-t border-borderC pt-8"
          itemScope
          itemType="https://schema.org/Article"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <aside className="mt-10 p-5 rounded-2xl bg-bgAlt border border-borderC">
          <p className="text-sm font-bold text-heading mb-2">Keep exploring on {siteConfig.name}</p>
          <ul className="text-sm text-body space-y-1.5">
            <li>
              <Link href="/explore" className="text-primary font-semibold hover:underline">
                Browse all products →
              </Link>
            </li>
            <li>
              <Link href="/categories" className="text-primary font-semibold hover:underline">
                Explore categories →
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-primary font-semibold hover:underline">
                Free vs paid listing options →
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-primary font-semibold hover:underline">
                How Pinstack works →
              </Link>
            </li>
          </ul>
        </aside>

        {related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-borderC" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-extrabold text-heading mb-4">
              Related posts
            </h2>
            <div className="flex flex-col gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="block border border-borderC rounded-xl p-4 hover:border-primary/40 transition bg-white"
                >
                  <p className="text-[11px] font-semibold text-muted mb-1">
                    {formatBlogDate(r.publishedAt)} · {r.readingMinutes} min
                  </p>
                  <p className="text-[15px] font-extrabold text-heading mb-1">{r.title}</p>
                  <p className="text-sm text-muted line-clamp-2">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-borderC">
          <p className="text-sm text-body mb-4">
            Building something worth sharing? List it free on Pinstack — community ranking, not
            pay-to-win.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login?next=/dashboard/add-product"
              className="inline-flex px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
            >
              Add your product →
            </Link>
            <Link
              href="/blog"
              className="inline-flex px-4 py-2.5 rounded-btn text-sm font-semibold border border-borderC text-heading hover:border-primary"
            >
              More blog posts
            </Link>
          </div>
        </div>
      </PageShell>
    </>
  );
}
