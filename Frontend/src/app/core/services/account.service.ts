import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeliveredCredential, SupportMessage, SupportThread } from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/account/`;

  getCredentials(): Observable<DeliveredCredential[]> {
    return this.http.get<DeliveredCredential[]>(`${this.baseUrl}credentials/`);
  }

  getThreads(): Observable<SupportThread[]> {
    return this.http.get<SupportThread[]>(`${this.baseUrl}messages/`);
  }

  createThread(subject: string): Observable<SupportThread> {
    return this.http.post<SupportThread>(`${this.baseUrl}messages/`, { subject });
  }

  sendMessage(threadId: number, body: string): Observable<SupportMessage> {
    return this.http.post<SupportMessage>(`${this.baseUrl}messages/${threadId}/message/`, { body });
  }
}
