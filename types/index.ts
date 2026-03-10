export type UserRole = 'super_admin' | 'parent' | 'driver';
export type OrderStatus = 'pending' | 'confirmed' | 'in_delivery' | 'delivered' | 'failed' | 'absent';
export type ProductCategory = 'uniforms' | 'books' | 'supplies' | 'canteen';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  qr_token: string;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  school_id: string;
  level_id?: string;
  class_id?: string;
  school?: { id: string; name: string };
  level?: { id: string; name: string };
  class?: { id: string; name: string };
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ProductCategory;
  image_url?: string;
  stock: number;
  is_active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  parent_id: string;
  student_id: string;
  driver_id?: string;
  status: OrderStatus;
  total_price: number;
  qr_token: string;
  created_at: string;
  student?: Student;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}