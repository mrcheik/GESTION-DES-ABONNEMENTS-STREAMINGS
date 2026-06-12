import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Subscription,
  SubscriptionPayload,
} from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subscriptions/`;

  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.baseUrl);
  }

  getById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}${id}/`);
  }

  create(payload: SubscriptionPayload): Observable<Subscription> {
    return this.http.post<Subscription>(this.baseUrl, payload);
  }

  update(
    id: number,
    payload: Partial<SubscriptionPayload>
  ): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.baseUrl}${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}
