export interface Provider {
  id: number;
  name: string;
  logo: string | null;
  logo_url: string | null;
  description: string;
}

export interface ProviderPayload {
  name: string;
  description?: string;
  logo?: File | null;
}
