// Re-export types from product.ts
export type { ProductDetailResponse, PriceTier, ProductSku, ProductReview, SizeGuide, ApiResponse, ProductWithParsedData, SavedItem, CategoryProduct } from './product'

// Re-export auth types
export type { RegisterData, LoginData, AuthResponse, TokenData } from './auth'

// Extended Product interface with required cart fields
export interface Product {
  id?: string | number;
  item_id: number;
  title: string;
  name?: string;
  description?: string;
  prices?: string;
  price_min?: string;
  price_max?: string;
  unit_weight?: string;
  thumbnail?: string;
  main_image?: string;
  image?: string;
  images?: string[];
  main_imgs?: string | string[];
  category_id?: string | number;
  brand?: string;
  rating?: number | string;
  stock?: number | string;
  variants?: string[];
  sizes?: string;
  specifications?: Record<string, any> | string;
  video_url?: string;
  skus?: Array<{
    id: number;
    price: string;
    stock: number;
    color?: string;
    size?: string;
  }>;
}
