export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  role?: UserRole;
  username?: string;
  email?: string;
}

export type UserRole = 'ADMIN' | 'CLIENT';
