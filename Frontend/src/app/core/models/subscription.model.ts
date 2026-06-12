export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface Subscription {
  id: number;
  user: number;
  plan: number;
  plan_details?: import('./plan.model').Plan;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
}

export interface SubscriptionPayload {
  plan: number;
  end_date: string;
  status?: SubscriptionStatus;
}
