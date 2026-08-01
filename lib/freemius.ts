/**
 * Freemius public config for the frontend.
 * Checkout URLs are created by the Backend (`POST /api/billing/checkout`).
 * Never put FREEMIUS_SECRET_KEY or FREEMIUS_API_KEY in Next.js env.
 */

export const freemiusPublic = {
  productId: process.env.NEXT_PUBLIC_FREEMIUS_PRODUCT_ID || '',
  publicKey: process.env.NEXT_PUBLIC_FREEMIUS_PUBLIC_KEY || '',
  plans: {
    verified: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_VERIFIED || '60140',
    featured: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_FEATURED || '60142',
    growth: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_GROWTH || '60143',
    accountVerify: process.env.NEXT_PUBLIC_FREEMIUS_PLAN_ACCOUNT_VERIFY || '60144',
  },
} as const;
