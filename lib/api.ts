const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `API request failed: ${res.status}`);
  }
  return data as T;
}

export const api = {
  getProducts: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch<import('../types').ProductListResponse>(`/products?${query}`);
  },
  getProductBySlug: (slug: string) =>
    apiFetch<{ success: boolean; data: import('../types').Product }>(`/products/${slug}`),
  getMyProducts: (token: string) =>
    apiFetch<{ success: boolean; data: import('../types').Product[] }>('/products/mine', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getMyProduct: (token: string, id: string) =>
    apiFetch<{ success: boolean; data: import('../types').Product }>(`/products/mine/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
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
    apiFetch<{ success: boolean; data: import('../types').Category[] }>('/categories'),
  autofill: (websiteUrl: string) =>
    apiFetch<import('../types').AutofillResponse>('/products/autofill', {
      method: 'POST',
      body: JSON.stringify({ websiteUrl }),
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
    }),
  submitProduct: (payload: Record<string, unknown>) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) }),
  uploadImages: async (
    token: string,
    files: { logo?: File | null; screenshots?: File[] }
  ): Promise<{ logoUrl?: string; screenshotUrls: string[] }> => {
    const form = new FormData();
    if (files.logo) form.append('logo', files.logo);
    (files.screenshots || []).forEach((f) => form.append('screenshots', f));

    const res = await fetch(`${API_BASE}/uploads/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { message?: string }).message || `Upload failed: ${res.status}`);
    }
    return (data as { data: { logoUrl?: string; screenshotUrls: string[] } }).data;
  },
  vote: (id: string, direction: 'up' | 'down') =>
    apiFetch<{ success: boolean; upvoteCount: number; downvoteCount: number; score: number }>(
      `/products/${id}/vote`,
      { method: 'POST', body: JSON.stringify({ direction }) }
    ),
  trackClick: (id: string) => apiFetch(`/products/${id}/click`, { method: 'POST' }),
  getProductReviews: (productId: string, page = 1) =>
    apiFetch<import('../types').ProductReviewsResponse>(
      `/products/${productId}/reviews?page=${page}&limit=10`
    ),
  getMyProductReview: (token: string, productId: string) =>
    apiFetch<{ success: boolean; data: import('../types').ProductReview | null }>(
      `/products/${productId}/reviews/mine`,
      { headers: { Authorization: `Bearer ${token}` } }
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
    apiFetch<{ success: boolean; data: import('../types').Stats }>('/stats'),
  signup: (payload: { name: string; email: string; password: string }) =>
    apiFetch<import('../types').AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    apiFetch<import('../types').AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  verifyEmail: (token: string) =>
    apiFetch<import('../types').AuthResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
  resendVerification: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  getMe: (token: string) =>
    apiFetch<{ success: boolean; user: import('../types').AuthUser }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
