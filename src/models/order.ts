export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderDto {
  customer_id: string;
  items: OrderItem[];
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  notes?: string;
}
