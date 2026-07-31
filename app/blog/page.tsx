import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { formatBlogDate, getAllBlogPosts } from '../../lib/blog';
import { buildBlogListSchema, pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pinstack Blog — SaaS Directories, Launch Strategy & Developer Tools',
  description:
    'Practical founder guides: free API testing tools, how to list your SaaS on directories, Product Hunt vs directories, how Pinstack ranking works, and free vs paid API monitoring.',
  path: '/blog',
  keywords: [
    'SaaS directory',
    'startup directories',
    'API testing tools',
    'Product Hunt vs directory',
    'Pinstack blog',
    'founder launch strategy',
  ],
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();
  const listSchema = buildBlogListSchema(
    posts.map((p) => ({
      title: p.title,
      description: p.description,
      path: `/blog/${p.slug}`,
    }))
  );
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
      <PageShell className="max-w-[760px] py-12 sm:py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]}
          className="mb-6"
        />
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Blog</p>
          <h1 className="text-3xl font-extrabold text-heading mb-3">
            Guides for founders & builders
          </h1>
          <p className="text-body mb-4 leading-relaxed">
            Plain, practical posts on directories, launch strategy, and developer tools  written to
            be useful for search and for people deciding where to list or which tool to try.
          </p>
          <p className="text-sm text-muted mb-10">
            {posts.length} posts · Updated regularly · Free to read
          </p>
        </ScrollReveal>

        <ScrollReveal className="flex flex-col gap-4">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block border border-borderC rounded-2xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition"
              >
                <p className="text-[11px] font-semibold text-muted mb-2">
                  <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                  {' · '}
                  {post.readingMinutes} min read
                  {' · '}
                  Team Pinstack
                </p>
                <h2 className="text-[17px] font-extrabold text-heading mb-1.5">{post.title}</h2>
                <p className="text-sm text-muted leading-relaxed mb-3">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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
              </Link>
            </article>
          ))}
        </ScrollReveal>
      </PageShell>
    </>
  );
}
