import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { pageMetadata } from '../../lib/seo';
import { siteConfig } from '../../config/site';

export const metadata: Metadata = pageMetadata({
  title: 'Refund Policy',
  description:
    'Pinstack refund policy for paid listing plans and priority account verification ($9).',
  path: '/refund-policy',
  openGraphTitle: 'Refund Policy | Pinstack',
  keywords: ['Pinstack refund', 'refund policy', 'listing refund'],
});

const updated = 'August 1, 2026';

export default function RefundPolicyPage() {
  return (
    <PageShell className="max-w-[760px] py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Refund Policy', path: '/refund-policy' },
        ]}
        className="mb-6"
      />

      <ScrollReveal>
        <h1 className="text-3xl font-extrabold text-heading mb-2">Refund Policy</h1>
        <p className="text-sm text-muted mb-8">Last updated: {updated}</p>
        <p className="text-body mb-10">
          This Refund Policy explains when you may receive a refund for paid services on{' '}
          {siteConfig.name} ({siteConfig.domain}). It works together with our{' '}
          <Link href="/terms" className="text-primary font-semibold hover:underline">
            Terms and Conditions
          </Link>
          .
        </p>
      </ScrollReveal>

      <div className="space-y-10 text-body text-[15px] leading-relaxed">
        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">1. Paid services covered</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-heading">Listing plans</strong> — such as Verified, Featured,
              or Growth (prices shown on{' '}
              <Link href="/pricing" className="text-primary font-semibold hover:underline">
                Pricing
              </Link>
              ).
            </li>
            <li>
              <strong className="text-heading">Priority account verification</strong> — one-time $9
              fee for faster review (target under 24 hours after payment is confirmed).
            </li>
          </ul>
          <p className="mt-3">
            Free listings and free account verification requests have no charge, so no refund
            applies.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">2. Priority account verification ($9)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-heading">Full refund</strong> if we have not started review
              and you cancel in writing within 24 hours of payment, or if we reject your
              verification request for reasons other than false or incomplete information you
              provided.
            </li>
            <li>
              <strong className="text-heading">No refund</strong> after we approve your account
              verification (green tick granted), or if rejection is due to misleading, spam, or
              incomplete applications after we spent review time.
            </li>
            <li>
              If review takes longer than 24 hours after we confirm payment, you may request either
              continued free-queue processing or a refund of the $9 priority fee.
            </li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">3. Paid listing plans</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-heading">Before go-live:</strong> If payment was taken but
              your listing has not been published (or scheduled publish has not occurred), contact
              us within 7 days for a full refund, unless the delay was caused by missing
              information you needed to provide.
            </li>
            <li>
              <strong className="text-heading">After go-live:</strong> Paid listing fees are
              generally non-refundable once the listing is live or the paid benefit (verified
              badge, featured placement, etc.) has been applied, because the service has been
              delivered.
            </li>
            <li>
              <strong className="text-heading">Our error:</strong> If we fail to deliver a clearly
              purchased benefit (for example featured placement never applied), we will either
              fulfill it or refund the unused portion at our discretion.
            </li>
            <li>
              Recurring or monthly plans (if offered) can be cancelled to stop future charges;
              fees already charged for a started period are not prorated unless required by law.
            </li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">4. How to request a refund</h2>
          <p className="mb-3">Email us with:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your account email</li>
            <li>What you paid for and approximate payment date</li>
            <li>Payment reference or receipt (if you have one)</li>
            <li>Reason for the request</li>
          </ul>
          <p className="mt-3">
            Send to{' '}
            <a href={`mailto:${siteConfig.email}?subject=Refund%20request`} className="text-primary font-semibold hover:underline">
              {siteConfig.email}
            </a>{' '}
            or use the{' '}
            <Link href="/contact" className="text-primary font-semibold hover:underline">
              contact form
            </Link>
            . We aim to respond within 3 business days.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">5. How refunds are paid</h2>
          <p>
            Approved refunds are returned to the original payment method when possible, usually
            within 5–10 business days after approval (timing depends on your bank or payment
            provider).
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">6. Chargebacks</h2>
          <p>
            Please contact us before filing a chargeback so we can help. Chargebacks opened without
            first contacting us may result in suspension of your account or listings while the
            dispute is resolved.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">7. Changes</h2>
          <p>
            We may update this policy. The “Last updated” date will change when we do. The policy
            in effect when you paid applies to that purchase.
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-12 pt-8 border-t border-borderC flex flex-wrap gap-4 text-sm">
        <Link href="/terms" className="font-semibold text-primary hover:underline">
          Terms and Conditions →
        </Link>
        <Link href="/pricing" className="font-semibold text-heading hover:underline">
          Pricing
        </Link>
        <Link href="/contact" className="font-semibold text-heading hover:underline">
          Contact
        </Link>
      </ScrollReveal>
    </PageShell>
  );
}
