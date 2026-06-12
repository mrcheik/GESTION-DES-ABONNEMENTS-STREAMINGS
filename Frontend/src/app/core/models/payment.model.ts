export type PaymentMethod = 'mtn' | 'orange' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: number;
  user: number;
  subscription: number;
  amount: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string;
  created_at: string;
}

export interface PaymentPayload {
  subscription: number;
  amount: string;
  payment_method: PaymentMethod;
  status?: PaymentStatus;
  transaction_id: string;
}
