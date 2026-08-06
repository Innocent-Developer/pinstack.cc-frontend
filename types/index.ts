export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  aiDescription?: string | null;
  websiteUrl: string;
  logoUrl: string;
  screenshotUrls: string[];
  category: Category;
  /** All selected categories (preferred); falls back to `category` */
  categories?: Category[];
  tags: string[];
  /** Languages, frameworks, databases */
  techStack?: string[];
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  isFeatured: boolean;
  isVerified: boolean;
  /** Maker has admin account verification (green tick) */
  submitterAccountVerified?: boolean;
  badgeEmbedded?: boolean;
  badgeVerifiedAt?: string | null;
  planChoice?: 'free' | 'verified' | 'featured' | 'growth' | null;
  publishAt?: string | null;
  viewCount: number;
  websiteClickCount?: number;
  domainHost?: string | null;
  domainRating?: number | null;
  domainRatingUpdatedAt?: string | null;
  achievements?: Array<{
    _id?: string;
    type: 'top_of_month' | 'rising_star' | 'editors_pick' | 'launch_of_week';
    label: string;
    monthKey?: string | null;
    awardedAt?: string;
    active?: boolean;
  }>;
  socialLinks?: ProductSocialLinks;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductPageSnapshot {
  upvotes: number;
  categoryRank: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  domain: string | null;
  listedAt?: string | null;
}

export interface ProductDomainRatingInfo {
  value: number | null;
  updatedAt: string | null;
  host: string | null;
  trend: 'rising' | 'falling' | 'flat' | null;
  source: 'ahrefs';
  attribution: string;
  attributionUrl: string;
  checkerUrl: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface AutofillResponse {
  success: boolean;
  message?: string;
  data: {
    name: string | null;
    tagline: string | null;
    logoUrl: string | null;
    websiteUrl: string;
  } | null;
  missingFields: string[];
}

export interface Stats {
  products: number;
  founders: number;
  categories: number;
}

export type ProductSocialLinks = Partial<
  Record<'twitter' | 'linkedin' | 'github' | 'discord' | 'youtube' | 'instagram', string>
>;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  isAccountVerified?: boolean;
  accountVerifiedAt?: string | null;
  accountType?: 'personal' | 'company' | null;
  companyName?: string | null;
  slug?: string | null;
  bio?: string | null;
  website?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  joinedAt?: string | null;
}

export interface PublicMaker {
  id: string | null;
  slug: string | null;
  name: string;
  bio?: string | null;
  website?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  isAccountVerified?: boolean;
  accountVerifiedAt?: string | null;
  accountType?: 'personal' | 'company' | null;
  companyName?: string | null;
  joinedAt?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
  needsVerification?: boolean;
  email?: string;
}

export interface ProductReview {
  _id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  isVerifiedUser?: boolean;
}

export interface ReviewStats {
  count: number;
  average: number;
}

export interface ProductReviewsResponse {
  success: boolean;
  data: ProductReview[];
  stats: ReviewStats;
  pagination: Pagination;
}


