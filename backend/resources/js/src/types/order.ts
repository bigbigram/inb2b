import { Product } from './product';

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
}

export interface CreateOrderData {
  shippingAddressId: number;
  items: {
    productId: number;
    quantity: number;
    color?: string | null;
    size?: string | null;
  }[];
  notes?: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  shipping_address_id: number;
  total_amount: number;
  base_amount: number;
  tax_amount: number;
  logistics_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  shipping_address?: ShippingAddress;
}

export interface ShippingAddress {
  id: number;
  user_id: number;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface CreateShippingAddressData {
  user_id: number;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderCreationResponse {
  id: number;
  user_id: number;
  shipping_address_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}
