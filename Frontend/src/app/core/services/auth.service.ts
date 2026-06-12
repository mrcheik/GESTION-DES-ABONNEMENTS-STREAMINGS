import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/users/`;

  login(credentials: LoginRequest): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(`${this.baseUrl}login/`, credentials)
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  register(payload: RegisterRequest): Observable<{ id: number; username: string; email: string }> {
    return this.http.post<{ id: number; username: string; email: string }>(
      `${this.baseUrl}register/`,
      payload
    );
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http
      .post<{ access: string }>(`${environment.apiUrl}/token/refresh/`, { refresh })
      .pipe(
        tap((res) => localStorage.setItem(ACCESS_TOKEN_KEY, res.access)),
        catchError((err) => {
          this.logout(false);
          return throwError(() => err);
        })
      );
  }

  logout(navigate = true): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    if (navigate) {
      this.router.navigate(['/login']);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getRole(): UserRole {
    const token = this.getAccessToken();
    if (!token) return 'CLIENT';
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { role?: UserRole };
      return payload.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
    } catch {
      return 'CLIENT';
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  }
}
