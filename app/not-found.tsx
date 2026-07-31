import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <p className="text-6xl font-extrabold text-primary mb-4" aria-hidden>
            404
          </p>
          <h1 className="text-2xl font-extrabold text-heading mb-3">
            This page doesn&apos;t exist
          </h1>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            The link may be broken, or the page may have been moved or removed.
            Try exploring the directory instead.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/explore"
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
            >
              Explore products
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full text-sm font-semibold border border-borderC text-heading hover:bg-bgAlt"
            >
              Go home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
