import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { sousTache } from '../models/sousTache.model';

@Injectable({
  providedIn: 'root'
})
export class sousTacheService {
  private apiUrl = 'http://localhost:8081/api/sousTaches';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getHttpOptions() {
    return {
      headers: this.getHeaders(),

      withCredentials: true
    };
  }

  getAll(): Observable<sousTache[]> {
    return this.http.get<sousTache[]>(`${this.apiUrl}`,this.getHttpOptions());
  }

  getById(id: number): Observable<sousTache> {
    return this.http.get<sousTache>(`${this.apiUrl}/getSousTache/${id}`,this.getHttpOptions());
  }

  create(sousTache: sousTache): Observable<sousTache> {
    return this.http.post<sousTache>(`${this.apiUrl}/addSousTache`, sousTache,this.getHttpOptions());
  }

  update(id: number, sousTache: sousTache): Observable<sousTache> {
    return this.http.put<sousTache>(`${this.apiUrl}/editSousTache/${id}`, sousTache,this.getHttpOptions());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteSousTache/${id}`,this.getHttpOptions());
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-all`,this.getHttpOptions());
  }

}
