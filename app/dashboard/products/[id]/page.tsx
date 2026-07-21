'use client';

import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import SubmissionDetailPage from '../../../../components/SubmissionDetailPage';

export default function ProductViewPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_280px)]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <SubmissionDetailPage productId={params.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
