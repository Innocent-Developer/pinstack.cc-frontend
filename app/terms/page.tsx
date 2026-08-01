import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import ScrollReveal from '../../components/ScrollReveal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { pageMetadata } from '../../lib/seo';
import { siteConfig } from '../../config/site';

export const metadata: Metadata = pageMetadata({
  title: 'Terms and Conditions',
  description:
    'Terms and conditions for using Pinstack — listings, accounts, payments, account verification, and community rules.',
  path: '/terms',
  openGraphTitle: 'Terms and Conditions | Pinstack',
  keywords: ['Pinstack terms', 'terms and conditions', 'SaaS directory terms'],
});

const updated = 'August 1, 2026';

export default function TermsPage() {
  return (
    <PageShell className="max-w-[760px] py-12 sm:py-16">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Terms', path: '/terms' },
        ]}
        className="mb-6"
      />

      <ScrollReveal>
        <h1 className="text-3xl font-extrabold text-heading mb-2">Terms and Conditions</h1>
        <p className="text-sm text-muted mb-8">Last updated: {updated}</p>
        <p className="text-body mb-10">
          These Terms and Conditions (“Terms”) govern your access to and use of {siteConfig.name}{' '}
          ({siteConfig.domain}), including product listings, accounts, voting, reviews, and paid
          services. By using the site you agree to these Terms. If you do not agree, do not use
          Pinstack.
        </p>
      </ScrollReveal>

      <div className="space-y-10 text-body text-[15px] leading-relaxed">
        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">1. Who we are</h2>
          <p>
            Pinstack is a product directory operated at {siteConfig.url}. Contact:{' '}
            <a href={`mailto:${siteConfig.email}`} className="text-primary font-semibold hover:underline">
              {siteConfig.email}
            </a>
            .
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">2. Eligibility</h2>
          <p>
            You must be at least 16 years old (or the age of digital consent in your country) to
            create an account. You are responsible for keeping your login credentials secure and for
            activity under your account.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">3. Accounts and verification</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-heading">Email verification</strong> confirms you own the
              email used to sign up (or you signed in with Google).
            </li>
            <li>
              <strong className="text-heading">Account verification</strong> (green tick) is a
              separate trust review. You may apply as a personal or company account. Free review
              typically takes up to 7 days; priority review ($9 one-time) targets under 24 hours
              after payment is confirmed.
            </li>
            <li>
              We may approve, reject, or revoke account verification at our discretion if
              information is incomplete, misleading, or abusive.
            </li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">4. Product listings</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              You must submit accurate product information (name, description, website, logo, and
              related media) that you have rights to publish.
            </li>
            <li>
              Free listings may require admin review before going live. Paid listing plans and
              account-verified makers may receive faster or instant listing as described on the
              site at the time of purchase or verification.
            </li>
            <li>
              We may reject, remove, or edit listings that are spam, illegal, misleading, adult,
              phishing, or otherwise harmful to the directory or users.
            </li>
            <li>
              Organic ranking is based on community signals (such as votes). Paid featured
              placement is labeled and kept separate from organic rank as described on Pricing.
            </li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">5. Paid services</h2>
          <p className="mb-3">
            Paid options may include listing plans (for example Verified, Featured, Growth) and
            priority account verification. Prices and benefits are shown on the relevant pages at
            checkout or request time and may change.
          </p>
          <p>
            Refunds are handled under our{' '}
            <Link href="/refund-policy" className="text-primary font-semibold hover:underline">
              Refund Policy
            </Link>
            .
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">6. Acceptable use</h2>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Manipulate votes, reviews, or rankings through fake accounts or automation</li>
            <li>Scrape the site in a way that harms performance or violates robots rules</li>
            <li>Upload malware, infringing content, or personal data you are not allowed to share</li>
            <li>Impersonate others or misrepresent affiliation with a company or product</li>
            <li>Use Pinstack to spam, harass, or break applicable law</li>
          </ul>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">7. Intellectual property</h2>
          <p>
            Pinstack’s brand, site design, and software are owned by us or our licensors. You keep
            ownership of content you submit (product copy, logos, screenshots). By submitting, you
            grant us a non-exclusive license to host, display, and promote that content in
            connection with the directory.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">8. Disclaimers</h2>
          <p>
            Pinstack is provided “as is.” We do not guarantee uninterrupted availability, ranking
            outcomes, or that listed products will meet your needs. Third-party products linked
            from the directory are not owned or controlled by us.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Pinstack and its operators are not liable for
            indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits, data, or goodwill arising from your use of the service. Our total liability for
            any claim related to paid services is limited to the amount you paid us for that
            service in the 3 months before the claim.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">10. Termination</h2>
          <p>
            You may stop using Pinstack at any time. We may suspend or terminate access if you
            breach these Terms or harm the service or community. Provisions that by nature should
            survive (IP, liability, refunds already processed) continue after termination.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">11. Changes</h2>
          <p>
            We may update these Terms from time to time. The “Last updated” date above will change
            when we do. Continued use after changes means you accept the updated Terms.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="text-xl font-extrabold text-heading mb-3">12. Contact</h2>
          <p>
            Questions about these Terms:{' '}
            <a href={`mailto:${siteConfig.email}`} className="text-primary font-semibold hover:underline">
              {siteConfig.email}
            </a>{' '}
            or our{' '}
            <Link href="/contact" className="text-primary font-semibold hover:underline">
              contact page
            </Link>
            .
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal className="mt-12 pt-8 border-t border-borderC flex flex-wrap gap-4 text-sm">
        <Link href="/refund-policy" className="font-semibold text-primary hover:underline">
          Refund Policy →
        </Link>
        <Link href="/about" className="font-semibold text-heading hover:underline">
          About
        </Link>
        <Link href="/pricing" className="font-semibold text-heading hover:underline">
          Pricing
        </Link>
      </ScrollReveal>
    </PageShell>
  );
}
