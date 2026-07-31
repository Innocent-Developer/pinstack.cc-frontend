import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check your email',
  description: 'We sent you a verification link - check your inbox to continue.',
  robots: { index: false, follow: false },
};

export default function CheckEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
