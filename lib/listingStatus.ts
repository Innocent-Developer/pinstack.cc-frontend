import type { Product } from '../types';

/** True when votes / reviews / organic ranking are active. */
export function isProductLive(product: Pick<Product, 'status' | 'publishAt'>): boolean {
  if (product.status === 'rejected') return false;
  if (product.status === 'pending') return false;
  if (product.status && product.status !== 'approved') return false;
  if (!product.publishAt) return true;
  const at = new Date(product.publishAt);
  if (Number.isNaN(at.getTime())) return true;
  return at.getTime() <= Date.now();
}

export function listingStatusLabel(product: Pick<Product, 'status' | 'publishAt'>): string | null {
  if (product.status === 'pending') return 'Pending';
  if (product.status === 'approved' && product.publishAt) {
    const at = new Date(product.publishAt);
    if (!Number.isNaN(at.getTime()) && at.getTime() > Date.now()) return 'Scheduled';
  }
  return null;
}
