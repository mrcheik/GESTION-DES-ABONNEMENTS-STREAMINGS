export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id: number;
  user: number;
  plan: number;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
}

export interface SubscriptionPayload {
  plan: number;
  end_date: string;
  status?: SubscriptionStatus;
}
