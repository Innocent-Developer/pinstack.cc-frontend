'use client';

import Header from '../../../../../components/Header';
import Footer from '../../../../../components/Footer';
import EditProductForm from '../../../../../components/EditProductForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main className="flex-1 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_280px)]">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <EditProductForm productId={params.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
