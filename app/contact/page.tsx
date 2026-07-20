import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import ContactForm from '../../components/ContactForm';
import { siteConfig, socialLinks } from '../../config/site';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Pinstack — Questions, Listing Help & Partnerships',
  description:
    'Get in touch with the Pinstack team about your listing, a partnership, or general questions. We read every message.',
  path: '/contact',
});

const contactTopics = [
  {
    title: 'List your product',
    body: 'Sign in and submit from your dashboard. Free listings are reviewed within a few days.',
    href: '/login?next=/dashboard/add-product',
    cta: 'Add a product',
  },
  {
    title: 'Featured placement',
    body: 'Get top placement in your category for 7 days with priority review.',
    href: '/contact?topic=featured',
    cta: 'Ask about featured',
  },
  {
    title: 'Verified badge',
    body: 'Show extra trust on your listing and embed a verified badge on your site.',
    href: '/contact?topic=verified',
    cta: 'Ask about verified',
  },
];

interface Props {
  searchParams: { topic?: string };
}

export default function ContactPage({ searchParams }: Props) {
  const topic = searchParams.topic?.toLowerCase();

  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1 flex flex-col overflow-x-hidden">
        <section className="bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)] border-b border-borderC">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <ScrollReveal>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-heading tracking-tight mb-3">
                Get in touch
              </h1>
              <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
                Questions about your listing, partnerships, or anything else — we read every
                message.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 sm:mb-14">
            {contactTopics.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-borderC bg-white p-5 flex flex-col min-w-0"
              >
                <h2 className="font-extrabold text-heading text-[15px] mb-1.5">{item.title}</h2>
                <p className="text-sm text-muted leading-relaxed mb-4 flex-1">{item.body}</p>
                <Link
                  href={item.href}
                  className="inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  {item.cta} →
                </Link>
              </div>
            ))}
          </ScrollReveal>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
            <ScrollReveal>
              <h2 className="text-xl font-extrabold text-heading mb-2">Send a message</h2>
              <p className="text-sm text-muted mb-6">
                Fill out the form and we will get back to you by email.
              </p>
              <div className="rounded-2xl border border-borderC bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <ContactForm initialReason={topic} />
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="rounded-2xl border border-borderC bg-bgAlt p-5 sm:p-6 space-y-6 lg:sticky lg:top-24">
                <div>
                  <h2 className="text-sm font-bold text-heading mb-1">Prefer email?</h2>
                  <p className="text-sm text-muted mb-2">
                    Reach us directly at{' '}
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-primary font-semibold hover:underline break-all"
                    >
                      {siteConfig.email}
                    </a>
                    {socialLinks.length > 0 && (
                      <>
                        {' '}
                        or find us on{' '}
                        {socialLinks.map((s, i) => (
                          <span key={s.key}>
                            {i > 0 && (i === socialLinks.length - 1 ? ', and ' : ', ')}
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-semibold hover:underline"
                            >
                              {s.label}
                            </a>
                          </span>
                        ))}
                        .
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-heading mb-1">Response time</h2>
                  <p className="text-sm text-muted leading-relaxed">
                    We typically reply within a few days. Featured and verified inquiries are
                    prioritized.
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-heading mb-1">Already have an account?</h2>
                  <p className="text-sm text-muted leading-relaxed mb-3">
                    Manage listings, edit products, and track views from your dashboard.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex px-4 py-2 rounded-full text-xs font-semibold border border-borderC bg-white text-heading hover:border-primary hover:text-primary"
                  >
                    Go to dashboard
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
