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
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  websiteClickCount?: number;
  socialLinks?: ProductSocialLinks;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
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


