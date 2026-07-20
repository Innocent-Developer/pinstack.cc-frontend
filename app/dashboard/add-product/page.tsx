import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import AddProductWizard from '../../../components/AddProductWizard';

export const metadata: Metadata = {
  title: 'Add your product',
  robots: { index: false, follow: false },
};

export default function AddProductPage() {
  return (
    <>
      <Header />
      <main className="max-w-[920px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary mb-1">Dashboard</p>
            <h1 className="text-3xl font-extrabold text-heading">Add your product</h1>
            <p className="text-sm text-muted mt-1">
              Multi-step listing · AI help · logo + up to 3 feature images (under 1 MB each)
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
            ← Back to dashboard
          </Link>
        </div>
        <AddProductWizard />
      </main>
      <Footer />
    </>
  );
}
