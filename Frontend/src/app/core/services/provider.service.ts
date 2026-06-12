import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Provider } from '../models/provider.model';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/providers`;

  getAll(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.baseUrl);
  }
}
