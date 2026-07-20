import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import FaqAccordion from '../../components/FaqAccordion';

export const metadata: Metadata = {
  title: 'Pinstack Pricing  Free Listings, Paid Featured Placement',
  description:
    'List your SaaS or AI tool on Pinstack for free. Optional paid plans for featured placement and verified badges. No hidden fees.',
  alternates: { canonical: 'https://pinstack.cc/pricing' },
};

const faqItems = [
  { q: 'Is the free listing really free forever?', a: 'Yes. A free Pinstack listing does not expire and has no hidden fees.' },
  { q: 'Does paying for a featured or verified badge improve my search ranking?', a: 'No. Featured placement gives temporary top position in your category page, but organic ranking is based only on community upvotes, not payment.' },
  { q: 'Can I cancel featured placement?', a: 'Featured placement runs for a fixed period and does not auto-renew unless you choose to extend it.' },
  { q: 'How long does listing review take?', a: 'Free listings are typically reviewed within a few days. Featured listings get priority review within 24-48 hours.' },
  { q: 'Can I edit my listing after it is approved?', a: 'Yes, contact the team through the Contact page to request changes to a live listing.' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const plans = [
  {
    name: 'Free',
    price: 'Free',
    features: ['Basic listing, live on the directory', 'Appears in search and category browse', 'Standard review (a few days)'],
    cta: 'Add Your Product',
    href: '/login?next=/dashboard/add-product',
    highlight: false,
  },
  {
    name: 'Featured',
    price: 'Contact us',
    features: ['Everything in Free', 'Top placement in your category for 7 days', 'Priority review (24-48 hours)'],
    cta: 'Contact us',
    href: '/contact?topic=featured',
    highlight: true,
  },
  {
    name: 'Verified',
    price: 'Contact us',
    features: ['Everything in Free', 'Verified badge shown on your listing', 'Embeddable "Verified" badge for your own site'],
    cta: 'Contact us',
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
      <Header />
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <ScrollReveal className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-heading mb-2">Simple, transparent pricing</h1>
          <p className="text-body text-sm">A free listing is always available. Pay only if you want extra visibility.</p>
        </ScrollReveal>

        <ScrollReveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-card border p-6 ${
                plan.highlight ? 'border-primary bg-bgAlt' : 'border-borderC bg-white'
              }`}
            >
              <h2 className="font-extrabold text-heading text-lg mb-1">{plan.name}</h2>
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

        <ScrollReveal className="max-w-[700px] mx-auto">
          <h2 className="text-xl font-extrabold text-heading mb-5 text-center">Frequently asked questions</h2>
          <FaqAccordion items={faqItems} />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
