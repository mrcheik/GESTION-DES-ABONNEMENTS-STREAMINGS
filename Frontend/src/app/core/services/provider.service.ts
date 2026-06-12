import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Provider, ProviderPayload } from '../models/provider.model';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/providers/`;

  getAll(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.baseUrl);
  }

  getById(id: number): Observable<Provider> {
    return this.http.get<Provider>(`${this.baseUrl}${id}/`);
  }

  create(payload: ProviderPayload): Observable<Provider> {
    return this.http.post<Provider>(this.baseUrl, this.toFormData(payload));
  }

  update(id: number, payload: ProviderPayload): Observable<Provider> {
    return this.http.patch<Provider>(`${this.baseUrl}${id}/`, this.toFormData(payload));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }

  private toFormData(payload: ProviderPayload): FormData {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('description', payload.description ?? '');
    if (payload.logo) {
      formData.append('logo', payload.logo);
    }
    return formData;
  }
}
