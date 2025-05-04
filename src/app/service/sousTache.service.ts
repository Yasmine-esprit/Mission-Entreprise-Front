import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { sousTache } from '../models/sousTache.model';

@Injectable({
  providedIn: 'root'
})
export class sousTacheService {
  private apiUrl = 'http://localhost:8081/api/sousTaches';

  constructor(private http: HttpClient) {}

  getAll(): Observable<sousTache[]> {
    return this.http.get<sousTache[]>(this.apiUrl);
  }

  getById(id: number): Observable<sousTache> {
    return this.http.get<sousTache>(`${this.apiUrl}/${id}`);
  }

  create(sousTache: sousTache): Observable<sousTache> {
    return this.http.post<sousTache>(this.apiUrl, sousTache);
  }

  update(id: number, sousTache: sousTache): Observable<sousTache> {
    return this.http.put<sousTache>(`${this.apiUrl}/${id}`, sousTache);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
