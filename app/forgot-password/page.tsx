import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import ForgotPasswordForm from '../../components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your Pinstack account password by email.',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password?"
      subtitle="We’ll email you a secure link to choose a new password."
      footer={
        <p className="text-xs text-muted">
          Need help?{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
