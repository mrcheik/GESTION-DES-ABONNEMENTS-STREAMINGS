import { Provider } from './provider.model';

export interface Plan {
  id: number;
  provider: number;
  provider_details?: Provider;
  name: string;
  price: string;
  duration_days: number;
}

export interface PlanPayload {
  provider: number;
  name: string;
  price: string;
  duration_days: number;
}
