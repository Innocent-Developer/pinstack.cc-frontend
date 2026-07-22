import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '../../../components/PageShell';
import { getAllBlogPosts, getBlogPost } from '../../../lib/blog';
import { markdownToHtml } from '../../../lib/markdown';
import { buildArticleSchema, buildBreadcrumbSchema, pageMetadata } from '../../../lib/seo';

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
  });
}

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const html = markdownToHtml(post.bodyMarkdown);
  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    tags: post.tags,
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
        <Link href="/blog" className="text-sm font-semibold text-primary hover:underline mb-6 inline-block">
          ← All posts
        </Link>
        <h1 className="text-3xl font-extrabold text-heading mb-3 leading-tight">{post.title}</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
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
        <article
          className="blog-prose border-t border-borderC pt-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-12 pt-8 border-t border-borderC">
          <p className="text-sm text-body mb-4">
            Building something worth sharing? List it free on Pinstack.
          </p>
          <Link
            href="/login?next=/dashboard/add-product"
            className="inline-flex px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            Add your product →
          </Link>
        </div>
      </PageShell>
    </>
  );
}
