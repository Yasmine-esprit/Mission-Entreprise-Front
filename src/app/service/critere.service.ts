import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Critere } from '../models/critere.model';

@Injectable({
  providedIn: 'root'
})
export class CritereService {
  private apiUrl = 'http://localhost:8081/api/criteres'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<Critere[]> {
    return this.http.get<Critere[]>(this.apiUrl);
  }

  create(critere: Critere): Observable<Critere> {
    return this.http.post<Critere>(this.apiUrl, critere);
  }

  update(id: number, critere: Critere): Observable<Critere> {
    return this.http.put<Critere>(`${this.apiUrl}/${id}`, critere);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}