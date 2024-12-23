import { Product } from './product';

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  color: string;
  size: string;
  product_options?: string | Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderData {
  shipping_address_id: number;
  order_number?: string;
  total_amount: number;
  shipping_cost: number;
  tax_amount: number;
  status: string;
  notes?: string | null;
  payment_method: string;
  payment_status: string;
  order_items: {
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    color?: string | null;
    size?: string | null;
    product_options?: string | Record<string, any> | null;
  }[];
}

export interface Order {
  id?: number;
  order_number: string;
  user_id?: number;
  shipping_address_id?: number;
  total_amount: number;
  shipping_cost: number;
  tax_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at?: string;
  updated_at?: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  items?: OrderItem[];
  shipping_address?: ShippingAddress;
}

export interface ShippingAddress {
  id?: number;
  user_id?: number;
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code?: string | null;
  country: string;
  is_default?: boolean;
}

export interface CreateShippingAddressData {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code?: string | null;
  country: string;
  is_default?: boolean;
}

export interface OrderCreationResponse {
  id: number;
  order_number: string;
  message: string;
  order: Order;
}
