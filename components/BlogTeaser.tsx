import Link from 'next/link';
import { formatBlogDate, getFeaturedBlogPosts, type BlogPost } from '../lib/blog';

export default function BlogTeaser({
  title = 'From the Pinstack blog',
  subtitle = 'Practical guides on directories, launch strategy, and developer tools.',
  limit = 3,
  posts,
}: {
  title?: string;
  subtitle?: string;
  limit?: number;
  posts?: BlogPost[];
}) {
  const list = posts || getFeaturedBlogPosts(limit);

  if (list.length === 0) return null;

  return (
    <section className="py-12 sm:py-14 border-t border-borderC bg-bgAlt" aria-labelledby="blog-teaser-heading">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 id="blog-teaser-heading" className="text-xl sm:text-2xl font-extrabold text-heading mb-1">
              {title}
            </h2>
            <p className="text-sm text-muted max-w-xl">{subtitle}</p>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-primary hover:underline shrink-0">
            View all posts →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block lift-card bg-white border border-borderC rounded-2xl p-5 hover:border-primary/40"
            >
              <p className="text-[11px] font-semibold text-muted mb-2">
                {formatBlogDate(post.publishedAt)} · {post.readingMinutes} min read
              </p>
              <h3 className="text-[15px] font-extrabold text-heading mb-2 leading-snug">{post.title}</h3>
              <p className="text-[13px] text-muted leading-relaxed line-clamp-3">{post.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
