export interface Product {
  item_id: number;
  title: string;
  main_imgs: string | string[];  // Can be JSON string or parsed array
  price_min: string;
  price_max: string;
  unit_weight: string;
  prices: string;  // JSON string of price ranges
  sizes: string;   // JSON string of available sizes
}

export interface Price {
  beginAmount: string;
  price: string;
}

export interface Category {
  cate_id: string;
  cate_name: string;
  image_url?: string;
  product_count?: number;
  parent_id?: string;
}

export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
}

export interface Brand {
  id: number;
  name: string;
}