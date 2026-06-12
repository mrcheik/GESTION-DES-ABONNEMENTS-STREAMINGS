import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan, PlanPayload } from '../models/plan.model';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/plans/`;

  getAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.baseUrl);
  }

  getById(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.baseUrl}${id}/`);
  }

  create(payload: PlanPayload): Observable<Plan> {
    return this.http.post<Plan>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<PlanPayload>): Observable<Plan> {
    return this.http.patch<Plan>(`${this.baseUrl}${id}/`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`);
  }
}
