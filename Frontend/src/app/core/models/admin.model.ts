import { Order } from './order.model';
import { Payment } from './payment.model';
import { Subscription } from './subscription.model';

export interface AdminStats {
  users: number;
  orders: number;
  payments: number;
  active_subscriptions: number;
  revenue: string;
  pending_orders: number;
  pending_payments: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  role: 'ADMIN' | 'CLIENT';
  date_joined: string;
  last_login: string | null;
  orders_count: number;
  subscriptions_count: number;
  payments_total: string;
}

export interface AdminOrder extends Order {
  username: string;
}

export interface AdminPayment extends Payment {
  username: string;
}

export interface DeliveredCredential {
  id: number;
  subscription: number;
  subscription_details?: Subscription;
  service_name: string;
  login_identifier: string;
  password: string;
  profile_name: string;
  notes: string;
  delivered_by?: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveredCredentialPayload {
  subscription: number;
  service_name: string;
  login_identifier: string;
  password: string;
  profile_name?: string;
  notes?: string;
}

export interface SupportMessage {
  id: number;
  thread: number;
  sender: number;
  sender_username: string;
  sender_role: 'ADMIN' | 'CLIENT';
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface SupportThread {
  id: number;
  user: number;
  user_username: string;
  subject: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
  unread_count: number;
}
