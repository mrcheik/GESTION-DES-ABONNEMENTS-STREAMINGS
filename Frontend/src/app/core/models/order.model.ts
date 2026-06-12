export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export interface Order {
  id: number;
  user: number;
  plan: number;
  plan_details?: import('./plan.model').Plan;
  amount: string;
  status: OrderStatus;
  created_at: string;
}

export interface OrderPayload {
  plan: number;
  amount: string;
  status?: OrderStatus;
}
