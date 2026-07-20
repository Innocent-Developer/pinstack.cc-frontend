import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import LoginForm from '../../components/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your Pinstack account.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to upvote, submit products, and manage your Pinstack presence."
      footer={
        <p className="text-xs text-muted">
          By continuing you agree to discover great tools on{' '}
          <Link href="/" className="text-primary hover:underline">
            Pinstack
          </Link>
          .
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
