'use client';

import Header from '../../../../../components/Header';
import Footer from '../../../../../components/Footer';
import EditProductForm from '../../../../../components/EditProductForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <main className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <EditProductForm productId={params.id} />
      </main>
      <Footer />
    </>
  );
}
