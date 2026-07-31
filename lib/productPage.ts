import { cache } from 'react';
import { api } from './api';

/**
 * Dedupes product-page fetches within one Next.js render
 * (generateMetadata + page share a single /products/page/:slug call).
 */
export const loadProductPage = cache(async (slug: string) => {
  return api.getProductPage(slug);
});
