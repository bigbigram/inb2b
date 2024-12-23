// Base Product interface for listing
export interface Product {
  id?: string | number;
  item_id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  price_min?: number | string;
  price_max?: number | string;
  thumbnail?: string;
  main_image?: string;
  images?: string[];
  main_imgs?: string;
  category_id?: string | number;
  brand?: string;
  rating?: number | string;
  stock?: number | string;
  variants?: string[];
  sizes?: string;
  specifications?: Record<string, any> | string;
  props_names?: string;
  // Add tax and logistics rate fields
  tax_rate?: string | number;
  taxRate?: string | number;
  logistic_rate?: string | number;
  logistic?: string | number;
  unit_weight?: string | number;
}

// Product Detail API Response interface
export interface ProductDetailResponse {
  item_id: number;
  title: string;
  main_imgs: string[];
  video_url?: string;
  price_min: string;
  price_max: string;
  unit_weight?: string;
  prices: string;
  sizes: string;
  description?: string;
  category_id?: string | number;
  brand?: string;
  rating?: number;
  stock?: number;
  specifications?: Record<string, any>;
  skus?: ProductSku[];
  // Add tax and logistics rate fields
  tax_rate?: string | number;
  taxRate?: string | number;
  logistic_rate?: string | number;
  logistic?: string | number;
}

export interface PriceTier {
  beginAmount: string;
  price: string;
}

export interface ProductSku {
  sku_id: string;
  props_names: string;  // Format: "color;size"
  color: string;
  size: string;
  stock_balance: string | number;
  price: number;
  color_images?: string[];
}

export interface ProductReview {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
}

export interface SizeGuide {
  size: string;
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  shoulder?: string;
  sleeve?: string;
}

export interface ApiResponse<T> {
  data: T[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

export interface ProductWithParsedData {
  item_id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  price_max: number;
  price_min: number;
  taxRate: number;
  logistic: number;
  unit_weight: number;
  thumbnail: string;
  images: string[];
  category_id: string;
  brand: string;
  rating: number;
  stock: number;
  variants: string[];
  specifications: Record<string, any>;
}

export interface SavedItem {
  product_id: number;
  sku_id?: string;
  color?: string;
  size?: string;
  date_saved: string;
}

// Category interface
export interface Category {
  cate_id: string;
  cate_name: string;
  image_url: string;
  cate_image?: string;
  product_count: number;
  parent_id: string | null;
}

// Category-wise product interfaces
export interface CategoryProduct {
  item_id: number;
  product_url: string;
  title: string;
  cate_id: string;
  cate_name: string;
  main_imgs: string[];
  video_url?: string;
  price_min: string;
  price_max: string;
  price?: string | number;
  tax_rate?: string;
  logistic_rate?: string;
  unit_weight?: string;
  skus?: Array<{
    sku_id: string;
    price: string;
    stock: number;
    properties: Record<string, string>;
  }>;
}

export interface CategoryPrice {
  beginAmount: string;
  price: string;
}

export interface ExtendedCategoryProduct extends CategoryProduct {
  price: string | number; // Make price required
  tax_rate: string;
  logistic_rate: string;
  unit_weight: string;
  price_max: string;
}

export interface CategoryProductResponse {
  success: boolean;
  message?: string;
  data: CategoryProduct[];
}
