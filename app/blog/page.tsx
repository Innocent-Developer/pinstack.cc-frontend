import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import { getAllBlogPosts } from '../../lib/blog';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pinstack Blog — SaaS Directories, Launch Strategy & Developer Tools',
  description:
    'Practical guides for founders: free API testing tools, how to list your SaaS on directories, Product Hunt vs directories, and how Pinstack ranking works.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <PageShell className="max-w-[760px] py-12 sm:py-16">
      <ScrollReveal>
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Blog</p>
        <h1 className="text-3xl font-extrabold text-heading mb-3">Guides for founders & builders</h1>
        <p className="text-body mb-10 leading-relaxed">
          Plain, practical posts on directories, launch strategy, and developer tools — written to be
          useful, not hype.
        </p>
      </ScrollReveal>

      <ScrollReveal className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block border border-borderC rounded-2xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition"
          >
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
        ))}
      </ScrollReveal>
    </PageShell>
  );
}
