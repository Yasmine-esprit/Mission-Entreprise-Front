import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../models/projet.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private baseUrl = 'http://localhost:8089/api/projets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Projet[]> {
    return this.http.get<Projet[]>(this.baseUrl);
  }

  getById(id: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.baseUrl}/${id}`);
  }

  add(projet: Projet): Observable<Projet> {
    return this.http.post<Projet>(this.baseUrl, projet);
  }

  update(projet: Projet): Observable<Projet> {
    return this.http.put<Projet>(`${this.baseUrl}/${projet.idProjet}`, projet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
