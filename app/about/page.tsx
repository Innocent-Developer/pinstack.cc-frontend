import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import BlogTeaser from '../../components/BlogTeaser';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About Pinstack  A Directory Built for Founders and Builders',
  description:
    'Pinstack is a community-run directory for SaaS, AI, and developer tools. Learn how listings work, how ranking works, and what Pinstack is not.',
  path: '/about',
  openGraphTitle: 'About Pinstack  A Directory Built for Founders and Builders',
  keywords: ['about Pinstack', 'SaaS directory', 'community ranking', 'product listing'],
});

export default function AboutPage() {
  return (
    <>
      <PageShell className="max-w-[760px] py-12 sm:py-16">
        <ScrollReveal>
          <h1 className="text-3xl font-extrabold text-heading mb-4">Why Pinstack exists</h1>
          <p className="text-body mb-10">
            Pinstack helps people discover useful software  SaaS products, AI tools, APIs, and
            developer tools  and helps the founders who build them get found. Listings are
            reviewed by a small team before going live, and rank based on real community upvotes.
          </p>
        </ScrollReveal>

        <ScrollReveal className="mb-10">
          <h2 className="text-xl font-extrabold text-heading mb-5">How it works</h2>
          <div className="space-y-5">
            {[
              {
                n: 1,
                t: 'Founders submit their product',
                b: "A founder submits their product's name, description, logo, and category  either by pasting their website URL for auto-fill, or filling the form manually.",
              },
              {
                n: 2,
                t: 'The team reviews the listing',
                b: 'Every submission is checked before it goes live, to keep the directory free of spam and low-quality listings.',
              },
              {
                n: 3,
                t: 'The community discovers and votes',
                b: 'Once live, anyone can browse, search, and upvote or downvote the listing. Ranking reflects real usage, not just who paid the most.',
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-4">
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-heading text-[15px]">{step.t}</h3>
                  <p className="text-sm text-muted">{step.b}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="mb-10">
          <h2 className="text-xl font-extrabold text-heading mb-4">What Pinstack is not</h2>
          <ul className="space-y-2 text-sm text-body list-disc pl-5">
            <li>
              Pinstack is not a pay-to-win ranking system. Featured placement is clearly marked as
              paid and kept separate from organic ranking.
            </li>
            <li>A free listing is always available and never expires.</li>
            <li>Verified badges are optional and paid, but do not affect search ranking.</li>
          </ul>
          <p className="text-sm text-body mt-4">
            Want the full ranking explanation? Read{' '}
            <Link
              href="/blog/how-pinstack-ranking-works"
              className="text-primary font-semibold hover:underline"
            >
              How we rank products on Pinstack
            </Link>
            . For launch strategy, see{' '}
            <Link
              href="/blog/saas-directory-vs-product-hunt"
              className="text-primary font-semibold hover:underline"
            >
              SaaS directory vs Product Hunt
            </Link>
            .
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-2">Contact</h2>
          <p className="text-sm text-body">
            Have a question, a listing issue, or a partnership idea?{' '}
            <Link href="/contact" className="text-primary font-semibold hover:underline">
              Visit the Contact page →
            </Link>
          </p>
        </ScrollReveal>
      </PageShell>
      <BlogTeaser
        title="Read more on the blog"
        subtitle="How ranking works, where to launch, and how to prepare a directory listing."
      />
    </>
  );
}
