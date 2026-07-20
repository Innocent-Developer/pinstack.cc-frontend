import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import SignupForm from '../../components/SignupForm';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create a free Pinstack account and verify by email link.',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to join. We’ll send a verification link to unlock your account  s."
      footer={
        <p className="text-xs text-muted">
          Prefer browsing first?{' '}
          <Link href="/explore" className="text-primary hover:underline">
            Explore products
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
