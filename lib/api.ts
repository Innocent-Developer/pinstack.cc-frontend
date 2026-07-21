/**
 * Central API client.
 * Production default: https://api.pinstack.cc/api
 * Local: http://localhost:5000/api (via NEXT_PUBLIC_API_URL or NODE_ENV)
 */

const PROD_API = 'https://api.pinstack.cc/api';
const DEV_API = 'http://localhost:5000/api';

function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    // Never ship a localhost API URL into a real browser on pinstack.cc
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (
        (host === 'pinstack.cc' || host === 'www.pinstack.cc') &&
        fromEnv.includes('localhost')
      ) {
        return PROD_API;
      }
    }
    return fromEnv;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return DEV_API;
    return PROD_API;
  }

  return process.env.NODE_ENV === 'development' ? DEV_API : PROD_API;
}

export const API_BASE = resolveApiBase();

const DEFAULT_TIMEOUT_MS = 12_000;
const AUTH_TIMEOUT_MS = 10_000;

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { timeoutMs?: number; cacheMode?: RequestCache }
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, cacheMode, ...fetchOptions } = options || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Prefer caller signal if provided; otherwise use our timeout
  const signal = fetchOptions.signal ?? controller.signal;

  try {
    const res = await fetch(`${resolveApiBase()}${path}`, {
      ...fetchOptions,
      signal,
      // Public GETs can be cached by the browser/CDN; mutations stay no-store
      cache:
        cacheMode ??
        (fetchOptions.method && fetchOptions.method !== 'GET' ? 'no-store' : 'default'),
      headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message || `API request failed: ${res.status}`
      );
    }
    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out — check your connection and try again');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  getProducts: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch<import('../types').ProductListResponse>(`/products?${query}`, {
      cacheMode: 'no-store',
    });
  },
  getProductBySlug: (slug: string) =>
    apiFetch<{ success: boolean; data: import('../types').Product }>(`/products/${slug}`, {
      cacheMode: 'no-store',
    }),
  getMyProducts: (token: string) =>
    apiFetch<{ success: boolean; data: import('../types').Product[] }>('/products/mine', {
      headers: { Authorization: `Bearer ${token}` },
      cacheMode: 'no-store',
    }),
  getMyProduct: (token: string, id: string) =>
    apiFetch<{ success: boolean; data: import('../types').Product }>(`/products/mine/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cacheMode: 'no-store',
    }),
  updateMyProduct: (token: string, id: string, payload: Record<string, unknown>) =>
    apiFetch<{ success: boolean; data: import('../types').Product; message?: string }>(
      `/products/mine/${id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }
    ),
  deleteMyProduct: (token: string, id: string) =>
    apiFetch<{ success: boolean; message?: string }>(`/products/mine/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
  getCategories: () =>
    apiFetch<{ success: boolean; data: import('../types').Category[] }>('/categories', {
      cacheMode: 'no-store',
    }),
  autofill: (websiteUrl: string) =>
    apiFetch<import('../types').AutofillResponse>('/products/autofill', {
      method: 'POST',
      body: JSON.stringify({ websiteUrl }),
      timeoutMs: 15_000,
    }),
  aiAssist: (
    token: string,
    payload: {
      question: string;
      field?: 'tagline' | 'description' | 'name' | 'general';
      name?: string;
      tagline?: string;
      description?: string;
      websiteUrl?: string;
    }
  ) =>
    apiFetch<{ success: boolean; data: { answer: string } }>('/products/ai-assist', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      timeoutMs: 30_000,
    }),
  submitProduct: (payload: Record<string, unknown>) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(payload), timeoutMs: 30_000 }),
  uploadImages: async (
    token: string,
    files: { logo?: File | null; screenshots?: File[] }
  ): Promise<{ logoUrl?: string; screenshotUrls: string[] }> => {
    const form = new FormData();
    if (files.logo) form.append('logo', files.logo);
    (files.screenshots || []).forEach((f) => form.append('screenshots', f));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    try {
      const res = await fetch(`${resolveApiBase()}/uploads/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { message?: string }).message || `Upload failed: ${res.status}`);
      }
      return (data as { data: { logoUrl?: string; screenshotUrls: string[] } }).data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Upload timed out — try a smaller image or check your connection');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },
  uploadFromUrl: (
    token: string,
    imageUrl: string,
    folder: 'logos' | 'screenshots' = 'logos'
  ) =>
    apiFetch<{ success: boolean; data: { url: string; logoUrl?: string; screenshotUrl?: string } }>(
      '/uploads/from-url',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl, folder }),
        timeoutMs: 20_000,
      }
    ),
  vote: (token: string, id: string, direction: 'up' | 'down') =>
    apiFetch<{ success: boolean; upvoteCount: number; downvoteCount: number; score: number }>(
      `/products/${id}/vote`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ direction }),
      }
    ),
  trackClick: (id: string) => apiFetch(`/products/${id}/click`, { method: 'POST' }),
  getProductReviews: (productId: string, page = 1) =>
    apiFetch<import('../types').ProductReviewsResponse>(
      `/products/${productId}/reviews?page=${page}&limit=10`,
      { cacheMode: 'no-store' }
    ),
  getMyProductReview: (token: string, productId: string) =>
    apiFetch<{ success: boolean; data: import('../types').ProductReview | null }>(
      `/products/${productId}/reviews/mine`,
      { headers: { Authorization: `Bearer ${token}` }, cacheMode: 'no-store' }
    ),
  submitProductReview: (
    token: string,
    productId: string,
    payload: { rating: number; title?: string; comment: string }
  ) =>
    apiFetch<{
      success: boolean;
      data: import('../types').ProductReview;
      stats: import('../types').ReviewStats;
      message?: string;
    }>(`/products/${productId}/reviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateProductReview: (
    token: string,
    productId: string,
    reviewId: string,
    payload: { rating?: number; title?: string; comment?: string }
  ) =>
    apiFetch<{
      success: boolean;
      data: import('../types').ProductReview;
      stats: import('../types').ReviewStats;
    }>(`/products/${productId}/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  deleteProductReview: (token: string, productId: string, reviewId: string) =>
    apiFetch<{ success: boolean; stats: import('../types').ReviewStats; message?: string }>(
      `/products/${productId}/reviews/${reviewId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    ),
  submitContact: (payload: Record<string, unknown>) =>
    apiFetch('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  getStats: () =>
    apiFetch<{ success: boolean; data: import('../types').Stats }>('/stats', {
      cacheMode: 'no-store',
    }),
  signup: (payload: { name: string; email: string; password: string }) =>
    apiFetch<import('../types').AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: AUTH_TIMEOUT_MS,
    }),
  login: (payload: { email: string; password: string }) =>
    apiFetch<import('../types').AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeoutMs: AUTH_TIMEOUT_MS,
    }),
  verifyEmail: (token: string) =>
    apiFetch<import('../types').AuthResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
      timeoutMs: AUTH_TIMEOUT_MS,
    }),
  resendVerification: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
      timeoutMs: AUTH_TIMEOUT_MS,
    }),
  getMe: (token: string) =>
    apiFetch<{ success: boolean; user: import('../types').AuthUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cacheMode: 'no-store',
      timeoutMs: AUTH_TIMEOUT_MS,
    }),
};
