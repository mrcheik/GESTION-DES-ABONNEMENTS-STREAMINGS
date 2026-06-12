import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrder,
  AdminPayment,
  AdminStats,
  AdminUser,
  DeliveredCredential,
  DeliveredCredentialPayload,
  SupportMessage,
  SupportThread,
} from '../models/admin.model';
import { Subscription } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/`;

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}stats/`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}users/`);
  }

  activateUser(id: number): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}users/${id}/activate/`, {});
  }

  deactivateUser(id: number): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}users/${id}/deactivate/`, {});
  }

  makeAdmin(id: number): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}users/${id}/make_admin/`, {});
  }

  makeClient(id: number): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}users/${id}/make_client/`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}users/${id}/`);
  }

  getOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.baseUrl}orders/`);
  }

  validateOrder(id: number): Observable<AdminOrder> {
    return this.http.post<AdminOrder>(`${this.baseUrl}orders/${id}/validate/`, {});
  }

  refuseOrder(id: number): Observable<AdminOrder> {
    return this.http.post<AdminOrder>(`${this.baseUrl}orders/${id}/refuse/`, {});
  }

  changeOrderStatus(id: number, status: string): Observable<AdminOrder> {
    return this.http.post<AdminOrder>(`${this.baseUrl}orders/${id}/change_status/`, { status });
  }

  getPayments(): Observable<AdminPayment[]> {
    return this.http.get<AdminPayment[]>(`${this.baseUrl}payments/`);
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.baseUrl}subscriptions/`);
  }

  confirmPayment(id: number): Observable<AdminPayment> {
    return this.http.post<AdminPayment>(`${this.baseUrl}payments/${id}/confirm/`, {});
  }

  failPayment(id: number): Observable<AdminPayment> {
    return this.http.post<AdminPayment>(`${this.baseUrl}payments/${id}/fail/`, {});
  }

  getCredentials(): Observable<DeliveredCredential[]> {
    return this.http.get<DeliveredCredential[]>(`${this.baseUrl}credentials/`);
  }

  createCredential(payload: DeliveredCredentialPayload): Observable<DeliveredCredential> {
    return this.http.post<DeliveredCredential>(`${this.baseUrl}credentials/`, payload);
  }

  updateCredential(id: number, payload: Partial<DeliveredCredentialPayload>): Observable<DeliveredCredential> {
    return this.http.patch<DeliveredCredential>(`${this.baseUrl}credentials/${id}/`, payload);
  }

  deleteCredential(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}credentials/${id}/`);
  }

  getThreads(): Observable<SupportThread[]> {
    return this.http.get<SupportThread[]>(`${this.baseUrl}messages/`);
  }

  replyThread(id: number, body: string, status = 'open'): Observable<SupportMessage> {
    return this.http.post<SupportMessage>(`${this.baseUrl}messages/${id}/reply/`, { body, status });
  }

  closeThread(id: number): Observable<SupportThread> {
    return this.http.post<SupportThread>(`${this.baseUrl}messages/${id}/close/`, {});
  }
}
