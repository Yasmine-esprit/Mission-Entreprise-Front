import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Groupe } from '../models/groupe.model';

@Injectable({
  providedIn: 'root'
})
export class GroupeService {
  private baseUrl = 'http://localhost:8081/api/groupes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(this.baseUrl);
  }

  add(groupe: Groupe): Observable<Groupe> {
    return this.http.post<Groupe>(this.baseUrl, groupe);
  }

  update(groupe: Groupe): Observable<Groupe> {
    return this.http.put<Groupe>(`${this.baseUrl}/${groupe.idGroupe}`, groupe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<Groupe> {
    return this.http.get<Groupe>(`${this.baseUrl}/${id}`);
  }
}
