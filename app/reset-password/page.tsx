import type { Metadata } from 'next';
import Link from 'next/link';
import AuthShell from '../../components/AuthShell';
import ResetPasswordForm from '../../components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Set new password',
  description: 'Choose a new password for your Pinstack account.',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Pick something strong you haven’t used elsewhere."
      footer={
        <p className="text-xs text-muted">
          Link expired?{' '}
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request a new one
          </Link>
        </p>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
