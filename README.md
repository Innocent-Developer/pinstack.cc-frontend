# Pinstack Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. Connects to the Pinstack backend (TS version) via `NEXT_PUBLIC_API_URL`.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local`, point `NEXT_PUBLIC_API_URL` at your running backend
3. `npm run dev`  starts on `http://localhost:3000`
4. `npm run build && npm start` for production

## Pages

- `/`  home (hero with lazy-loaded Three.js background, categories, trending listings, badge, CTA)
- `/about`  mission, how it works, what Pinstack is not
- `/pricing`  plan cards + FAQ accordion (with FAQPage schema)
- `/explore`  search/filter/sort + infinite "load more" + submit form (auto-fill or manual)
- `/contact`  validated contact form
- `/product/[slug]`  dynamic product detail page with dynamic meta tags + SoftwareApplication schema
- `/category/[slug]`  dynamic category browse page with dynamic meta tags
- `/sitemap.xml` and `/robots.txt`  auto-generated from live product/category data

## Key implementation notes

- **GSAP** scroll reveals live in `components/ScrollReveal.tsx`  wrap any section in it, pass `stagger` for grids. Respects `prefers-reduced-motion` automatically.
- **Three.js** hero background (`components/HeroBackground.tsx`) is lazy-loaded via `next/dynamic` with `ssr: false` in `app/page.tsx` only  never imported anywhere else, per design.md's scope rule (home hero only, decorative, must degrade gracefully).
- **Voting** happens client-side per card (`ProductCard.tsx`) and calls the backend directly  no page reload, updates score from the server response.
- **Submit flow** (`SubmitForm.tsx`) offers auto-fill (calls `/products/autofill`, pre-populates an editable form) or manual entry  matches the backend's `submissionMethod` tracking field.
- All product/category data fetching for pages happens server-side (React Server Components) for SEO  the browse/filter interactivity on `/explore` is the one page split into a client component (`ExploreResults.tsx`) since it needs live state.

## Known gaps to close before launch

- **Image domains:** `next/image` requires allow-listing external domains in `next.config.js` for product logos hosted elsewhere (R2, founders' own sites via autofill). Add a `next.config.js` with `images.remotePatterns` once your R2 bucket domain is known.
- **Admin dashboard:** not included here  this frontend is public-facing only. The admin approval queue, analytics view, and feature/verify toggles need their own protected UI (a simple separate app or a protected `/admin` route  not built here to keep this deliverable focused).
- **Error/loading states:** basic loading skeletons are included on Explore; add proper `loading.tsx` / `error.tsx` files per route for production polish.
- **OG images:** meta tags reference `/og/*.png` static images that don't exist yet  generate real Open Graph images before launch or remove those references.
