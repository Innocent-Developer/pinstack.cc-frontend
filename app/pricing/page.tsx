import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import FaqAccordion from '../../components/FaqAccordion';
import { buildFaqSchema, pageMetadata, pricingFaqItems } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Pinstack Pricing  Free Listings, Paid Featured Placement',
  description:
    'List your SaaS or AI tool on Pinstack for free. Optional paid plans for featured placement and verified badges. No hidden fees.',
  path: '/pricing',
  openGraphDescription:
    'Free listings always available. Optional paid featured placement and verified badges.',
});

const faqSchema = buildFaqSchema(pricingFaqItems);

const plans = [
  {
    name: 'Free',
    price: 'Free',
    features: [
      'Basic listing, live on the directory',
      'Appears in search and category browse',
      'Standard review (a few days)',
    ],
    cta: 'Add Your Product',
    href: '/login?next=/dashboard/add-product',
    highlight: false,
  },
  {
    name: 'Featured',
    price: 'Contact us',
    features: [
      'Everything in Free',
      'Top placement in your category for 7 days',
      'Priority review (24–48 hours)',
    ],
    cta: 'Get Featured',
    href: '/contact?topic=featured',
    highlight: true,
  },
  {
    name: 'Verified',
    price: 'Contact us',
    features: [
      'Everything in Free',
      'Verified badge shown on your listing',
      'Embeddable "Verified on Pinstack" badge for your own site',
    ],
    cta: 'Get Verified',
    href: '/contact?topic=verified',
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
        <ScrollReveal className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-heading mb-2">Simple, transparent pricing</h1>
          <p className="text-body text-sm">
            A free listing is always available. Pay only if you want extra visibility.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-card border p-6 ${
                plan.highlight ? 'border-primary bg-bgAlt' : 'border-borderC bg-white'
              }`}
            >
              <h3 className="font-extrabold text-heading text-lg mb-1">{plan.name}</h3>
              <div className="text-2xl font-extrabold text-heading mb-4">{plan.price}</div>
              <ul className="space-y-2 mb-6 text-sm text-body">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-btn text-sm font-semibold ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-hover'
                    : 'border border-borderC text-heading hover:bg-bgAlt'
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
        </ScrollReveal>
      </PageShell>
    </>
  );
}
