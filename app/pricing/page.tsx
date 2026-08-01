import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import FaqAccordion from '../../components/FaqAccordion';
import BlogTeaser from '../../components/BlogTeaser';
import Breadcrumbs from '../../components/Breadcrumbs';
import { buildFaqSchema, pageMetadata, pricingFaqItems } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pinstack Pricing - Free Listings, Verified, Featured & Growth',
  description:
    'List your SaaS or AI tool on Pinstack for free. Optional Verified ($9 one-time), Featured ($5/mo), and Growth ($20/mo) plans. No hidden fees.',
  path: '/pricing',
  openGraphDescription:
    'Free listings always available. Verified $9 one-time, Featured $5/month, Growth $20/month.',
  keywords: ['Pinstack pricing', 'free SaaS listing', 'featured listing', 'verified badge'],
});

const faqSchema = buildFaqSchema(pricingFaqItems);

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'always free',
    blurb: 'Basic listing  forever free.',
    features: [
      'Basic listing, live on the directory',
      'Appears in search and category browse',
      'Standard review (a few days)',
      'Shareable product page',
    ],
    cta: 'Add Your Product',
    href: '/login?next=/dashboard/add-product',
    highlight: false,
  },
  {
    name: 'Verified',
    price: '$9',
    period: 'one-time',
    blurb: 'Show trust with a verified badge.',
    features: [
      'Everything in Free',
      'Verified badge on your listing',
      'Embeddable badge for your own site',
      'Does not affect organic ranking',
    ],
    cta: 'Get Verified',
    href: '/login?next=/dashboard/add-product',
    highlight: false,
  },
  {
    name: 'Featured',
    price: '$5',
    period: '/month',
    blurb: 'Top placement while your plan is active.',
    features: [
      'Everything in Free',
      'Top placement in your category',
      'Clearly marked as featured',
      'Cancel anytime  stays active for the paid period',
    ],
    cta: 'Get Featured',
    href: '/login?next=/dashboard/add-product',
    highlight: true,
  },
  {
    name: 'Growth',
    price: '$20',
    period: '/month',
    blurb: 'Featured + Verified, plus a one-time copy review.',
    features: [
      'Everything in Featured & Verified',
      'Verified badge + embeddable badge',
      'Top category placement while active',
      'One-time listing copy review & optimize at signup',
    ],
    cta: 'Get Growth',
    href: '/login?next=/dashboard/add-product',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageShell className="py-12 sm:py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', path: '/' },
            { name: 'Pricing', path: '/pricing' },
          ]}
          className="mb-6"
        />
        <ScrollReveal className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-heading mb-2">Simple, transparent pricing</h1>
          <p className="text-body text-sm max-w-lg mx-auto">
            A free listing is always available. Upgrade only if you want a verified badge, featured
            placement, or a one-time copy review.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'border-primary bg-bgAlt shadow-[0_0_0_1px_rgba(5,150,105,0.15)]'
                  : 'border-borderC bg-white'
              }`}
            >
              {plan.highlight && (
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-2">
                  Popular
                </p>
              )}
              <h3 className="font-extrabold text-heading text-lg mb-0.5">{plan.name}</h3>
              <p className="text-xs text-muted mb-4">{plan.blurb}</p>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-extrabold text-heading tabular-nums">{plan.price}</span>
                <span className="text-sm text-muted font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm text-body flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary shrink-0 font-bold">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-btn text-sm font-semibold transition ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-borderC text-heading hover:bg-bgAlt hover:border-primary/40'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </ScrollReveal>

        <ScrollReveal className="max-w-[700px] mx-auto mt-auto">
          <h2 className="text-xl font-extrabold text-heading mb-5 text-center">
            Frequently asked questions
          </h2>
          <FaqAccordion items={[...pricingFaqItems]} />
          <p className="text-sm text-muted text-center mt-6">
            Paid placement does not change organic rank  see{' '}
            <Link href="/blog/how-pinstack-ranking-works" className="text-primary font-semibold hover:underline">
              how ranking works
            </Link>
            . New to directories?{' '}
            <Link
              href="/blog/how-to-get-your-saas-listed-on-directories"
              className="text-primary font-semibold hover:underline"
            >
              How to get listed
            </Link>
            .
          </p>
        </ScrollReveal>
      </PageShell>
      <BlogTeaser
        title="Guides before you upgrade"
        subtitle="Understand ranking, directories, and launch order before you pay for placement."
      />
    </>
  );
}
