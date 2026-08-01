import type { Metadata } from 'next';
import BillingSuccessClient from './BillingSuccessClient';

export const metadata: Metadata = {
  title: 'Payment success',
  robots: { index: false, follow: false },
};

export default function BillingSuccessPage() {
  return <BillingSuccessClient />;
}
