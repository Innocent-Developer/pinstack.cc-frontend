import type { Category, Product } from '../types';

/** Prefer `categories[]`; fall back to single `category` for older listings. */
export function productCategories(product: Product): Category[] {
  if (product.categories?.length) return product.categories;
  return product.category ? [product.category] : [];
}

export function toggleCategoryId(selected: string[], id: string, max = 5): string[] {
  if (selected.includes(id)) return selected.filter((x) => x !== id);
  if (selected.length >= max) return selected;
  return [...selected, id];
}
